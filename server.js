const express = require('express');
const app = express();
const port = process.env.PORT || 10000;
const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.json());

// Importar rotas
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);

// Rota de Teste
app.get('/', (req, res) => {
  res.send('Bem-vindo ao projeto');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
  