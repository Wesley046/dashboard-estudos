const db = require('../config/db');
const bcrypt = require('bcrypt'); // Importar o bcrypt

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }
    
    const user = result.rows[0];

    // Comparar a senha usando bcrypt
    const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Email ou senha incorretos' });
    }
    
    res.status(200).json({ message: 'Login bem-sucedido', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

