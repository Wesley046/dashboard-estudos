const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// Inicializa o Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
console.log("📂 Servindo arquivos estáticos de:", path.join(__dirname, "public"));

// Importação das Rotas
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");
const usuariosRoutes = require("./src/routes/usuariosRoutes");
const rankingRoutes = require('./src/routes/rankingRoutes');


// Registrar Rotas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplinas", disciplinasRoutes);
app.use("/api/estudos", estudosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use('/api/ranking', rankingRoutes);

// Rotas para páginas estáticas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/ranking", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "ranking.html"));
  });


// Tratamento de erro 404 para APIs
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

// Tratamento de erro 404 para páginas comuns
app.use((req, res) => {
    res.status(404).send("Página não encontrada");
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
    console.log("✅ Rota de ranking disponível em /api/ranking");
});