const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Rota para buscar todas as disciplinas
// Como este router é montado em "/api/disciplinas", essa rota responde a GET /api/disciplinas
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
// Esta rota responderá a GET /api/disciplinas/assuntos/:disciplina
router.get("/assuntos/:disciplina", async (req, res) => {
    try {
        const disciplina = req.params.disciplina;
        const result = await db.query("SELECT assunto FROM disciplinas_assuntos WHERE disciplina = $1 ORDER BY assunto;", [disciplina]);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Erro ao buscar assuntos:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

module.exports = router;
