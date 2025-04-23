const express = require('express');
const router = express.Router();
const { Client } = require('pg'); // Importando o pg
const { v4: uuidv4 } = require('uuid');

// Configuração do cliente PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL, // URL do banco no .env
});
client.connect(); // Conecta ao banco de dados

// POST /simulados/cadastrar
router.post('/cadastrar', async (req, res) => {
    try {
        const {
            numero_simulado,
            tipo_simulado,
            prova,
            quantidade_questoes,
            gabarito // array com as respostas, ex: ['C', 'E', 'C', ...]
        } = req.body;

        if (gabarito.length !== quantidade_questoes) {
            return res.status(400).json({ error: 'Quantidade de questões não bate com o gabarito.' });
        }

        if (quantidade_questoes > 120) {
            return res.status(400).json({ error: 'O limite é de 120 questões.' });
        }

        const id_simulado = uuidv4();

        // Gera os campos q1 até q120, preenchendo com null se não usado
        const gabaritoFormatado = {};
        for (let i = 1; i <= 120; i++) {
            gabaritoFormatado[`q${i}`] = gabarito[i - 1] || null;
        }

        // Insere o simulado no banco
        const query = `
            INSERT INTO cadastro_simulados (numero_simulado, id_simulado, tipo_simulado, prova, quantidade_questoes, 
            ${Object.keys(gabaritoFormatado).join(', ')})
            VALUES ($1, $2, $3, $4, $5, ${Object.values(gabaritoFormatado).map((_, i) => `$${i + 6}`).join(', ')})
            RETURNING *;
        `;
        
        const values = [
            parseInt(numero_simulado),
            id_simulado,
            tipo_simulado,
            prova,
            quantidade_questoes,
            ...Object.values(gabaritoFormatado)
        ];

        const result = await client.query(query, values);

        return res.status(201).json({ message: 'Simulado cadastrado com sucesso!', simulado: result.rows[0] });
    } catch (error) {
        console.error("Erro ao cadastrar simulado:", error); // já ajuda no terminal
        res.status(500).json({ error: error.message }); // mostra erro exato
    }
});

module.exports = router;
