import crypto from 'crypto';
import axios from 'axios';
import Medication from './models/Medication.js'; 

export default class MedicationManager {
  async addMedication(nome, dosagem, horario, cep) {
    if (!nome || nome.trim() === '') throw new Error("O nome do medicamento não pode ser vazio.");

    const dosageRegex = /^(\d+(?:[.,]\d+)?)\s*[a-zA-Z]+.*$/i;
    const dosageMatch = dosagem ? dosagem.trim().match(dosageRegex) : null;
    if (!dosageMatch || parseFloat(dosageMatch[1].replace(',', '.')) <= 0) {
      throw new Error("A dosagem deve conter uma quantidade válida.");
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horario || !timeRegex.test(horario)) throw new Error("O horário deve seguir o formato HH:mm.");

    const conflito = await Medication.findOne({ horario: horario });
    if (conflito) {
      console.log(`\n\x1b[33m⚠️  [ALERTA DE AGENDA]: Você já possui o medicamento "${conflito.nome}" agendado para as ${horario}!\x1b[0m`);
    }

    let localizacao = null;
    if (cep) {
      const resultadoCep = await this.fetchLocationByCep(cep);
      if (!resultadoCep.erro) {
        localizacao = resultadoCep;
      } else {
        console.log(resultadoCep.erro); 
      }
    }

    const newMedication = new Medication({
      id: crypto.randomUUID(), 
      nome: nome.trim(),
      dosagem: dosagem ? dosagem.trim() : '',
      horario: horario,
      cep: cep,
      endereco: localizacao 
    });

    await newMedication.save();
    return newMedication;
  }

  async listAll() {
    return await Medication.find(); 
  }

  async removeMedication(id) {
    const removedMedication = await Medication.findOneAndDelete({ id: id }); 
    return removedMedication ? removedMedication : null;
  }

  async fetchLocationByCep(cep) {
    const sanitizedCep = String(cep).replace(/\D/g, '');
    if (sanitizedCep.length !== 8) return { erro: 'CEP inválido.' };

    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${sanitizedCep}`);
      const { city, neighborhood } = response.data;
      return { cidade: city, bairro: neighborhood || 'Não informado' };
    } catch (error) {
      return { erro: 'Não foi possível consultar o CEP.' };
    }
  }

  async getAdesaoReport() {
    const meds = await this.listAll();
    const report = {
      total: meds.length,
      periodos: { manha: 0, tarde: 0, noite: 0, madrugada: 0 },
      statusAgenda: "Sua agenda está organizada"
    };

    meds.forEach(med => {
      const hora = parseInt(med.horario.split(':')[0], 10);
      if (hora >= 6 && hora < 12) report.periodos.manha++;
      else if (hora >= 12 && hora < 18) report.periodos.tarde++;
      else if (hora >= 18 && hora < 24) report.periodos.noite++;
      else report.periodos.madrugada++;
    });

    if (report.total > 5) {
      report.statusAgenda = "Alerta de sobrecarga de medicamentos";
    }

    return report;
  }
}