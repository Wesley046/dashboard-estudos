const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./src/config/db');
const path = require('path');
require('dotenv').config(); // Carrega variáveis de ambiente

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página inicial
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Rota para exibir a tela de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para exibir a dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rota de login
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

        // Retorna apenas os dados necessários, incluindo o ID do usuário
        res.status(200).json({ 
            message: 'Login bem-sucedido', 
            usuario_id: user.id,
            nome: user.nome
        });

    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Rota para inserir estudos no banco
app.post('/api/estudos', async (req, res) => {
    const { usuario_id, disciplina, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: "Usuário não autenticado" });
    }

    try {
        await db.query(
            "INSERT INTO estudos (usuario_id, disciplina, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [usuario_id, disciplina, horas_estudadas, data_estudo, questoes_erradas, questoes_certas, tipo_estudo]
        );

        res.status(201).json({ message: "Estudo cadastrado com sucesso!" });
    } catch (err) {
        console.error("Erro ao cadastrar estudo:", err);
        res.status(500).json({ error: "Erro ao cadastrar estudo no banco de dados" });
    }
});

// Rota para obter dados dos gráficos
app.get('/api/estudos/graficos', async (req, res) => {
    const usuario_id = req.query.usuario_id;
    
    if (!usuario_id) {
        return res.status(400).json({ error: "Usuário não autenticado" });
    }

    try {
        const questoesQuery = await db.query(`
            SELECT data_estudo, 
                   SUM(questoes_erradas) AS total_erradas, 
                   SUM(questoes_certas) AS total_certas
            FROM estudos 
            WHERE usuario_id = $1
            GROUP BY data_estudo
            ORDER BY data_estudo;
        `, [usuario_id]);

        const tipoEstudoQuery = await db.query(`
            SELECT tipo_estudo, SUM(horas_estudadas) AS total_horas 
            FROM estudos 
            WHERE usuario_id = $1
            GROUP BY tipo_estudo;
        `, [usuario_id]);

        const disciplinaQuery = await db.query(`
            SELECT disciplina, SUM(horas_estudadas) AS total_horas 
            FROM estudos 
            WHERE usuario_id = $1
            GROUP BY disciplina;
        `, [usuario_id]);

        const diasEstudadosQuery = await db.query(`
            SELECT COUNT(DISTINCT data_estudo) AS total_dias 
            FROM estudos 
            WHERE usuario_id = $1;
        `, [usuario_id]);

        res.json({
            questoes: questoesQuery.rows,
            tipoEstudo: tipoEstudoQuery.rows,
            disciplina: disciplinaQuery.rows,
            totalDias: diasEstudadosQuery.rows[0].total_dias
        });

    } catch (err) {
        console.error("Erro ao buscar dados para os gráficos:", err);
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});

// Servidor rodando na porta 1000
const PORT = 1000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});