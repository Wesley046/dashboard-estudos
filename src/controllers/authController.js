const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    // Consulta o usuário pelo email
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }
    
    const user = result.rows[0];
    console.log("✅ Usuário encontrado:", user.email);

    // Compara a senha fornecida com o hash armazenado no banco
    const match = await bcrypt.compare(senha, user.senha);
    console.log(`🔍 Resultado da verificação da senha: ${match ? "✅ Correta" : "❌ Incorreta"}`);

    if (!match) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }
    
    // Retorna a resposta de login bem-sucedido
    res.status(200).json({ message: 'Login bem-sucedido', user });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
