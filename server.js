const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./src/config/db");
require("dotenv").config(); // Carrega variáveis de ambiente

const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");
app.use("/api/estudos", estudosRoutes);

const app = express();
const bcrypt = require("bcryptjs");

// ✅ Permitir requisições de qualquer origem (CORS)
app.use(cors());

// ✅ Middleware para processar JSON e formulários
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Servir arquivos estáticos corretamente
app.use(express.static(path.join(__dirname, "public")));

console.log("📂 Servindo arquivos estáticos de:", path.join(__dirname, "public"));

// ✅ Rota para página inicial
app.get("/", (req, res) => {
    res.redirect("/login"); // Redireciona para a página de login
});

// ✅ Rota de login
app.post("/api/auth/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await db.query("SELECT id, nome, email, senha FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Email ou senha incorretos" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(senha, user.senha); // 🔑 Verifica a senha

        if (!match) {
            return res.status(400).json({ error: "Email ou senha incorretos" });
        }

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

// ✅ Registrar Rotas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", disciplinasRoutes);
app.use("/api", estudosRoutes); // ✅ Nova rota de estudos adicionada

// ✅ Rota para exibir a tela de login
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Rota para exibir a dashboard
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ✅ Rota para evitar erro 404 e garantir que as rotas API sejam reconhecidas
app.use("/api", (req, res, next) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

// ✅ Rota genérica para evitar erro "Cannot GET /"
app.use((req, res) => {
    res.status(404).send("Página não encontrada");
});

// ✅ Inicia o servidor corrigido para Render
const PORT = process.env.PORT || 1000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
