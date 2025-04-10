const express = require('express');
const router = express.Router(); // Esta linha deve estar no topo do arquivo
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
      const { disciplina, assunto } = req.query;
      
      let query = `
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
      `;
  
      // Adicionar condições de filtro
      const whereClauses = [];
      const params = [];
      
      if (disciplina) {
        whereClauses.push(`e.disciplina = $${params.length + 1}`);
        params.push(disciplina);
      }
      
      if (assunto) {
        whereClauses.push(`e.assunto = $${params.length + 1}`);
        params.push(assunto);
      }
  
      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }
  
      query += `
        GROUP BY u.id, u.nome
        HAVING (COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)) > 0
        ORDER BY aproveitamento DESC
      `;
      
      const { rows } = await db.query(query, params);
      res.json(rows);
    } catch (err) {
      console.error('Erro ao buscar ranking:', err);
      res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
});

module.exports = router;