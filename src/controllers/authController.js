const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
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
    
    // Retorne o id e o nome diretamente para que o front-end possa armazenar
    res.status(200).json({ 
      message: '✅ Login bem-sucedido',
      usuario_id: user.id,
      nome: user.nome
    });
    
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
