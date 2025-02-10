const { Pool } = require('pg');

// Dados de conexão
const pool = new Pool({
  host: 'dpg-cuj1e69u0jms73d87rqg-a.oregon-postgres.render.com',
  port: 5432,
  user: 'bd_objetivopolicial_user',
  password: 'TPWi387bS7PYSsnwzUKecpvY48bPVF8m',
  database: 'bd_objetivopolicial',
  ssl: { rejectUnauthorized: false }, // Conexão segura com o Render
  max: 20, // Número máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar idle
  connectionTimeoutMillis: 2000, // Tempo máximo para estabelecer uma conexão
});

// Testa a conexão com o banco de dados
pool.query('SELECT NOW()')
  .then(() => console.log("Conectado ao banco de dados"))
  .catch((err) => console.error('Erro de conexão', err.stack));

// Exporta o pool para ser usado em outros arquivos
module.exports = {
  query: (text, params) => pool.query(text, params),
};