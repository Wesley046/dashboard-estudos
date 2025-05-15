const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const publicPath = path.join(__dirname, 'public');
const app = express();

// Configuração CORS com lista de origens permitidas para produção e localhost
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://dashboard-objetivo-policial.onrender.com"
  // Adicione aqui outros domínios de produção, se houver
];

app.use(cors({
  origin: function(origin, callback){
    // Permite requests sem origem (ex: curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Origem não permitida pelo CORS: " + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Caso sua aplicação use cookies ou autenticação via credenciais
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(publicPath));

// Importação das Rotas
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");
const usuariosRoutes = require("./src/routes/usuariosRoutes");
const rankingRoutes = require("./src/routes/rankingRoutes");
const simuladosRoutes = require("./src/routes/simuladosRoutes");
const simuladoAlunoRoutes = require('./src/routes/simuladoAlunoRoutes');

app.use("/api/simulado-aluno", simuladoAlunoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplinas", disciplinasRoutes);
app.use("/api/estudos", estudosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/simulados", simuladosRoutes);

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

// Tratamento para rotas não encontradas (API)
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Rota API não encontrada" });
});

// Tratamento para rotas não encontradas (páginas)
app.use((req, res) => {
    res.status(404).send("Página não encontrada");
});

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
