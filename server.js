const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const publicPath = path.join(__dirname, 'public');

// Inicializa o Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve os arquivos estáticos da pasta 'public'

// Importação das Rotas
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");
const usuariosRoutes = require("./src/routes/usuariosRoutes");
const rankingRoutes = require("./src/routes/rankingRoutes");
const simuladosRoutes = require("./src/routes/simuladosRoutes");
const simuladoAlunoRoutes = require('./src/routes/simuladoAlunoRoutes'); // Importando as rotas de simulados do aluno

// Registrar as rotas de simulados do aluno com o prefixo "/api/simulado-aluno"
app.use("/api/simulado-aluno", simuladoAlunoRoutes);  // Prefixo correto para acessar as rotas de simulados

// Registrar as outras rotas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplinas", disciplinasRoutes);
app.use("/api/estudos", estudosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/simulados", simuladosRoutes); // Registrar a rota para '/simulados'

// Rota para a página de login
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Rota para o dashboard
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Rota para o ranking
app.get("/ranking", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "ranking.html"));
});

// Alteração para a rota de cadastro de simulados
app.get("/simulados/cadastrar", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "cadastrar_simulado.html")); // Rota para servir o arquivo HTML de cadastro de simulados
});

// Rota para a página de simulados do aluno
app.get('/simuladosAluno', (req, res) => {
    res.sendFile(path.join(publicPath, 'SimuladosAluno.html'));
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
    console.log(" Rota de ranking disponível em /api/ranking");
});
