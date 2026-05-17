#!/usr/bin/env node
const readline = require('readline');
const MedicationManager = require('./MedicationManager');

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function startCLI(inputStream = process.stdin, outputStream = process.stdout) {
  const manager = new MedicationManager();
  const rl = readline.createInterface({
    input: inputStream,
    output: outputStream
  });

  const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

  function print(msg) {
    outputStream.write(`${msg}\n`);
  }

  async function showMenu() {
    print(`\n${colors.cyan}=== Sistema de Lembrete de Medicamentos ===${colors.reset}`);
    print("1. Adicionar Remédio");
    print("2. Ver Agenda");
    print("3. Remover");
    print("4. Sair");
    
    const option = await askQuestion(`\n${colors.yellow}Escolha uma opção: ${colors.reset}`);
    await handleOption(option.trim());
  }

  async function handleOption(option) {
    switch (option) {
      case '1':
        await addMedicationPrompt();
        break;
      case '2':
        listMedications();
        break;
      case '3':
        await removeMedicationPrompt();
        break;
      case '4':
        print(`\n${colors.green}Encerrando o sistema. Até logo!${colors.reset}\n`);
        rl.close();
        return; // Retorna para quebrar o loop do menu
      default:
        print(`\n${colors.red}Opção inválida. Tente novamente.${colors.reset}`);
        break;
    }
    
    // Mostra o menu novamente após a ação terminar (exceto se for sair)
    if (option !== '4') {
      showMenu();
    }
  }

  async function addMedicationPrompt() {
    print(`\n${colors.blue}-- Novo Medicamento --${colors.reset}`);
    
    let name = '';
    let validName = false;
    while (!validName) {
      name = await askQuestion('Nome do medicamento: ');
      if (!name || name.trim() === '') {
        print(`${colors.yellow}⚠️ [AVISO] O nome do medicamento é obrigatório e não pode ficar em branco.${colors.reset}`);
      } else {
        name = name.trim();
        validName = true;
      }
    }

    let dosage = '';
    const dosageRegex = /^(\d+(?:[.,]\d+)?)\s*[a-zA-Z]+.*$/i;
    let validDosage = false;
    while (!validDosage) {
      dosage = await askQuestion('Dosagem (ex: 500mg): ');
      const match = dosage.trim().match(dosageRegex);
      if (!match || parseFloat(match[1].replace(',', '.')) <= 0) {
        print(`${colors.yellow}⚠️ [AVISO]: A dosagem é obrigatória e deve ser válida (Ex: 500mg, 1 comprimido). Tente novamente.${colors.reset}`);
      } else {
        dosage = dosage.trim();
        validDosage = true;
      }
    }

    let time = '';
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    let validTime = false;
    while (!validTime) {
      time = await askQuestion('Horário (HH:mm): ');
      if (!timeRegex.test(time.trim())) {
        print(`${colors.yellow}⚠️ [AVISO] Formato de horário inválido. Use o padrão HH:MM.${colors.reset}`);
      } else {
        time = time.trim();
        validTime = true;
      }
    }

    let cep = '';
    const cepRegex = /^\d{8}$/;
    let validCep = false;
    while (!validCep) {
      cep = await askQuestion('CEP do usuário (somente números): ');
      if (!cepRegex.test(cep.trim())) {
        print(`${colors.yellow}⚠️ [AVISO] CEP inválido. O CEP deve conter exatamente 8 números.${colors.reset}`);
      } else {
        cep = cep.trim();
        validCep = true;
      }
    }

    print(`\n${colors.yellow}Buscando localização...${colors.reset}`);
    const location = await manager.fetchLocationByCep(cep);

    if (location.erro) {
      print(`\n${colors.red}${location.erro}${colors.reset}`);
    } else {
      print(`\n${colors.green}Localização confirmada: ${location.cidade} - ${location.bairro}${colors.reset}`);
    }

    try {
      const med = manager.addMedication(name, dosage, time);
      print(`\n${colors.green}Medicamento ${med.name} agendado para as ${med.time} com sucesso!${colors.reset}`);
    } catch (error) {
      print(`\n${colors.red}Erro: ${error.message}${colors.reset}`);
    }
  }

  function listMedications() {
    const meds = manager.listAll();
    if (meds.length === 0) {
      print(`\n${colors.yellow}Nenhum medicamento agendado no momento.${colors.reset}`);
    } else {
      print(`\n${colors.blue}--- Agenda de Medicamentos ---${colors.reset}`);
      meds.forEach(med => {
        print(`ID: ${med.id} | Nome: ${med.name} | Dosagem: ${med.dosage} | Horário: ${med.time}`);
      });
    }
  }

  async function removeMedicationPrompt() {
    const meds = manager.listAll();
    if (meds.length === 0) {
      print(`\n${colors.yellow}Não há medicamentos para remover.${colors.reset}`);
      return;
    }

    print(`\n${colors.blue}--- Remover Medicamento ---${colors.reset}`);
    meds.forEach(med => {
      print(`ID: ${med.id} | Nome: ${med.name}`);
    });

    const id = await askQuestion(`\n${colors.yellow}Digite o ID do medicamento a remover: ${colors.reset}`);
    const removed = manager.removeMedication(id.trim());
    if (removed) {
      print(`\n${colors.green}Medicamento ${removed.name} removido com sucesso.${colors.reset}`);
    } else {
      print(`\n${colors.red}Erro: Medicamento com ID informado não encontrado.${colors.reset}`);
    }
  }

  showMenu();
  return { manager, rl };
}

if (require.main === module) {
  startCLI();
}

module.exports = { startCLI };
