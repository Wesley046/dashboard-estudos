const express = require('express');
const db = require('../config/db'); // pool com SSL configurado
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();

// Rota GET para carregar o HTML
router.get('/cadastrar', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'cadastrar_simulado.html'));
});

// Rota POST para cadastrar simulado e questões
router.post('/cadastrar', async (req, res) => {
  try {
    const {
      numero_simulado,
      tipo_simulado,
      prova,
      quantidade_questoes,
      questoes,
    } = req.body;

    if (!questoes || questoes.length !== quantidade_questoes) {
      return res.status(400).json({ error: 'Quantidade de questões não bate com o preenchido.' });
    }

    const id_simulado = uuidv4();

    const insertSimuladoQuery = `
      INSERT INTO cadastro_simulados (
        numero_simulado, id_simulado, tipo_simulado, prova, quantidade_questoes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;

    const simuladoResult = await db.query(insertSimuladoQuery, [
      numero_simulado,
      id_simulado,
      tipo_simulado,
      prova,
      quantidade_questoes,
    ]);

    const simuladoId = simuladoResult.rows[0].id;
    const insertQuestaoQuery = `
      INSERT INTO questoes_simulado 
        (simulado_id, numero_questao, gabarito, peso, comentario, disciplina)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const questao of questoes) {
      const { numero_questao, gabarito, peso, comentario, disciplina } = questao;
      await db.query(insertQuestaoQuery, [
        simuladoId,
        numero_questao,
        gabarito,
        peso,
        comentario,
        disciplina,
      ]);
    }

    return res.status(201).json({ message: 'Simulado e questões cadastrados com sucesso!' });

  } catch (error) {
    console.error('Erro ao cadastrar simulado:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
