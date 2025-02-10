const { Client } = require('pg');

// Dados de conexão
const client = new Client({
  host: 'dpg-cuj1e69u0jms73d87rqg-a.oregon-postgres.render.com',
  port: 5432,
  user: 'bd_objetivopolicial_user',
  password: 'TPWi387bS7PYSsnwzUKecpvY48bPVF8m',
  database: 'bd_objetivopolicial',
  ssl: { rejectUnauthorized: false } // Conexão segura com o Render
});

// Conecta ao banco de dados
client.connect()
  .then(() => console.log("Conectado ao banco de dados"))
  .catch((err) => console.error('Erro de conexão', err.stack));

// Exporta um objeto com o método query
module.exports = {
  query: (text, params) => client.query(text, params),
};