const MedicationManager = require('../src/MedicationManager');

describe('MedicationManager (Testes Unitários)', () => {
  let manager;

  beforeEach(() => {
    // Nova instância limpa antes de cada teste
    manager = new MedicationManager();
  });

  // 1. Caminho Feliz
  test('deve salvar e listar um medicamento corretamente', () => {
    // Ação: Agendar medicamento
    const med = manager.addMedication('Aspirina', '500mg', '12:00');
    
    // Verificações do objeto salvo
    expect(med).toHaveProperty('id');
    expect(med.name).toBe('Aspirina');
    expect(med.dosage).toBe('500mg');
    expect(med.time).toBe('12:00');

    // Verificações na lista
    const list = manager.listAll();
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual(med);
  });

  // 2. Entrada Inválida
  test('deve lançar um erro se o nome do remédio estiver em branco', () => {
    // Testando com string vazia
    expect(() => {
      manager.addMedication('', '500mg', '12:00');
    }).toThrow("O nome do medicamento não pode ser vazio.");
    
    // Testando com espaços em branco apenas
    expect(() => {
      manager.addMedication('   ', '200mg', '08:00');
    }).toThrow("O nome do medicamento não pode ser vazio.");
  });

  test('deve lançar um erro se a dosagem for vazia ou inválida', () => {
    // Vazia
    expect(() => {
      manager.addMedication('Aspirina', '', '12:00');
    }).toThrow("A dosagem deve conter uma quantidade válida");

    // Inválida (sem número)
    expect(() => {
      manager.addMedication('Aspirina', 'comprimido', '12:00');
    }).toThrow("A dosagem deve conter uma quantidade válida");

    // Inválida (zero ou negativo)
    expect(() => {
      manager.addMedication('Aspirina', '0mg', '12:00');
    }).toThrow("A dosagem deve conter uma quantidade válida");
  });

  // 3. Caso Limite (Edge Case)
  test('deve lidar amigavelmente (sem crash) ao tentar remover um ID inexistente', () => {
    // Registra alguns
    manager.addMedication('Paracetamol', '500mg', '08:00');
    
    // Grava quantidade inicial
    const totalInicial = manager.listAll().length;

    // Ação: Tentar remover com UUID que não existe neste gerenciador
    const removedId = 'id-fake-nao-existente-123';
    const result = manager.removeMedication(removedId);
    
    // Verificação de que não crachou e retornou nulo (conforme nossa lógica segura)
    expect(result).toBeNull();
    
    // A lista deve permanecer imutável
    expect(manager.listAll()).toHaveLength(totalInicial);
  });
});
