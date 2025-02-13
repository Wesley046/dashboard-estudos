// ✅ Importação de módulos necessários
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./src/config/db");
require("dotenv").config(); // Carrega variáveis de ambiente

// ✅ Inicializa o Express
const app = express();

// ✅ Middleware para processar JSON e formulários
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Servir arquivos estáticos corretamente
app.use(express.static(path.join(__dirname, "public")));
console.log("📂 Servindo arquivos estáticos de:", path.join(__dirname, "public"));

// ✅ Importação das Rotas (AGORA CORRETAMENTE APÓS `app` SER DECLARADO)
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");

// ✅ Registrar Rotas API
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplinas", disciplinasRoutes);
app.use("/api/estudos", estudosRoutes);

// ✅ Rotas para páginas HTML (Login e Dashboard)
app.get("/", (req, res) => {
    res.redirect("/login"); // Redireciona para a página de login
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ✅ Tratamento de erro 404 para rotas da API
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Rota da API não encontrada" });
});

// ✅ Tratamento de erro 404 para outras páginas
app.use((req, res) => {
    res.status(404).send("Página não encontrada");
});

// ✅ Inicia o servidor no Render (ou localmente na porta 1000)
const PORT = process.env.PORT || 1000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
