import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  dosagem: {
    type: String,
    required: true
  },
  horario: {
    type: String,
    required: true
  },
  cep: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Isso cria a coleção 'medications' no seu banco de dados automaticamente
const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;