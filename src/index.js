#!/usr/bin/env node
import readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';
import MedicationManager from './MedicationManager.js';
import { connectDB } from './db.js';
import { checkConnection } from './dbCheck.js';

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

async function startCLI(inputStream = process.stdin, outputStream = process.stdout) {
  await connectDB();
  await checkConnection();

  const manager = new MedicationManager();
  const rl = readline.createInterface({ input: inputStream, output: outputStream });
  const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));
  function print(msg) { outputStream.write(`${msg}\n`); }

  async function showMenu() {
    print(`\n${colors.cyan}=== Sistema de Lembrete de Medicamentos ===${colors.reset}`);
    print("1. Adicionar Remédio | 2. Ver Agenda | 3. Remover | 4. Sair | 5. Ver Relatório de Adesão");
    const option = await askQuestion(`\n${colors.yellow}Escolha uma opção: ${colors.reset}`);
    await handleOption(option.trim());
  }

  async function handleOption(option) {
    switch (option) {
      case '1': await addMedicationPrompt(); break;
      case '2': await listMedications(); break;
      case '3': await removeMedicationPrompt(); break;
      case '4': print(`\n${colors.green}Encerrando...${colors.reset}`); rl.close(); return;
      case '5': await showAdesaoReportPrompt(); break;
      default: print(`${colors.red}Opção inválida.${colors.reset}`);
    }
    if (option !== '4') await showMenu();
  }

  async function addMedicationPrompt() {
    const name = await askQuestion('Nome: ');
    const dosage = await askQuestion('Dosagem: ');
    const time = await askQuestion('Horário (HH:mm): ');
    const cep = await askQuestion('CEP: ');

    try {
      // Como o manager agora é assíncrono, usamos await
      await manager.addMedication(name, dosage, time, cep);
      print(`\n${colors.green}Sucesso!${colors.reset}`);
    } catch (e) {
      print(`\n${colors.red}Erro: ${e.message}${colors.reset}`);
    }
  }

  async function listMedications() {
    const meds = await manager.listAll(); // Agora é await
    meds.forEach(m => print(`ID: ${m._id} | ${m.nome} | ${m.horario}`));
  }

  async function removeMedicationPrompt() {
    const id = await askQuestion('ID para remover: ');
    const removed = await manager.removeMedication(id);
    print(removed ? "Removido!" : "Erro ao remover.");
  }

  async function showAdesaoReportPrompt() {
    try {
      const report = await manager.getAdesaoReport();
      if (!report || report.total === 0) {
        print(`${colors.yellow}Nenhum dado para gerar relatório${colors.reset}`);
        return;
      }

      print(`\n${colors.cyan}=== Relatório de Adesão ===${colors.reset}`);
      print(`Total de medicamentos cadastrados: ${report.total}`);
      print(`${colors.yellow}Medicamentos por período:${colors.reset}`);
      print(`  - Manhã: ${report.periodos.manha}`);
      print(`  - Tarde: ${report.periodos.tarde}`);
      print(`  - Noite: ${report.periodos.noite}`);
      print(`${colors.green}Status da Agenda: ${report.statusAgenda}${colors.reset}`);

      if (report.alertaSobrecarregado) {
        print(`${colors.red}Atenção: Agenda cheia${colors.reset}`);
      }
    } catch (e) {
      print(`\n${colors.red}Erro ao gerar relatório: ${e.message}${colors.reset}`);
    }
  }

  await showMenu();
}

const isMainModule = () => {
  try {
    if (!process.argv[1]) return false;
    return path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
  } catch {
    return false;
  }
};

if (isMainModule()) {
  startCLI().catch(err => { console.error(err); process.exit(1); });
}

export { startCLI };