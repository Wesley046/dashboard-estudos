const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./src/config/db');
const path = require('path');

// Configuração do body-parser para o express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (como HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial, redirecionando para login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  console.log('Dados recebidos:', { email, senha }); // Log para depuração

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    console.log('Resultado da consulta:', result.rows); // Log para depuração

    if (result.rows.length === 0) {
      console.log('Email não encontrado no banco de dados'); // Log para depuração
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];
    console.log('Usuário encontrado:', user); // Log para depuração

    // Verificação da senha com bcrypt
    const match = await bcrypt.compare(senha, user.senha);
    console.log('Senha correta?', match); // Log para depuração

    if (!match) {
      console.log('Senha incorreta'); // Log para depuração
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }

    console.log('Login bem-sucedido'); // Log para depuração
    res.status(200).json({ message: 'Login bem-sucedido', user });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// play server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});