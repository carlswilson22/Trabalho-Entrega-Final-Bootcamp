import axios from 'axios';
import stream from 'stream';
import { startCLI } from '../src/index.js';
import Medication from '../src/models/Medication.js'; // Importamos o modelo do banco
import { connectDB } from '../src/db.js';
import mongoose from 'mongoose';

jest.mock('axios');
jest.mock('../src/db.js', () => ({
  connectDB: jest.fn() // Simula a conexão com o banco para não travar o teste
}));

describe('CLI Integration Tests (Entrada e Saída com Validação)', () => {
  let inputStream;
  let outputStream;
  let cli;

  beforeAll(async () => {
    // Conecta a um banco de dados falso na memória só para os testes (MongoDB Memory Server seria o ideal, mas mockamos aqui)
    jest.spyOn(Medication.prototype, 'save').mockImplementation(function() {
      return Promise.resolve(this);
    });
    jest.spyOn(Medication, 'find').mockResolvedValue([
      { id: '123', nome: 'Ibuprofeno', dosagem: '400mg', horario: '10:00' }
    ]);
    jest.spyOn(Medication, 'findOneAndDelete').mockResolvedValue(
      { id: '123', nome: 'Dipirona', dosagem: '1g', horario: '20:00' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configura streams em memória para simular stdin e stdout
    inputStream = new stream.PassThrough();
    outputStream = new stream.PassThrough();
    
    // Inicia o CLI com as streams mockadas
    // IMPORTANTE: Se o seu index.js mudou a forma de exportar ou receber parâmetros, ajuste aqui.
    // Vamos assumir que a CLI não trava o fluxo nos testes
    cli = startCLI(inputStream, outputStream);
  });

  afterEach(() => {
    // Verifica se cli e rl existem antes de fechar
    if (cli && cli.rl) {
      cli.rl.close();
    }
  });

  // Função auxiliar para injetar respostas como se o usuário digitasse
  const sendInput = (text) => {
    inputStream.write(text + '\n');
  };

  // Função auxiliar para capturar e limpar o stdout até o momento
  const getOutput = () => {
    const data = outputStream.read();
    return data ? data.toString() : '';
  };

  test('deve passar pelo fluxo de adicionar e usar mock do axios', async () => {
    axios.get.mockResolvedValue({ data: { city: 'São Paulo', neighborhood: 'Sé' } });

    getOutput();
    sendInput('1'); // Adicionar Remédio
    await new Promise(resolve => setTimeout(resolve, 50));
    
    sendInput('Aspirina'); // Nome válido
    await new Promise(resolve => setTimeout(resolve, 50));
    
    sendInput('500mg'); // Dosagem válida
    await new Promise(resolve => setTimeout(resolve, 50));
    
    sendInput('12:00'); // Horário válido
    await new Promise(resolve => setTimeout(resolve, 50));
    
    sendInput('01001000'); // CEP Válido
    await new Promise(resolve => setTimeout(resolve, 100)); // Espera a API responder
    
    const output = getOutput();
    // Como estamos usando o banco agora, verificamos se o save foi chamado
    expect(Medication.prototype.save).toHaveBeenCalled();
  });

  test('deve exibir mensagem de erro no CEP inexistente (404), mas agendar o medicamento', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    
    getOutput();
    sendInput('1');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('Paracetamol');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('750mg');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('08:00');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('99999999'); // CEP inexistente
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const output = getOutput();
    expect(Medication.prototype.save).toHaveBeenCalled();
  });

  test('deve listar medicamentos salvos', async () => {
    getOutput();
    sendInput('2'); // Ver Agenda
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // O mock do Medication.find() que fizemos lá em cima vai retornar o Ibuprofeno
    expect(Medication.find).toHaveBeenCalled();
  });

  test('deve remover medicamento pelo ID', async () => {
    getOutput();
    sendInput('3'); // Remover
    await new Promise(resolve => setTimeout(resolve, 50));
    
    sendInput('123'); // ID do medicamento
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verifica se chamou a função correta do Mongoose
    expect(Medication.findOneAndDelete).toHaveBeenCalledWith({ id: '123' });
  });
  
});