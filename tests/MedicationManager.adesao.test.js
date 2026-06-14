import { jest } from '@jest/globals';
import MedicationManager from '../src/MedicationManager.js';
import Medication from '../src/models/Medication.js';

describe('MedicationManager - getAdesaoReport', () => {
  let manager;

  beforeEach(() => {
    manager = new MedicationManager();
    jest.clearAllMocks();
  });

  test('deve retornar relatório com contagem zero quando a base estiver vazia', async () => {
    // Mock do Mongoose Medication.find para retornar array vazio
    Medication.find = jest.fn().mockResolvedValue([]);

    const report = await manager.getAdesaoReport();

    expect(report.total).toBe(0);
    expect(report.periodos.manha).toBe(0);
    expect(report.periodos.tarde).toBe(0);
    expect(report.periodos.noite).toBe(0);
    expect(report.statusAgenda).toBe("Sua agenda está em transição");
    expect(report.alertaSobrecarregado).toBe(false);
  });

  test('deve classificar medicamentos por períodos corretamente', async () => {
    const mockMeds = [
      { nome: 'Remédio A', dosagem: '10mg', horario: '08:00', cep: '12345678' }, // Manhã
      { nome: 'Remédio B', dosagem: '20mg', horario: '11:59', cep: '12345678' }, // Manhã
      { nome: 'Remédio C', dosagem: '500mg', horario: '12:00', cep: '12345678' }, // Tarde
      { nome: 'Remédio D', dosagem: '2mg', horario: '17:30', cep: '12345678' }, // Tarde
      { nome: 'Remédio E', dosagem: '1g', horario: '18:00', cep: '12345678' }, // Noite
      { nome: 'Remédio F', dosagem: '1g', horario: '05:00', cep: '12345678' } // Noite
    ];

    Medication.find = jest.fn().mockResolvedValue(mockMeds);

    const report = await manager.getAdesaoReport();

    expect(report.total).toBe(6);
    expect(report.periodos.manha).toBe(2);
    expect(report.periodos.tarde).toBe(2);
    expect(report.periodos.noite).toBe(2);
  });

  test('deve retornar status "organizada" se houver mais de 3 itens', async () => {
    const mockMeds = [
      { nome: 'A', dosagem: '1', horario: '08:00' },
      { nome: 'B', dosagem: '1', horario: '09:00' },
      { nome: 'C', dosagem: '1', horario: '10:00' },
      { nome: 'D', dosagem: '1', horario: '11:00' }
    ];

    Medication.find = jest.fn().mockResolvedValue(mockMeds);

    const report = await manager.getAdesaoReport();

    expect(report.total).toBe(4);
    expect(report.statusAgenda).toBe("Sua agenda está organizada");
    expect(report.alertaSobrecarregado).toBe(false);
  });

  test('deve ativar alerta de sobrecarga se houver mais de 5 itens', async () => {
    const mockMeds = [
      { nome: 'A', dosagem: '1', horario: '08:00' },
      { nome: 'B', dosagem: '1', horario: '09:00' },
      { nome: 'C', dosagem: '1', horario: '10:00' },
      { nome: 'D', dosagem: '1', horario: '11:00' },
      { nome: 'E', dosagem: '1', horario: '12:00' },
      { nome: 'F', dosagem: '1', horario: '13:00' }
    ];

    Medication.find = jest.fn().mockResolvedValue(mockMeds);

    const report = await manager.getAdesaoReport();

    expect(report.total).toBe(6);
    expect(report.statusAgenda).toBe("Sua agenda está organizada");
    expect(report.alertaSobrecarregado).toBe(true);
  });
});
