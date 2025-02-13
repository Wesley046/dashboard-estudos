const bcrypt = require("bcryptjs");
const db = require("./src/config/db");

async function verificarSenha(email, senhaInserida) {
    try {
        const result = await db.query("SELECT senha FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            console.log("❌ Usuário não encontrado");
            return;
        }

        const hashArmazenado = result.rows[0].senha;
        console.log("🔑 Hash armazenado no banco:", hashArmazenado);

        const match = await bcrypt.compare(senhaInserida, hashArmazenado);

        if (match) {
            console.log("✅ Senha correta!");
        } else {
            console.log("❌ Senha incorreta!");
        }
    } catch (err) {
        console.error("❌ Erro ao verificar senha:", err);
    }
}

// Teste com o usuário
verificarSenha("joao@example.com", "senha123");
