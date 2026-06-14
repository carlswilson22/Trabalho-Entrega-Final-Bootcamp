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
    // Busca tudo no MongoDB
    return await Medication.find();
  }

  async getAdesaoReport() {
    const meds = await Medication.find();
    const total = meds.length;

    let manha = 0;
    let tarde = 0;
    let noite = 0;

    meds.forEach(med => {
      if (med.horario && typeof med.horario === 'string') {
        const parts = med.horario.split(':');
        if (parts.length > 0) {
          const hora = parseInt(parts[0], 10);
          if (!isNaN(hora)) {
            if (hora >= 6 && hora < 12) {
              manha++;
            } else if (hora >= 12 && hora < 18) {
              tarde++;
            } else {
              noite++;
            }
          }
        }
      }
    });

    const statusAgenda = total > 3 ? "Sua agenda está organizada" : "Sua agenda está em transição";
    const alertaSobrecarregado = total > 5;

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