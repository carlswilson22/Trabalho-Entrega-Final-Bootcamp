#!/usr/bin/env node
const readline = require('readline');
const MedicationManager = require('./src/MedicationManager');

const manager = new MedicationManager();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function showMenu() {
  console.log(`\n${colors.cyan}=== Sistema de Lembrete de Medicamentos ===${colors.reset}`);
  console.log("1. Adicionar Remédio");
  console.log("2. Ver Agenda");
  console.log("3. Remover");
  console.log("4. Sair");
  
  rl.question(`\n${colors.yellow}Escolha uma opção: ${colors.reset}`, (option) => {
    handleOption(option.trim());
  });
}

function handleOption(option) {
  switch (option) {
    case '1':
      addMedicationPrompt();
      break;
    case '2':
      listMedications();
      break;
    case '3':
      removeMedicationPrompt();
      break;
    case '4':
      console.log(`\n${colors.green}Encerrando o sistema. Até logo!${colors.reset}\n`);
      rl.close();
      break;
    default:
      console.log(`\n${colors.red}Opção inválida. Tente novamente.${colors.reset}`);
      showMenu();
      break;
  }
}

function addMedicationPrompt() {
  console.log(`\n${colors.blue}-- Novo Medicamento --${colors.reset}`);
  rl.question('Nome do medicamento: ', (name) => {
    rl.question('Dosagem (ex: 500mg): ', (dosage) => {
      rl.question('Horário (HH:mm): ', (time) => {
        rl.question('CEP do usuário (somente números): ', async (cep) => {
          // Busca localização pelo CEP
          console.log(`\n${colors.yellow}Buscando localização...${colors.reset}`);
          const location = await manager.fetchLocationByCep(cep);

          if (location.erro) {
            console.log(`\n${colors.red}${location.erro}${colors.reset}`);
          } else {
            console.log(`\n${colors.green}Localização confirmada: ${location.cidade} - ${location.bairro}${colors.reset}`);
          }

          // Registra o medicamento independentemente do resultado do CEP
          try {
            const med = manager.addMedication(name, dosage, time);
            console.log(`\n${colors.green}Medicamento ${med.name} agendado para as ${med.time} com sucesso!${colors.reset}`);
          } catch (error) {
            console.log(`\n${colors.red}Erro: ${error.message}${colors.reset}`);
          }
          showMenu();
        });
      });
    });
  });
}

function listMedications() {
  const meds = manager.listAll();
  if (meds.length === 0) {
    console.log(`\n${colors.yellow}Nenhum medicamento agendado no momento.${colors.reset}`);
  } else {
    console.log(`\n${colors.blue}--- Agenda de Medicamentos ---${colors.reset}`);
    const tableData = meds.map(med => ({
      ID: med.id,
      Nome: med.name,
      Dosagem: med.dosage,
      Horário: med.time
    }));
    console.table(tableData);
  }
  showMenu();
}

function removeMedicationPrompt() {
  const meds = manager.listAll();
  if (meds.length === 0) {
    console.log(`\n${colors.yellow}Não há medicamentos para remover.${colors.reset}`);
    return showMenu();
  }

  console.log(`\n${colors.blue}--- Remover Medicamento ---${colors.reset}`);
  const tableData = meds.map(med => ({
    ID: med.id,
    Nome: med.name
  }));
  console.table(tableData);

  rl.question(`\n${colors.yellow}Digite o ID do medicamento a remover: ${colors.reset}`, (id) => {
    const removed = manager.removeMedication(id.trim());
    if (removed) {
      console.log(`\n${colors.green}Medicamento ${removed.name} removido com sucesso.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}Erro: Medicamento com ID informado não encontrado.${colors.reset}`);
    }
    showMenu();
  });
}

// Inicializa o menu principal
showMenu();
