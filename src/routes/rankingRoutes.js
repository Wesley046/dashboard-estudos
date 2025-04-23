const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { data_inicio, data_fim, disciplina, assunto } = req.query;

    // Verifique os parâmetros recebidos
    console.log('Parâmetros recebidos:');
    console.log('data_inicio:', data_inicio);
    console.log('data_fim:', data_fim);
    console.log('disciplina:', disciplina);
    console.log('assunto:', assunto);

    // Converte as datas de string para o formato Date
    const dataInicio = data_inicio ? new Date(data_inicio) : null;
    const dataFim = data_fim ? new Date(data_fim) : null;

    // Verifique as datas convertidas
    console.log('Data de início convertida:', dataInicio);
    console.log('Data de fim convertida:', dataFim);

    // Verifique se as datas estão válidas
    if (dataInicio && isNaN(dataInicio.getTime())) {
        console.log('A data de início não é válida.');
        return res.status(400).json({ error: 'Data de início inválida' });
    }
    if (dataFim && isNaN(dataFim.getTime())) {
        console.log('A data de fim não é válida.');
        return res.status(400).json({ error: 'Data de fim inválida' });
    }

    // Garantir que as datas no formato YYYY-MM-DD sejam passadas corretamente para a query SQL
    const formattedDataInicio = dataInicio ? dataInicio.toISOString().split('T')[0] : null;
    const formattedDataFim = dataFim ? dataFim.toISOString().split('T')[0] : null;

    // Preparando os parâmetros para a consulta SQL
    const params = [
      disciplina || null, // Se disciplina não for fornecida, coloca null
      assunto || null,    // Se assunto não for fornecido, coloca null
      formattedDataInicio || null, // Se data_inicio não for fornecida, coloca null
      formattedDataFim || null,    // Se data_fim não for fornecida, coloca null
    ];

    // Definindo a query SQL
    const query = `
      SELECT 
        u.id,
        u.nome,
        COALESCE(SUM(e.questoes_certas), 0) as total_certas,
        COALESCE(SUM(e.questoes_erradas), 0) as total_erradas,
        (COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)) as total_questoes,
        CASE 
          WHEN (COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)) = 0 THEN 0
          ELSE ROUND((COALESCE(SUM(e.questoes_certas), 0) * 100.0 / 
                NULLIF((COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)), 0)), 1)
        END as aproveitamento
      FROM usuarios u
      LEFT JOIN estudos e ON u.id = e.usuario_id
        AND ($1::text IS NULL OR e.disciplina = $1)
        AND ($2::text IS NULL OR e.assunto = $2)
        AND ($3::date IS NULL OR e.data_estudo >= $3)
        AND ($4::date IS NULL OR e.data_estudo <= $4)
      GROUP BY u.id, u.nome
      HAVING (COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)) > 0
      ORDER BY aproveitamento DESC
    `;

    // Logs para depuração
    console.log("Parâmetros para a query:", params);

    // Executando a consulta no banco de dados
    const { rows } = await db.query(query, params);

    // Logs para depuração
    console.log("Resultado da query:", rows);

    // Respondendo com os dados do ranking
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar ranking:', err);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

module.exports = router;
