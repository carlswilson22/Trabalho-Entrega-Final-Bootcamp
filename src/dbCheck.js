import mongoose from 'mongoose';

export const checkConnection = async () => {
  const status = mongoose.connection.readyState;
  if (status === 1) {
    console.log("✅ [System]: Banco de dados online e pronto.");
  } else {
    console.log("❌ [System]: Banco de dados offline. Verifique o .env.");
  }
};