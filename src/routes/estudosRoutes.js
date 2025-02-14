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

    console.log("🟢 Requisição recebida para gráficos. Usuário ID:", usuario_id);

    if (!usuario_id || isNaN(parseInt(usuario_id))) {
        console.error("❌ Usuário ID inválido:", usuario_id);
        return res.status(400).json({ error: "Usuário não autenticado ou ID inválido!" });
    }

    try {
        const questoesQuery = await db.query(`
            SELECT data_estudo, 
                   COALESCE(SUM(questoes_erradas), 0) AS total_erradas, 
                   COALESCE(SUM(questoes_certas), 0) AS total_certas
            FROM estudos 
            WHERE usuario_id = $1
            GROUP BY data_estudo
            ORDER BY data_estudo;
        `, [parseInt(usuario_id)]);  

        // ✅ Horas por tipo de estudo
        const tipoEstudoQuery = await db.query(`
          SELECT tipo_estudo, 
                 COALESCE(SUM(EXTRACT(HOUR FROM horas_estudadas) + EXTRACT(MINUTE FROM horas_estudadas)/60.0), 0) AS total_horas
          FROM estudos 
          WHERE usuario_id = $1
          GROUP BY tipo_estudo;
        `, [usuario_id]);

        // ✅ Horas por disciplina
        const disciplinaQuery = await db.query(`
          SELECT disciplina, 
                 COALESCE(SUM(EXTRACT(HOUR FROM horas_estudadas) + EXTRACT(MINUTE FROM horas_estudadas)/60.0), 0) AS total_horas
          FROM estudos 
          WHERE usuario_id = $1
          GROUP BY disciplina;
        `, [usuario_id]);

        // ✅ Horas estudadas por dia
        const horasDataQuery = await db.query(`
          SELECT data_estudo, 
                 COALESCE(SUM(EXTRACT(HOUR FROM horas_estudadas) + EXTRACT(MINUTE FROM horas_estudadas)/60.0), 0) AS total_horas
          FROM estudos
          WHERE usuario_id = $1
          GROUP BY data_estudo
          ORDER BY data_estudo;
        `, [usuario_id]);

        // ✅ Total de dias estudados
        const diasEstudadosQuery = await db.query(`
          SELECT COUNT(DISTINCT data_estudo) AS total_dias 
          FROM estudos 
          WHERE usuario_id = $1;
        `, [usuario_id]);

        // ✅ Processamento dos dados
        const totalDias = diasEstudadosQuery.rows[0] ? diasEstudadosQuery.rows[0].total_dias : 0;
        const questoes = questoesQuery.rows.map(row => ({
            data_estudo: row.data_estudo,
            total_erradas: Number(row.total_erradas),
            total_certas: Number(row.total_certas)
        }));

        const tipoEstudo = tipoEstudoQuery.rows.map(row => ({
            tipo_estudo: row.tipo_estudo || "Desconhecido",
            total_horas: Number(row.total_horas)
        }));

        const disciplina = disciplinaQuery.rows.map(row => ({
            disciplina: row.disciplina,
            total_horas: Number(row.total_horas)
        }));

        const horasData = horasDataQuery.rows.map(row => ({
            data_estudo: row.data_estudo,
            total_horas: Number(row.total_horas)
        }));

        res.json({
            questoes,
            tipoEstudo,
            disciplina,
            horasData,
            totalDias
        });

    } catch (err) {
        console.error("❌ Erro ao buscar dados para os gráficos:", err);
        res.status(500).json({ error: "Erro interno ao buscar dados" });
    }
});

// ✅ Rota para obter os assuntos de uma disciplina específica
router.get("/assuntos", async (req, res) => {
    const disciplina = req.query.disciplina;

    if (!disciplina) {
        return res.status(400).json({ error: "O nome da disciplina é obrigatório!" });
    }

    try {
        console.log(`📡 Buscando assuntos para a disciplina: ${disciplina}`);

        const query = `
            SELECT a.nome 
            FROM assuntos a
            JOIN disciplinas d ON a.disciplina_id = d.id
            WHERE d.nome ILIKE $1;
        `;

        const result = await db.query(query, [disciplina]);

        if (result.rows.length === 0) {
            console.warn(`⚠ Nenhum assunto encontrado para a disciplina: ${disciplina}`);
        }

        res.json(result.rows);

    } catch (error) {
        console.error("❌ Erro ao buscar assuntos:", error);
        res.status(500).json({ error: "Erro interno ao buscar assuntos." });
    }
});


module.exports = router;
