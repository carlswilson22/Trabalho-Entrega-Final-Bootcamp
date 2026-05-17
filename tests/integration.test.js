const axios = require('axios');
const stream = require('stream');
const { startCLI } = require('../src/index');

jest.mock('axios');

describe('CLI Integration Tests (Entrada e Saída com Validação)', () => {
  let inputStream;
  let outputStream;
  let cli;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configura streams em memória para simular stdin e stdout
    inputStream = new stream.PassThrough();
    outputStream = new stream.PassThrough();
    
    // Inicia o CLI com as streams mockadas
    cli = startCLI(inputStream, outputStream);
  });

  afterEach(() => {
    cli.rl.close();
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

  test('deve rejeitar nome vazio, hora inválida e CEP com letras, e depois agendar', async () => {
    axios.get.mockResolvedValue({ data: { city: 'São Paulo', neighborhood: 'Sé' } });

    getOutput();
    sendInput('1'); // Adicionar Remédio
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Testa Nome Vazio
    sendInput('   '); 
    await new Promise(resolve => setTimeout(resolve, 10));
    let output = getOutput();
    expect(output).toContain('⚠️ [AVISO] O nome do medicamento é obrigatório e não pode ficar em branco.');
    
    sendInput('Aspirina'); // Nome válido
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Testa Dosagem Inválida
    sendInput('0mg');
    await new Promise(resolve => setTimeout(resolve, 10));
    output = getOutput();
    expect(output).toContain('⚠️ [AVISO]: A dosagem é obrigatória e deve ser válida (Ex: 500mg, 1 comprimido). Tente novamente.');
    
    sendInput('apenas texto');
    await new Promise(resolve => setTimeout(resolve, 10));
    output = getOutput();
    expect(output).toContain('⚠️ [AVISO]: A dosagem é obrigatória e deve ser válida (Ex: 500mg, 1 comprimido). Tente novamente.');

    sendInput('500mg'); // Dosagem válida
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Testa Horário Inválido
    sendInput('25:99'); 
    await new Promise(resolve => setTimeout(resolve, 10));
    output = getOutput();
    expect(output).toContain('⚠️ [AVISO] Formato de horário inválido. Use o padrão HH:MM.');
    
    sendInput('12:00'); // Horário válido
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Testa CEP Inválido
    sendInput('1234abcd'); 
    await new Promise(resolve => setTimeout(resolve, 10));
    output = getOutput();
    expect(output).toContain('⚠️ [AVISO] CEP inválido. O CEP deve conter exatamente 8 números.');
    
    sendInput('01001000'); // CEP Válido
    await new Promise(resolve => setTimeout(resolve, 50));
    
    output = getOutput();
    expect(output).toContain('Localização confirmada: São Paulo - Sé');
    expect(output).toContain('Medicamento Aspirina agendado para as 12:00 com sucesso!');
    
    const meds = cli.manager.listAll();
    expect(meds).toHaveLength(1);
    expect(meds[0].name).toBe('Aspirina');
  });

  test('deve exibir mensagem de erro no CEP inexistente (404), mas agendar o medicamento', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    
    getOutput();
    sendInput('1');
    await new Promise(resolve => setTimeout(resolve, 10));
    sendInput('Paracetamol');
    await new Promise(resolve => setTimeout(resolve, 10));
    sendInput('750mg');
    await new Promise(resolve => setTimeout(resolve, 10));
    sendInput('08:00');
    await new Promise(resolve => setTimeout(resolve, 10));
    sendInput('99999999'); // CEP inexistente mas formato válido
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const output = getOutput();
    
    // Verifica a exata mensagem requerida pela regra de negócio
    expect(output).toContain('❌ [ERRO]: CEP não localizado na base de dados. Por favor, verifique o número.');
    expect(output).toContain('Medicamento Paracetamol agendado para as 08:00 com sucesso!');
    
    const meds = cli.manager.listAll();
    expect(meds).toHaveLength(1);
  });

  test('deve listar medicamentos salvos', async () => {
    cli.manager.addMedication('Ibuprofeno', '400mg', '10:00');
    
    getOutput();
    sendInput('2'); // Ver Agenda
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const output = getOutput();
    expect(output).toContain('Ibuprofeno');
    expect(output).toContain('400mg');
    expect(output).toContain('10:00');
  });

  test('deve remover medicamento pelo ID', async () => {
    const med = cli.manager.addMedication('Dipirona', '1g', '20:00');
    
    getOutput();
    sendInput('3'); // Remover
    await new Promise(resolve => setTimeout(resolve, 10));
    
    sendInput(med.id);
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const output = getOutput();
    expect(output).toContain(`Medicamento Dipirona removido com sucesso.`);
    
    expect(cli.manager.listAll()).toHaveLength(0);
  });
  
  test('deve encerrar o sistema', async () => {
    getOutput();
    sendInput('4'); // Sair
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const output = getOutput();
    expect(output).toContain('Encerrando o sistema. Até logo!');
  });
});
