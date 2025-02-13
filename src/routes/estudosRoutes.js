const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ Rota para inserir um novo estudo
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

// ✅ Rota para obter dados dos gráficos
router.get('/graficos', async (req, res) => {
    const usuario_id = req.query.usuario_id;

    if (!usuario_id) {
        return res.status(400).json({ error: "Usuário não autenticado" });
    }

    try {
        const questoesQuery = await db.query(`
            SELECT data_estudo, 
                   SUM(questoes_erradas) AS total_erradas, 
                   SUM(questoes_certas) AS total_certas
            FROM estudos 
            WHERE usuario_id = $1
            GROUP BY data_estudo
            ORDER BY data_estudo;
        `, [usuario_id]);

        const tipoEstudoQuery = await db.query(`
            SELECT tipo_estudo, SUM(horas_estudadas) AS total_horas 
            FROM estudos 
            WHERE usuario_id = $1
            GROUP BY tipo_estudo;
        `, [usuario_id]);

        const disciplinaQuery = await db.query(`
            SELECT disciplina, SUM(horas_estudadas) AS total_horas 
            FROM estudos 
            WHERE usuario_id = $1
            GROUP BY disciplina;
        `, [usuario_id]);

        const horasDataQuery = await db.query(`
            SELECT data_estudo, SUM(horas_estudadas) AS total_horas
            FROM estudos
            WHERE usuario_id = $1
            GROUP BY data_estudo
            ORDER BY data_estudo;
        `, [usuario_id]);

        const diasEstudadosQuery = await db.query(`
            SELECT COUNT(DISTINCT data_estudo) AS total_dias 
            FROM estudos 
            WHERE usuario_id = $1;
        `, [usuario_id]);

        const totalDias = diasEstudadosQuery.rows.length > 0 ? diasEstudadosQuery.rows[0].total_dias : 0;

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
