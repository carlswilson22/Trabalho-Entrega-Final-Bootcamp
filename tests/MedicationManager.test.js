import MedicationManager from '../src/MedicationManager.js';
import Medication from '../src/models/Medication.js';

describe('MedicationManager (Testes Unitários)', () => {
  let manager;

  beforeEach(() => {
    manager = new MedicationManager();
    jest.restoreAllMocks();
  });

  test('deve salvar e listar um medicamento corretamente', async () => {
    const mockMed = { id: '123', nome: 'Aspirina', dosagem: '500mg', horario: '12:00' };
    
    jest.spyOn(Medication.prototype, 'save').mockResolvedValue(mockMed);
    jest.spyOn(Medication, 'find').mockResolvedValue([mockMed]);
    jest.spyOn(Medication, 'findOne').mockResolvedValue(null);

    const med = await manager.addMedication('Aspirina', '500mg', '12:00');
    
    expect(med.nome).toBe('Aspirina');
    expect(med.dosagem).toBe('500mg');
    expect(med.horario).toBe('12:00');

    const list = await manager.listAll();
    expect(list).toHaveLength(1);
  });

  test('deve lançar um erro se o nome do remédio estiver em branco', async () => {
    await expect(manager.addMedication('', '500mg', '12:00'))
      .rejects.toThrow("O nome do medicamento não pode ser vazio.");
  });

  test('deve lançar um erro se a dosagem for vazia ou inválida', async () => {
    await expect(manager.addMedication('Aspirina', '', '12:00'))
      .rejects.toThrow("A dosagem deve conter uma quantidade válida.");
  });

  test('deve lidar amigavelmente (sem crash) ao tentar remover um ID inexistente', async () => {
    jest.spyOn(Medication, 'findOneAndDelete').mockResolvedValue(null);
    const result = await manager.removeMedication('id-fake');
    expect(result).toBeNull();
  });

  test('deve exibir um alerta se houver conflito de horário', async () => {
    const medExistente = { nome: 'Dipirona', horario: '14:00' };
    jest.spyOn(Medication, 'findOne').mockResolvedValue(medExistente);
    jest.spyOn(Medication.prototype, 'save').mockResolvedValue({});
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await manager.addMedication('Aspirina', '500mg', '14:00');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️  [ALERTA DE AGENDA]'));
    consoleSpy.mockRestore();
  });
});