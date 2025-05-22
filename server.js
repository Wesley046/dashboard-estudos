const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// Importação das Rotas
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");
const usuariosRoutes = require("./src/routes/usuariosRoutes");
const rankingRoutes = require("./src/routes/rankingRoutes");
const simuladosRoutes = require("./src/routes/simuladosRoutes");
const simuladoAlunoRoutes = require('./src/routes/simuladoAlunoRoutes');
const rankingSimuladosRoutes = require("./src/routes/rankingSimuladosRoutes");

const publicPath = path.join(__dirname, 'public');
const app = express();

// Configuração CORS atualizada
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dashboard-objetivo-policial.onrender.com"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'Cache-Control'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Aplica as configurações CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilita preflight para todas as rotas

// Configurações do Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicPath));

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplinas", disciplinasRoutes);
app.use("/api/estudos", estudosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/simulados", simuladosRoutes);
app.use("/api/simulado-aluno", simuladoAlunoRoutes);
app.use("/api/ranking-simulados", rankingSimuladosRoutes);

// Rotas para páginas HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(publicPath, "dashboard.html"));
});

app.get("/ranking", (req, res) => {
    res.sendFile(path.join(publicPath, "ranking.html"));
});

app.get("/simulados/cadastrar", (req, res) => {
    res.sendFile(path.join(publicPath, "cadastrar_simulado.html"));
});

app.get('/simuladosAluno', (req, res) => {
    res.sendFile(path.join(publicPath, 'SimuladosAluno.html'));
});

// Middleware para rotas API não encontradas
app.use("/api", (req, res) => {
    res.status(404).json({ 
        success: false,
        error: "Endpoint API não encontrado",
        availableEndpoints: [
            "/api/auth",
            "/api/dashboard",
            "/api/disciplinas",
            "/api/estudos",
            "/api/usuarios",
            "/api/ranking",
            "/api/simulados",
            "/api/simulado-aluno",
            "/api/ranking-simulados"
        ]
    });
});

// Middleware para páginas não encontradas
app.use((req, res) => {
    res.status(404).sendFile(path.join(publicPath, "404.html"));
});

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error('Erro global:', err.stack);
    res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        message: err.message
    });
});

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Origens permitidas: ${corsOptions.origin.join(', ')}`);
});