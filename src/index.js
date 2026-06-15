#!/usr/bin/env node
import readline from 'readline';
import express from 'express'; // <-- Nova importação para a Web
import MedicationManager from './MedicationManager.js';
import { connectDB } from './db.js';
import { checkConnection } from './dbCheck.js'; // ou dbChecks.js (verifique seu nome exato)

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
    print("1. Adicionar Remédio | 2. Ver Agenda | 3. Remover | 4. Sair");
    const option = await askQuestion(`\n${colors.yellow}Escolha uma opção: ${colors.reset}`);
    await handleOption(option.trim());
  }

  async function handleOption(option) {
    switch (option) {
      case '1': await addMedicationPrompt(); break;
      case '2': await listMedications(); break;
      case '3': await removeMedicationPrompt(); break;
      case '4': print(`\n${colors.green}Encerrando...${colors.reset}`); rl.close(); return;
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
      await manager.addMedication(name, dosage, time, cep);
      print(`\n${colors.green}Sucesso!${colors.reset}`);
    } catch (e) {
      print(`\n${colors.red}Erro: ${e.message}${colors.reset}`);
    }
  }

  async function listMedications() {
    const meds = await manager.listAll();
    meds.forEach(m => print(`ID: ${m._id} | ${m.nome} | ${m.horario}`));
  }

  async function removeMedicationPrompt() {
    const id = await askQuestion('ID para remover: ');
    const removed = await manager.removeMedication(id);
    print(removed ? "Removido!" : "Erro ao remover.");
  }

  await showMenu();
}

// =====================================================================
// 🚀 LÓGICA DE AMBIENTE: WEB (Render) vs CLI (Local)
// O Render sempre fornece uma variável chamada PORT.
// =====================================================================

if (process.env.PORT) {
  // --- MODO NUVEM (Render) ---
  const app = express();
  
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #2b6cb0;">🚀 MedLembrete Online!</h1>
        <p>O servidor e o banco de dados estão conectados operacionais na nuvem.</p>
        <p><strong>Atenção:</strong> Esta é uma aplicação de terminal (CLI).</p>
        <p>Para interagir com o sistema, clone o repositório e rode <code>npm start</code> no seu computador.</p>
        <br>
        <a href="https://github.com/carlswilson22/Trabalho-Entrega-Final-Bootcamp" 
           style="padding: 10px 20px; background: #2b6cb0; color: white; text-decoration: none; border-radius: 5px;">
           Ver Projeto no GitHub
        </a>
      </div>
    `);
  });

  app.listen(process.env.PORT, async () => {
    await connectDB();
    console.log(`✅ [Web]: Servidor Render escutando na porta ${process.env.PORT}`);
  });

} else {
  // --- MODO LOCAL (Seu Computador) ---
  if (import.meta.url === `file://${process.argv[1]}`) {
    startCLI().catch(err => { console.error(err); process.exit(1); });
  }
}

export { startCLI };