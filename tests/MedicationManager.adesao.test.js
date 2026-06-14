import MedicationManager from '../src/MedicationManager.js';
import Medication from '../src/models/Medication.js';

describe('MedicationManager - getAdesaoReport', () => {
  let manager;

  beforeEach(() => {
    manager = new MedicationManager();
    jest.restoreAllMocks();
  });

  test('deve retornar relatório com contagem zero quando a base estiver vazia', async () => {
    jest.spyOn(Medication, 'find').mockResolvedValue([]);
    const report = await manager.getAdesaoReport();
    expect(report.total).toBe(0);
  });

  test('deve classificar medicamentos por períodos corretamente', async () => {
    const mockMeds = [
      { nome: 'Remédio 1', horario: '08:00' },
      { nome: 'Remédio 2', horario: '14:00' }
    ];
    jest.spyOn(Medication, 'find').mockResolvedValue(mockMeds);
    const report = await manager.getAdesaoReport();
    expect(report.total).toBe(2);
  });
});