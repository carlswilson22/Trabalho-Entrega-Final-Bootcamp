const axios = require('axios');

module.exports = async function handler(req, res) {
  // Somente GET
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido.' });
  }

  const { cep } = req.query;

  if (!cep) {
    return res.status(400).json({ erro: 'Parâmetro "cep" é obrigatório.' });
  }

  // Remove caracteres não numéricos
  const sanitizedCep = String(cep).replace(/\D/g, '');

  if (sanitizedCep.length !== 8) {
    return res.status(400).json({ erro: 'CEP inválido. O CEP deve conter exatamente 8 dígitos.' });
  }

  try {
    const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${sanitizedCep}`);
    const { city, neighborhood } = response.data;

    return res.status(200).json({
      cidade: city,
      bairro: neighborhood || 'Não informado'
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ erro: 'CEP não encontrado. Verifique o número e tente novamente.' });
    }
    return res.status(500).json({ erro: 'Não foi possível consultar o CEP. Tente novamente mais tarde.' });
  }
};
