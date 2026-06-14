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
    expect(report.periodos.manha).toBe(0);
  });

  test('deve classificar medicamentos por períodos corretamente', async () => {
    const mockMeds = [
      { nome: 'Remédio 1', horario: '08:00' },
      { nome: 'Remédio 2', horario: '10:30' },
      { nome: 'Remédio 3', horario: '14:00' },
      { nome: 'Remédio 4', horario: '16:15' },
      { nome: 'Remédio 5', horario: '20:00' },
      { nome: 'Remédio 6', horario: '02:00' }
    ];

    jest.spyOn(Medication, 'find').mockResolvedValue(mockMeds);

    const report = await manager.getAdesaoReport();

    expect(report.total).toBe(6);
    expect(report.periodos.manha).toBe(2);
    expect(report.periodos.tarde).toBe(2);
    expect(report.periodos.noite).toBe(1);
    expect(report.periodos.madrugada).toBe(1);
  });

  test('deve retornar status "organizada" se houver menos ou igual a 5 itens', async () => {
    const mockMeds = [
      { nome: 'A', horario: '08:00' },
      { nome: 'B', horario: '12:00' },
      { nome: 'C', horario: '18:00' },
      { nome: 'D', horario: '22:00' }
    ];

    jest.spyOn(Medication, 'find').mockResolvedValue(mockMeds);

    const report = await manager.getAdesaoReport();

    expect(report.total).toBe(4);
    expect(report.statusAgenda).toBe("Sua agenda está organizada");
  });

  test('deve ativar alerta de sobrecarga se houver mais de 5 itens', async () => {
    const mockMeds = [
      { nome: 'A', horario: '08:00' },
      { nome: 'B', horario: '10:00' },
      { nome: 'C', horario: '12:00' },
      { nome: 'D', horario: '14:00' },
      { nome: 'E', horario: '16:00' },
      { nome: 'F', horario: '18:00' }
    ];

    jest.spyOn(Medication, 'find').mockResolvedValue(mockMeds);

    const report = await manager.getAdesaoReport();

    expect(report.total).toBe(6);
    expect(report.statusAgenda).toBe("Alerta de sobrecarga de medicamentos");
  });
});