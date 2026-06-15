import axios from 'axios';
import Medication from './models/Medication.js';

class MedicationManager {
  
  async addMedication(nome, dosagem, horario, cep) {
    if (!nome || nome.trim() === '') {
      throw new Error("O nome do medicamento não pode ser vazio.");
    }

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

  async getAdesaoReport() {
    const meds = await Medication.find() || [];
    const total = meds.length;
    const periodos = { manha: 0, tarde: 0, noite: 0 };
    
    meds.forEach(med => {
      if (med.horario) {
        const hora = parseInt(med.horario.split(':')[0], 10);
        if (!isNaN(hora)) {
          if (hora >= 6 && hora < 12) periodos.manha++;
          else if (hora >= 12 && hora < 18) periodos.tarde++;
          else periodos.noite++;
        }
      }
    });

    const statusAgenda = total > 3 ? "Sua agenda está organizada" : "Sua agenda está em transição";
    const alertaSobrecarregado = total > 5;

    return {
      total,
      periodos,
      statusAgenda,
      alertaSobrecarregado
    };
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