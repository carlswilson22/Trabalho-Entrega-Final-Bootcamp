const crypto = require('crypto');
const axios = require('axios');

class MedicationManager {
  constructor() {
    this.medications = [];
  }

  addMedication(name, dosage, time) {
    if (!name || name.trim() === '') {
      throw new Error("O nome do medicamento não pode ser vazio.");
    }

    const dosageRegex = /^(\d+(?:[.,]\d+)?)\s*[a-zA-Z]+.*$/i;
    const dosageMatch = dosage ? dosage.trim().match(dosageRegex) : null;
    if (!dosageMatch || parseFloat(dosageMatch[1].replace(',', '.')) <= 0) {
      throw new Error("A dosagem deve conter uma quantidade válida maior que zero e uma unidade de medida (ex: 500mg).");
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!time || !timeRegex.test(time)) {
      throw new Error("O horário deve seguir o formato HH:mm.");
    }

    const newMedication = {
      id: crypto.randomUUID(),
      name: name.trim(),
      dosage: dosage ? dosage.trim() : '',
      time: time
    };

    this.medications.push(newMedication);
    return newMedication;
  }

  listAll() {
    return this.medications;
  }

  removeMedication(id) {
    const index = this.medications.findIndex(med => med.id === id);
    if (index === -1) {
      return null; // Ou throw new Error("Medicamento não encontrado.")
    }
    
    // Retorna o objeto removido
    const removedMedication = this.medications.splice(index, 1)[0];
    return removedMedication;
  }

  /**
   * Busca dados de localização a partir de um CEP usando a BrasilAPI.
   * @param {string} cep - O CEP a ser consultado (somente dígitos, 8 caracteres).
   * @returns {Promise<{cidade: string, bairro: string} | {erro: string}>}
   */
  async fetchLocationByCep(cep) {
    // Remove caracteres não numéricos (ex: traços, espaços)
    const sanitizedCep = String(cep).replace(/\D/g, '');

    if (sanitizedCep.length !== 8) {
      return { erro: 'CEP inválido. O CEP deve conter exatamente 8 dígitos.' };
    }

    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${sanitizedCep}`);
      const { city, neighborhood } = response.data;

      return {
        cidade: city,
        bairro: neighborhood || 'Não informado'
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { erro: '❌ [ERRO]: CEP não localizado na base de dados. Por favor, verifique o número.' };
      }
      return { erro: 'Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.' };
    }
  }
}

module.exports = MedicationManager;
