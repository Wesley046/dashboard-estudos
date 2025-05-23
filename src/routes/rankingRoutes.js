const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cors = require('cors');

// Habilita CORS para esta rota específica
router.use(cors());


// Rota para listar simulados para o ranking
router.get('/simulados', async (req, res) => {
    try {
        const query = `
            SELECT id, numero_simulado, prova  -- Incluindo numero_simulado na consulta
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


// Rota principal do ranking (com CORS e melhor tratamento de parâmetros)
router.get('/', cors(), async (req, res) => {
    try {
        console.log('Recebida requisição para /api/ranking com params:', req.query);
        
        const { 
            data_inicio, 
            data_fim, 
            disciplina, 
            assunto, 
            tipoRanking, 
            simulado_id 
        } = req.query;

        if (!tipoRanking) {
            console.warn('Tipo de ranking não fornecido');
            return res.status(400).json({ 
                error: "Parâmetro 'tipoRanking' é obrigatório" 
            });
        }

        // Validação de datas
        const validateDate = (dateStr) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };

        const dataInicio = validateDate(data_inicio);
        const dataFim = validateDate(data_fim);

        // Query para ranking de questões
        if (tipoRanking === 'questoes') {
            const query = `
                 SELECT 
                    u.id,
                    u.nome,
                    COALESCE(SUM(e.questoes_certas), 0) as total_certas,
                    COALESCE(SUM(e.questoes_erradas), 0) as total_erradas,
                    (COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)) as total_questoes,
                    CASE 
                        WHEN (COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)) = 0 THEN 0
                        ELSE ROUND(
                            (COALESCE(SUM(e.questoes_certas), 0) * 100.0 / 
                            NULLIF((COALESCE(SUM(e.questoes_certas), 0) + COALESCE(SUM(e.questoes_erradas), 0)), 0))::numeric, 
                            1
                        )
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
          
            const params = [
                disciplina || null,
                assunto || null,
                dataInicio || null,
                dataFim || null,
            ];

            console.log('Executando query para ranking de questões com params:', params);
            const { rows } = await db.query(query, params);
            return res.json(rows);
        }

        // Query para ranking de simulados
        if (tipoRanking === 'simulados') {
            if (!simulado_id) {
                console.warn('Simulado ID não fornecido');
                return res.status(400).json({ 
                    error: 'Parâmetro simulado_id é obrigatório para ranking de simulados' 
                });
            }

            const query = `
                  SELECT 
  r.aluno_id,
  u.nome,
  COUNT(CASE WHEN r.acertou = true THEN 1 END) AS total_certas,
  COUNT(CASE WHEN r.acertou = false THEN 1 END) AS total_erradas,
  SUM(r.nota) AS total_questoes,  -- Não é mais o total de questões, é a soma da nota
  CASE 
    WHEN SUM(r.peso) = 0 THEN 0
    ELSE ROUND(
      (SUM(r.nota) * 100.0 / SUM(r.peso))::numeric,
      1
    )
  END AS aproveitamento
FROM respostas_aluno r
JOIN usuarios u ON r.aluno_id = u.id
WHERE r.simulado_id = $1
GROUP BY r.aluno_id, u.nome
ORDER BY aproveitamento DESC;

            `;
            
            console.log('Executando query para ranking de simulados com simulado_id:', simulado_id);
            const { rows } = await db.query(query, [simulado_id]);
            return res.json(rows);
        }

        console.warn('Tipo de ranking inválido:', tipoRanking);
        res.status(400).json({ 
            error: "Tipo de ranking inválido. Use 'questoes' ou 'simulados'" 
        });

    } catch (err) {
        console.error('Erro detalhado ao processar ranking:', err);
        res.status(500).json({ 
            error: 'Erro interno ao processar ranking',
            details: err.message 
        });
    }
});

module.exports = router;