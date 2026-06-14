import crypto from 'crypto';
import axios from 'axios';
import Medication from './models/Medication.js'; 

export default class MedicationManager {
  
  // 1. Função com MongoDB, BrasilAPI e a nova funcionalidade do Vinicius
  async addMedication(nome, dosagem, horario, cep) {
    if (!nome || nome.trim() === '') throw new Error("O nome do medicamento não pode ser vazio.");

    const dosageRegex = /^(\d+(?:[.,]\d+)?)\s*[a-zA-Z]+.*$/i;
    const dosageMatch = dosagem ? dosagem.trim().match(dosageRegex) : null;
    if (!dosageMatch || parseFloat(dosageMatch[1].replace(',', '.')) <= 0) {
      throw new Error("A dosagem deve conter uma quantidade válida.");
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horario || !timeRegex.test(horario)) throw new Error("O horário deve seguir o formato HH:mm.");

    // 👇 NOVA FUNCIONALIDADE (Vinicius): Validação de Conflito de Horário
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

    await newMedication.save(); // Salva na nuvem!
    return newMedication;
  }

  // 2. Buscar todos do MongoDB
  async listAll() {
    return await Medication.find(); 
  }

  // 3. Remover do MongoDB
  async removeMedication(id) {
    const removedMedication = await Medication.findOneAndDelete({ id: id }); 
    return removedMedication ? removedMedication : null;
  }

  // 4. Nossa função da BrasilAPI
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

  // 👇 MANTENHA A FUNÇÃO DO SEU COLEGA AQUI EMBAIXO 👇
  // async getAdesaoReport() { ... código do colega ... }
}