const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Rota para buscar todas as disciplinas
router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT DISTINCT disciplina FROM disciplinas_assuntos ORDER BY disciplina;");
        res.json(result.rows);
    } catch (error) {
        console.error(" Erro ao buscar disciplinas:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

// Rota para buscar os assuntos de uma disciplina específica
router.get("/assuntos", async (req, res) => {
    try {
        const disciplina = req.query.disciplina;
        if (!disciplina) {
            return res.status(400).json({ error: "Disciplina não especificada!" });
        }

        console.log(` Buscando assuntos para a disciplina: ${disciplina}`);

        const result = await db.query("SELECT assunto FROM disciplinas_assuntos WHERE disciplina = $1 ORDER BY assunto;", [disciplina]);
        // Mapeia os resultados para que cada objeto possua a propriedade 'nome'
        const assuntosRenomeados = result.rows.map(item => ({ nome: item.assunto }));
        res.json(assuntosRenomeados);
    } catch (error) {
        console.error(" Erro ao buscar assuntos:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

module.exports = router;
