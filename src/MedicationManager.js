import Medication from './models/Medication.js';
import axios from 'axios';
import Medication from './models/Medication.js'; // Importe o seu modelo Mongoose

class MedicationManager {
  // Não precisamos mais do construtor com array, pois o banco é nossa fonte da verdade

  async addMedication(nome, dosagem, horario, cep) {
    // Validação básica (o Aluno 2 pode reforçar com a lib 'validator' depois)
    if (!nome || nome.trim() === '') {
      throw new Error("O nome do medicamento não pode ser vazio.");
    }

    // Criamos e salvamos no MongoDB
    const novoMed = new Medication({
      nome: nome.trim(),
      dosagem: dosagem.trim(),
      horario: horario,
      cep: cep
    });
    return await novoMed.save();
  }

  async listAll() {
    return await Medication.find();
  }

  async removeMedication(id) {
    try {
      return await Medication.findByIdAndDelete(id);
    } catch (e) {
      return null;
    }
  }

  /**
   * Método que faltava na branch do Vinicius para os testes de adesão passarem!
   */
  async getAdesaoReport() {
    const meds = await Medication.find() || [];
    const periodos = { manha: 0, tarde: 0, noite: 0 };
    
    meds.forEach(med => {
      const hora = parseInt(med.horario.split(':')[0], 10);
      if (hora >= 6 && hora < 12) periodos.manha++;
      else if (hora >= 12 && hora < 18) periodos.tarde++;
      else periodos.noite++;
    });

    return {
      total,
      periodos: {
        manha,
        tarde,
        noite
      },
      statusAgenda,
      alertaSobrecarregado
    };
  }

  async removeMedication(id) {
    // Remove pelo ID do MongoDB
    return await Medication.findByIdAndDelete(id);
  }

  async fetchLocationByCep(cep) {
    const sanitizedCep = String(cep).replace(/\D/g, '');

    if (sanitizedCep.length !== 8) {
      return { erro: 'CEP inválido.' };
    }

    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${sanitizedCep}`);
      const { city, neighborhood } = response.data;
      return { cidade: city, bairro: neighborhood || 'Não informado' };
    } catch (error) {
      return { erro: 'Não foi possível consultar o CEP.' };
    }
  }
}

export default MedicationManager;