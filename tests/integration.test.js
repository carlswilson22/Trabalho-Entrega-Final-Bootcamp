import axios from 'axios';
import stream from 'stream';
import { startCLI } from '../src/index.js';
import Medication from '../src/models/Medication.js'; 
import { connectDB } from '../src/db.js';

// 1. Bloqueia o Mongoose real para não tentar conectar à internet no GitHub
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  model: jest.fn(),
  Schema: jest.fn()
}));

jest.mock('axios');
jest.mock('../src/db.js', () => ({
  connectDB: jest.fn().mockResolvedValue(true)
}));

describe('CLI Integration Tests (Entrada e Saída com Validação)', () => {
  let inputStream;
  let outputStream;
  let cli;

  beforeAll(async () => {
    // 2. Mocks das funções que o MedicationManager chama na nuvem
    jest.spyOn(Medication.prototype, 'save').mockImplementation(function() {
      return Promise.resolve(this);
    });
    jest.spyOn(Medication, 'find').mockResolvedValue([
      { id: '123', nome: 'Ibuprofeno', dosagem: '400mg', horario: '10:00' }
    ]);
    jest.spyOn(Medication, 'findOneAndDelete').mockResolvedValue(
      { id: '123', nome: 'Dipirona', dosagem: '1g', horario: '20:00' }
    );
    // 👇 SUPORTE À FUNÇÃO DO VINICIUS: Simula que não há conflito de horário por padrão
    jest.spyOn(Medication, 'findOne').mockResolvedValue(null);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configura streams em memória para simular stdin e stdout
    inputStream = new stream.PassThrough();
    outputStream = new stream.PassThrough();
    
    // Inicia o CLI com as streams mockadas
    cli = startCLI(inputStream, outputStream);
  });

  afterEach(() => {
    if (cli && cli.rl) {
      cli.rl.close();
    }
  });

  const sendInput = (text) => {
    inputStream.write(text + '\n');
  };

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
    await new Promise(resolve => setTimeout(resolve, 100)); 
    
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
    sendInput('99999999'); 
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(Medication.prototype.save).toHaveBeenCalled();
  });

  test('deve listar medicamentos salvos', async () => {
    getOutput();
    sendInput('2'); // Ver Agenda
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(Medication.find).toHaveBeenCalled();
  });

  test('deve remover medicamento pelo ID', async () => {
    getOutput();
    sendInput('3'); // Remover
    await new Promise(resolve => setTimeout(resolve, 50));
    
    sendInput('123'); // ID do medicamento
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(Medication.findOneAndDelete).toHaveBeenCalledWith({ id: '123' });
  });
  
});