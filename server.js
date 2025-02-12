const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./src/config/db");
require("dotenv").config(); // Carrega variáveis de ambiente

const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes"); // ✅ Importa a nova rota

const app = express();

// ✅ Permitir requisições de qualquer origem (CORS)
app.use(cors());

// ✅ Middleware para processar JSON e formulários
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Servir arquivos estáticos corretamente
app.use(express.static(path.join(__dirname, "public")));

console.log("📂 Servindo arquivos estáticos de:", path.join(__dirname, "public"));

// ✅ Registrar Rotas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", disciplinasRoutes); // ✅ Nova Rota adicionada

// ✅ Rota para exibir a tela de login
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Rota para exibir a dashboard
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ✅ Rota para evitar erro 404 e garantir que as rotas API sejam reconhecidas
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

// ✅ Inicia o servidor corrigido para Render
const PORT = process.env.PORT || 1000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
