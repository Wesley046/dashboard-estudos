require('dotenv').config(); // Carregar variáveis do .env
const { Pool } = require('pg');

// Configuração do banco de dados via variável de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usa a URL do .env
  ssl: { rejectUnauthorized: false }, // Necessário para Render
  max: 20, // Número máximo de conexões simultâneas
  idleTimeoutMillis: 30000, // Tempo máximo de inatividade antes de encerrar conexão
  connectionTimeoutMillis: 5000, // Tempo máximo para tentar se conectar
});

// Testa a conexão ao iniciar
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conectado ao banco de dados com sucesso!");
    client.release(); // Libera a conexão de volta para o pool
  } catch (err) {
    console.error("❌ Erro ao conectar no banco de dados:", err.message);
  }
})();

// Exporta a função para executar queries
module.exports = {
  query: (text, params) => pool.query(text, params),
};
