const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config(); // Carrega variáveis de ambiente

// ✅ Inicializa o Express
const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Servir arquivos estáticos corretamente
app.use(express.static(path.join(__dirname, "public")));
console.log("📂 Servindo arquivos estáticos de:", path.join(__dirname, "public"));

// ✅ Importação das Rotas
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const disciplinasRoutes = require("./src/routes/disciplinasRoutes");
const estudosRoutes = require("./src/routes/estudosRoutes");
const usuariosRoutes = require("./src/routes/usuariosRoutes");
app.use("/api/usuarios", usuariosRoutes);


// ✅ Registrar Rotas
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disciplinas", disciplinasRoutes); // 🔥 Aqui está correto!
app.use("/api/estudos", estudosRoutes);

// ✅ Rotas para páginas estáticas
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ✅ Tratamento de erro 404 para APIs
app.use("/api", (req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

// ✅ Tratamento de erro 404 para páginas comuns
app.use((req, res) => {
    res.status(404).send("Página não encontrada");
});

// ✅ Inicia o servidor corretamente
const PORT = process.env.PORT || 1000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
