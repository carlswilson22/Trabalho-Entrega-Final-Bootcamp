import { jest } from '@jest/globals';
import { describe, test, expect, beforeEach } from '@jest/globals';
import MedicationManager from '../src/MedicationManager.js';
import Medication from '../src/models/Medication.js';
import axios from 'axios';

describe('MedicationManager (Testes Unitários)', () => {
  let manager;

  beforeEach(() => {
    manager = new MedicationManager();
    // Limpa todos os mocks entre os testes
    jest.restoreAllMocks();
  });

  test('deve salvar um medicamento corretamente', async () => {
    const mockMed = { id: '123', nome: 'Aspirina', dosagem: '500mg', horario: '12:00' };
    
    // spyOn dinâmico para respeitar ES Modules
    jest.spyOn(Medication.prototype, 'save').mockResolvedValue(mockMed);
    jest.spyOn(Medication, 'findOne').mockResolvedValue(null);
    jest.spyOn(axios, 'get').mockResolvedValue({ data: { city: 'São Paulo', neighborhood: 'Sé' } });

    const med = await manager.addMedication('Aspirina', '500mg', '12:00', '01001000');
    expect(med.nome).toBe('Aspirina');
  });

  test('deve lançar um erro se o nome do remédio estiver em branco', async () => {
    await expect(manager.addMedication('', '500mg', '12:00', '01001000'))
      .rejects.toThrow("O nome do medicamento não pode ser vazio.");
  });

  test('deve exibir um alerta se houver conflito de horário', async () => {
    const medExistente = { nome: 'Dipirona', horario: '14:00' };
    
    jest.spyOn(Medication, 'findOne').mockResolvedValue(medExistente);
    jest.spyOn(Medication.prototype, 'save').mockResolvedValue({});
    jest.spyOn(axios, 'get').mockResolvedValue({ data: {} });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await manager.addMedication('Aspirina', '500mg', '14:00', '01001000');
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️  [ALERTA DE AGENDA]'));
    consoleSpy.mockRestore();
  });
});