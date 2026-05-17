const axios = require('axios');
const MedicationManager = require('../src/MedicationManager');

// Mock do módulo axios
jest.mock('axios');

describe('fetchLocationByCep (Teste de Integração)', () => {
  let manager;

  beforeEach(() => {
    manager = new MedicationManager();
    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  // 1. CEP válido — resposta positiva da BrasilAPI
  test('deve retornar cidade e bairro para um CEP válido', async () => {
    // Simula resposta de sucesso da BrasilAPI
    axios.get.mockResolvedValue({
      data: {
        cep: '01001000',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Sé',
        street: 'Praça da Sé'
      }
    });

    const result = await manager.fetchLocationByCep('01001000');

    // Verifica que axios foi chamado com a URL correta
    expect(axios.get).toHaveBeenCalledWith('https://brasilapi.com.br/api/cep/v1/01001000');
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Verifica o retorno
    expect(result).toEqual({
      cidade: 'São Paulo',
      bairro: 'Sé'
    });
  });

  // 2. CEP inexistente — erro 404 da BrasilAPI
  test('deve retornar mensagem de erro para CEP inexistente (404)', async () => {
    // Simula erro 404 da BrasilAPI
    axios.get.mockRejectedValue({
      response: { status: 404 }
    });

    const result = await manager.fetchLocationByCep('99999999');

    expect(axios.get).toHaveBeenCalledWith('https://brasilapi.com.br/api/cep/v1/99999999');
    expect(result).toEqual({
      erro: 'CEP não encontrado. Verifique o número e tente novamente.'
    });
  });

  // 3. Falha de rede — erro sem response (ex: timeout, sem conexão)
  test('deve retornar mensagem de erro amigável em caso de falha de rede', async () => {
    // Simula erro de rede (sem objeto response)
    axios.get.mockRejectedValue(new Error('Network Error'));

    const result = await manager.fetchLocationByCep('01001000');

    expect(result).toEqual({
      erro: 'Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.'
    });
  });

  // 4. CEP com formato inválido — não deve sequer chamar a API
  test('deve retornar erro de validação para CEP com formato inválido', async () => {
    const result = await manager.fetchLocationByCep('123');

    // Não deve ter chamado o axios
    expect(axios.get).not.toHaveBeenCalled();
    expect(result).toEqual({
      erro: 'CEP inválido. O CEP deve conter exatamente 8 dígitos.'
    });
  });

  // 5. CEP com máscara (traço) — deve sanitizar e funcionar
  test('deve aceitar CEP com máscara e retornar dados corretamente', async () => {
    axios.get.mockResolvedValue({
      data: {
        cep: '01001000',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Sé',
        street: 'Praça da Sé'
      }
    });

    const result = await manager.fetchLocationByCep('01001-000');

    // Deve ter chamado a API com o CEP sanitizado (sem traço)
    expect(axios.get).toHaveBeenCalledWith('https://brasilapi.com.br/api/cep/v1/01001000');
    expect(result).toEqual({
      cidade: 'São Paulo',
      bairro: 'Sé'
    });
  });

  // 6. API fora do ar — erro 500 (Internal Server Error)
  test('deve retornar mensagem de erro elegante quando a API estiver fora do ar (500)', async () => {
    // Simula a BrasilAPI retornando erro 500 (servidor indisponível)
    axios.get.mockRejectedValue({
      response: { status: 500, data: 'Internal Server Error' }
    });

    const result = await manager.fetchLocationByCep('01001000');

    // Garante que NÃO lançou exceção (não travou o terminal)
    expect(result).toBeDefined();
    expect(result).toHaveProperty('erro');
    expect(result.erro).toBe('Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.');
  });

  // 7. API com timeout — erro ECONNABORTED
  test('deve retornar mensagem de erro elegante em caso de timeout', async () => {
    // Simula timeout de conexão (sem objeto response)
    const timeoutError = new Error('timeout of 5000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    axios.get.mockRejectedValue(timeoutError);

    const result = await manager.fetchLocationByCep('01001000');

    // Garante que retornou erro amigável em vez de travar
    expect(result).toBeDefined();
    expect(result).toHaveProperty('erro');
    expect(result.erro).toBe('Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.');
  });
});
