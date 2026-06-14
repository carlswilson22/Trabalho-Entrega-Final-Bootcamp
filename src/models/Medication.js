import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nome: { type: String, required: true },
  dosagem: { type: String },
  horario: { type: String, required: true },
  cep: { type: String },
  endereco: {
    cidade: { type: String },
    bairro: { type: String }
  }
});

export default mongoose.model('Medication', medicationSchema);