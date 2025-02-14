const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Rota para buscar todas as disciplinas
// Esta rota responderá a GET /api/disciplinas
router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT DISTINCT disciplina FROM disciplinas_assuntos ORDER BY disciplina;");
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Erro ao buscar disciplinas:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// ✅ Rota para buscar os assuntos de uma disciplina específica
// Esta rota pode ser acessada de duas formas:
// 1️⃣ GET /api/disciplinas/assuntos/:disciplina
// 2️⃣ GET /api/disciplinas/assuntos?disciplina=NomeDaDisciplina
router.get("/assuntos/:disciplina?", async (req, res) => {
    try {
        // Verifica se a disciplina foi passada na URL ou como query string
        const disciplina = req.params.disciplina || req.query.disciplina;

        if (!disciplina) {
            return res.status(400).json({ error: "Disciplina não informada" });
        }

        console.log(`📡 Buscando assuntos para a disciplina: ${disciplina}`);

        const result = await db.query("SELECT assunto FROM disciplinas_assuntos WHERE disciplina = $1 ORDER BY assunto;", [disciplina]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Nenhum assunto encontrado para essa disciplina" });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Erro ao buscar assuntos:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

module.exports = router;
