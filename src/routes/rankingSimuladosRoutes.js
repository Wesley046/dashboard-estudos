const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Rota para listar simulados para o ranking
router.get('/simulados', async (req, res) => {
    try {
        const { numero } = req.query;
        
        let query = `
            SELECT id, prova, numero_simulado 
            FROM cadastro_simulados 
        `;
        
        const params = [];
        
        if (numero) {
            query += ` WHERE numero_simulado = $1`;
            params.push(numero);
        }
        
        query += ` ORDER BY prova, numero_simulado`;
        
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar simulados:', err);
        res.status(500).json({ 
            error: 'Erro ao buscar simulados',
            details: err.message 
        });
    }
});

// Rota para dados do ranking de um simulado específico
router.get('/:simulado_id', async (req, res) => {
    try {
        const { simulado_id } = req.params;
        
        const query = `
            SELECT 
                r.aluno_id,
                u.nome,
                COUNT(CASE WHEN r.acertou = true THEN 1 END) AS total_certas,
                COUNT(CASE WHEN r.acertou = false THEN 1 END) AS total_erradas,
                COUNT(r.numero_questao) AS total_questoes,
                CASE 
                    WHEN COUNT(r.numero_questao) = 0 THEN 0
                    ELSE ROUND((COUNT(CASE WHEN r.acertou = true THEN 1 END) * 100.0 / 
                        NULLIF(COUNT(r.numero_questao), 0)), 1)
                END as aproveitamento
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