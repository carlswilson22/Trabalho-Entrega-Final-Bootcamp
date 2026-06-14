import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis do arquivo .env

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("A variável MONGODB_URI não foi encontrada no .env");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ [Sistema]: Conectado ao Banco de Dados na Nuvem com sucesso!");
  } catch (error) {
    console.error("❌ [Erro de Banco]: Falha ao conectar no MongoDB", error.message);
    process.exit(1);
  }
};