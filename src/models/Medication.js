import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  dosagem: { type: String, required: true },
  horario: { type: String, required: true },
  cep: { type: String, required: true },
  dataCadastro: { type: Date, default: Date.now }
});

export default mongoose.model('Medication', medicationSchema);