const db = require('../config/db');

exports.showDashboard = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM estudos');
    res.status(200).json({ estudos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};
