const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./src/config/db");
require("dotenv").config(); // Carrega variáveis de ambiente

// ✅ Inicializa o Express
const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
console.log("📂 Servindo arquivos estáticos de:", path.join(__dirname, "public"));

// ✅ Importação das Rotas
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");

// ✅ Registrar Rotas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplinas", disciplinasRoutes);
app.use("/api/estudos", estudosRoutes);

// ✅ Rota para autenticação do usuário
app.post("/api/auth/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        console.log(`🔎 Buscando usuário no banco para o email: ${email}`);
        
        const result = await db.query("SELECT id, nome, email, senha FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            console.warn("❌ Nenhum usuário encontrado com esse email.");
            return res.status(400).json({ error: "Email ou senha incorretos" });
        }

        const user = result.rows[0];
        console.log("✅ Usuário encontrado:", user);

        // Verifica se a senha está no formato correto
        if (!user.senha || typeof user.senha !== "string") {
            console.error("⚠️ Erro: Senha no banco de dados está incorreta ou não existe.");
            return res.status(500).json({ error: "Erro interno ao verificar credenciais" });
        }

        const match = await bcrypt.compare(senha, user.senha);

        if (!match) {
            console.warn("❌ Senha incorreta para o usuário:", email);
            return res.status(400).json({ error: "Email ou senha incorretos" });
        }

        console.log("✅ Login bem-sucedido para:", user.nome);
        res.status(200).json({
            message: "✅ Login bem-sucedido",
            usuario_id: user.id,
            nome: user.nome
        });

    } catch (err) {
        console.error("❌ Erro no login:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ✅ Rota para a página inicial
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ✅ Tratamento de erro 404 para API
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

// ✅ Tratamento de erro 404 para páginas comuns
app.use((req, res) => {
    res.status(404).send("Página não encontrada");
});

// ✅ Inicia o servidor
const PORT = process.env.PORT || 1000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});


