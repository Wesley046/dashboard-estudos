const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Certifique-se de que o caminho esteja correto

// Endpoint para cadastro de usuário
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  try {
    // Verifica se o usuário já existe
    const existingUser = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado!' });
    }

    // Criptografa a senha
    const saltRounds = 10;
    const senhaCriptografada = bcrypt.hashSync(senha, saltRounds);

    // Insere o usuário no banco de dados
    const result = await db.query(
      "INSERT INTO usuarios (nome, email, senha, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id",
      [nome, email, senhaCriptografada]
    );

    console.log("✅ Usuário cadastrado com sucesso!", result.rows[0].id);
    res.status(201).json({ message: "Usuário cadastrado com sucesso!", id: result.rows[0].id });
  } catch (error) {
    console.error("❌ Erro ao cadastrar usuário:", error);
    res.status(500).json({ error: "Erro interno ao cadastrar usuário" });
  }
});

module.exports = router;
