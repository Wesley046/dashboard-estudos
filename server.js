const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./src/config/db');
const path = require('path');
require('dotenv').config(); // Carrega variáveis de ambiente

// ✅ Permitir requisições de qualquer origem (CORS)
app.use(cors());

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

// ✅ Rota para inserir os dados do formulário no banco
app.post('/api/estudos', async (req, res) => {
  const { usuario_id, disciplina, assunto, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo } = req.body;

  if (!usuario_id || !disciplina || !assunto || !horas_estudadas || !data_estudo || !tipo_estudo) {
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos!" });
  }

  try {
      await db.query(
          "INSERT INTO estudos (usuario_id, disciplina, assunto, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [usuario_id, disciplina, assunto, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo]
      );

      console.log("✅ Estudo cadastrado com sucesso!");
      res.status(201).json({ message: "✅ Estudo cadastrado com sucesso!" });

  } catch (err) {
      console.error("❌ Erro ao cadastrar estudo:", err);
      res.status(500).json({ error: "Erro interno ao cadastrar estudo no banco de dados" });
  }
});

// ✅ Corrigir erro 404 no Render (Garantir que todas as rotas API sejam reconhecidas)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// ✅ Inicia o servidor corrigido para Render
const PORT = process.env.PORT || 1000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
