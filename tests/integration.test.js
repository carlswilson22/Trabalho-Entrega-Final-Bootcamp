import axios from 'axios';
import stream from 'stream';
import { startCLI } from '../src/index.js';
import Medication from '../src/models/Medication.js';

jest.mock('axios');

describe('CLI Integration Tests (Entrada e Saída com Validação)', () => {
  let inputStream;
  let outputStream;
  let cli;

  beforeEach(() => {
    jest.clearAllMocks();
    Medication.find.mockResolvedValue([{ id: '123', nome: 'Ibuprofeno', dosagem: '400mg', horario: '10:00' }]);
    Medication.findOne.mockResolvedValue(null);

    inputStream = new stream.PassThrough();
    outputStream = new stream.PassThrough();
    cli = startCLI(inputStream, outputStream);
  });

  afterEach(() => {
    if (cli && cli.rl) cli.rl.close();
  });

  const sendInput = (text) => { inputStream.write(text + '\n'); };

  test('deve passar pelo fluxo de adicionar', async () => {
    axios.get.mockResolvedValue({ data: { city: 'São Paulo', neighborhood: 'Sé' } });
    sendInput('1');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('Aspirina');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('500mg');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('12:00');
    await new Promise(resolve => setTimeout(resolve, 50));
    sendInput('01001000');
    await new Promise(resolve => setTimeout(resolve, 100)); 
    
    expect(Medication.prototype.save).toHaveBeenCalled();
  });
});