const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./src/config/db');
const path = require('path');
require('dotenv').config(); // Carrega variáveis de ambiente

// ✅ Middleware para processar JSON e formulários
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Servir arquivos estáticos corretamente
app.use(express.static(path.join(__dirname, 'public')));

console.log("📂 Servindo arquivos estáticos de:", path.join(__dirname, 'public'));

// ✅ Rota para a página inicial
app.get('/', (req, res) => {
    res.redirect('/login');
});

// ✅ Rota para exibir a tela de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ✅ Rota para exibir a dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ✅ Rota para buscar disciplinas
app.get('/api/disciplinas', async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT disciplina FROM disciplinas_assuntos ORDER BY disciplina;');
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Erro ao buscar disciplinas:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// ✅ Rota para buscar assuntos com base na disciplina selecionada
app.get('/api/assuntos/:disciplina', async (req, res) => {
    try {
        const disciplina = req.params.disciplina;
        const result = await db.query('SELECT assunto FROM disciplinas_assuntos WHERE disciplina = $1 ORDER BY assunto;', [disciplina]);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Erro ao buscar assuntos:', error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// ✅ Inicia o servidor corrigido para Render
const PORT = process.env.PORT || 1000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
