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

// ✅ Corrigir erro 404 no Render (Forçar backend a escutar corretamente)
const PORT = process.env.PORT || 1000;
const HOST = '0.0.0.0'; // Corrige problema de não encontrar rotas no Render

console.log(`📂 Servindo arquivos estáticos de:`, path.join(__dirname, 'public'));

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

// ✅ Rota de login corrigida
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const result = await db.query('SELECT id, nome, email, senha FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(senha, user.senha);

        if (!match) {
            return res.status(400).json({ error: 'Email ou senha incorretos' });
        }

        res.status(200).json({ 
            message: '✅ Login bem-sucedido', 
            usuario_id: user.id,
            nome: user.nome
        });

    } catch (err) {
        console.error('❌ Erro no login:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ✅ Inicia o servidor corrigido para Render
app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
