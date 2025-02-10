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

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];

    // Verificação da senha com bcrypt
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }

    res.status(200).json({ message: 'Login bem-sucedido', user });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});