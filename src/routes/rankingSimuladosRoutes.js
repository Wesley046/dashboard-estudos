const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para listar simulados para o ranking
router.get('/simulados', async (req, res) => {
    try {
        const query = `
            SELECT id, prova 
            FROM cadastro_simulados 
            ORDER BY prova;
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar simulados para ranking:', err);
        res.status(500).json({ 
            error: 'Erro ao buscar simulados',
            details: err.message 
        });
    }
});

router.get('/:simulado_id', async (req, res) => {
    try {
        const { simulado_id } = req.params;

        // Query ajustada para o ranking de simulados
        const query = `
            SELECT 
                r.aluno_id,
                u.nome,
                COUNT(CASE WHEN r.acertou = true THEN 1 END) AS total_certas,
                COUNT(CASE WHEN r.acertou = false THEN 1 END) AS total_erradas,
                SUM(r.nota) AS total_questoes,  -- Soma das notas (total_questoes)
                CASE 
                    WHEN SUM(r.peso) = 0 THEN 0
                    ELSE ROUND(
                        (SUM(r.nota) * 100.0 / SUM(r.peso))::numeric,  -- Aproveitamento calculado com base nas notas e pesos
                        1
                    )
                END AS aproveitamento
            FROM respostas_aluno r
            JOIN usuarios u ON r.aluno_id = u.id
            WHERE r.simulado_id = $1
            GROUP BY r.aluno_id, u.nome
            ORDER BY aproveitamento DESC
        `;

        const { rows } = await db.query(query, [simulado_id]);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao gerar ranking de simulado:', err);
        res.status(500).json({ 
            error: 'Erro ao gerar ranking',
            details: err.message 
        });
    }
});


module.exports = router;