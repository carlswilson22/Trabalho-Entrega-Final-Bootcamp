import Medication from './models/Medication.js';

export default class MedicationManager {
  // 1. Função com MongoDB, BrasilAPI e a nova funcionalidade do Vinicius
  async addMedication(nome, dosagem, horario, cep) {
    if (!nome || nome.trim() === '') throw new Error("O nome do medicamento não pode ser vazio.");
    
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horario || !timeRegex.test(horario)) throw new Error("O horário deve seguir o formato HH:mm.");
    
    // NOVA FUNCIONALIDADE (Vinicius): Validação de Conflito de Horário
    const conflito = await Medication.findOne({ horario: horario });
    if (conflito) {
      console.log(`\n\x1b[33m⚠️  [ALERTA DE AGENDA]: Você já possui o medicamento "${conflito.nome}" agendado para as ${horario}!\x1b[0m`);
    }

    const novoMed = new Medication({ nome, dosagem, horario, cep });
    return await novoMed.save();
  }

  // Método que faltava na branch do Vinicius para os testes de adesão passarem!
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
      total: meds.length,
      periodos,
      statusAgenda: "Sua agenda está organizada"
    };
  }
}