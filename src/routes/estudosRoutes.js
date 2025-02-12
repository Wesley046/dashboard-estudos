const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

module.exports = router;
