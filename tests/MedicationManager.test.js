import MedicationManager from '../src/MedicationManager.js';
import Medication from '../src/models/Medication.js';

// Fingimos (mock) o banco de dados para testar só a lógica do seu código
jest.mock('../src/models/Medication.js');

describe('MedicationManager (Testes Unitários)', () => {
  let manager;

  beforeEach(() => {
    manager = new MedicationManager();
    jest.clearAllMocks();
  });

  // 1. Caminho Feliz
  test('deve salvar e listar um medicamento corretamente', async () => {
    // Prepara o mock para simular o comportamento do MongoDB
    const mockMed = { id: '123', nome: 'Aspirina', dosagem: '500mg', horario: '12:00' };
    Medication.prototype.save.mockResolvedValue(mockMed);
    Medication.find.mockResolvedValue([mockMed]);
    Medication.findOne.mockResolvedValue(null); // Sem conflito neste teste

    // Ação: Agendar medicamento (com await)
    const med = await manager.addMedication('Aspirina', '500mg', '12:00');
    
    // Verificações baseadas no modelo do banco
    expect(Medication.prototype.save).toHaveBeenCalled();
    expect(med.nome).toBe('Aspirina');
    expect(med.dosagem).toBe('500mg');
    expect(med.horario).toBe('12:00');

    // Verificações na lista
    const list = await manager.listAll();
    expect(list).toHaveLength(1);
    expect(list[0].nome).toBe('Aspirina');
  });

  // 2. Entrada Inválida
  test('deve lançar um erro se o nome do remédio estiver em branco', async () => {
    // Tratamento de erro assíncrono com Jest
    await expect(manager.addMedication('', '500mg', '12:00'))
      .rejects.toThrow("O nome do medicamento não pode ser vazio.");
    
    await expect(manager.addMedication('   ', '200mg', '08:00'))
      .rejects.toThrow("O nome do medicamento não pode ser vazio.");
  });

  test('deve lançar um erro se a dosagem for vazia ou inválida', async () => {
    await expect(manager.addMedication('Aspirina', '', '12:00'))
      .rejects.toThrow("A dosagem deve conter uma quantidade válida.");

    await expect(manager.addMedication('Aspirina', 'comprimido', '12:00'))
      .rejects.toThrow("A dosagem deve conter uma quantidade válida.");

    await expect(manager.addMedication('Aspirina', '0mg', '12:00'))
      .rejects.toThrow("A dosagem deve conter uma quantidade válida.");
  });

  // 3. Caso Limite (Edge Case)
  test('deve lidar amigavelmente (sem crash) ao tentar remover um ID inexistente', async () => {
    Medication.findOneAndDelete.mockResolvedValue(null);

    const removedId = 'id-fake-nao-existente-123';
    const result = await manager.removeMedication(removedId);
    
    expect(result).toBeNull();
  });

  // 4. Teste da Nova Funcionalidade do Vinicius
  test('deve exibir um alerta se houver conflito de horário', async () => {
    // Simula que já existe um remédio nesse mesmo horário no MongoDB
    const medExistente = { nome: 'Dipirona', horario: '14:00' };
    Medication.findOne.mockResolvedValue(medExistente);
    Medication.prototype.save.mockResolvedValue({});

    // Espiona o console.log para ver se o alerta amarelo roda
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await manager.addMedication('Aspirina', '500mg', '14:00');

    // Verifica se a mensagem de alerta foi disparada no terminal
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('⚠️  [ALERTA DE AGENDA]')
    );

    consoleSpy.mockRestore();
  });
});