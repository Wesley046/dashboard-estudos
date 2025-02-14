const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para inserir um novo estudo (mantida, se necessário)
router.post('/estudos', async (req, res) => {
  const { usuario_id, disciplina, assunto, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo } = req.body;

  if (!usuario_id || !disciplina || !assunto || !horas_estudadas || !data_estudo || !tipo_estudo) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos!" });
  }

  try {
    await db.query(
      "INSERT INTO estudos (usuario_id, disciplina, assunto, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [usuario_id, disciplina, assunto, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo]
    );

    console.log("✅ Estudo cadastrado com sucesso!");
    res.status(201).json({ message: "✅ Estudo cadastrado com sucesso!" });

  } catch (err) {
    console.error("❌ Erro ao cadastrar estudo:", err);
    res.status(500).json({ error: "Erro interno ao cadastrar estudo no banco de dados" });
  }
});

// Rota para obter os dados dos gráficos
router.get('/graficos', async (req, res) => {
  const usuario_id = req.query.usuario_id;

  if (!usuario_id) {
    return res.status(400).json({ error: "Usuário não autenticado" });
  }

  try {
    // Total de questões (certas e erradas) por dia
    const questoesQuery = await db.query(`
      SELECT data_estudo, 
             COALESCE(SUM(questoes_erradas), 0) AS total_erradas, 
             COALESCE(SUM(questoes_certas), 0) AS total_certas
      FROM estudos 
      WHERE usuario_id = $1
      GROUP BY data_estudo
      ORDER BY data_estudo;
    `, [usuario_id]);

    // Horas por tipo de estudo
    const tipoEstudoQuery = await db.query(`
      SELECT tipo_estudo, 
             COALESCE(SUM(EXTRACT(HOUR FROM horas_estudadas) + EXTRACT(MINUTE FROM horas_estudadas)/60.0), 0) AS total_horas
      FROM estudos 
      WHERE usuario_id = $1
      GROUP BY tipo_estudo;
    `, [usuario_id]);

    // Horas por disciplina
    const disciplinaQuery = await db.query(`
      SELECT disciplina, 
             COALESCE(SUM(EXTRACT(HOUR FROM horas_estudadas) + EXTRACT(MINUTE FROM horas_estudadas)/60.0), 0) AS total_horas
      FROM estudos 
      WHERE usuario_id = $1
      GROUP BY disciplina;
    `, [usuario_id]);

    // Horas estudadas por dia
    const horasDataQuery = await db.query(`
      SELECT data_estudo, 
             COALESCE(SUM(EXTRACT(HOUR FROM horas_estudadas) + EXTRACT(MINUTE FROM horas_estudadas)/60.0), 0) AS total_horas
      FROM estudos
      WHERE usuario_id = $1
      GROUP BY data_estudo
      ORDER BY data_estudo;
    `, [usuario_id]);

    // Total de dias estudados (conta datas distintas)
    const diasEstudadosQuery = await db.query(`
      SELECT COUNT(DISTINCT data_estudo) AS total_dias 
      FROM estudos 
      WHERE usuario_id = $1;
    `, [usuario_id]);

    const totalDias = diasEstudadosQuery.rows[0] ? diasEstudadosQuery.rows[0].total_dias : 0;

    res.json({
      questoes: questoesQuery.rows,
      tipoEstudo: tipoEstudoQuery.rows,
      disciplina: disciplinaQuery.rows,
      horasData: horasDataQuery.rows,
      totalDias: totalDias
    });

  } catch (err) {
    console.error("❌ Erro ao buscar dados para os gráficos:", err);
    res.status(500).json({ error: "Erro interno ao buscar dados" });
  }
});

module.exports = router;
