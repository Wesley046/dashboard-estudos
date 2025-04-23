const { Pool } = require('pg'); // Importando o Pool para a conexão com o banco PostgreSQL
require('dotenv').config(); // Carregar as variáveis do arquivo .env

// Configuração da conexão com o banco de dados usando a URL do .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do banco de dados definida no .env
  ssl: {
    rejectUnauthorized: false, // Ajuste necessário para conexões seguras
  },
});

// Função para buscar simulados disponíveis
const buscarSimuladosDisponiveis = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT numero_simulado, tipo_simulado
      FROM cadastro_simulados
      ORDER BY numero_simulado ASC
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum simulado encontrado' });
    }

    // Retorna os simulados disponíveis
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar simulados disponíveis:', err);
    res.status(500).json({ error: 'Erro ao buscar simulados' });
  }
};

// Função para buscar as provas de um simulado específico
const buscarProvasPorSimulado = async (req, res) => {
    try {
      const { simuladoId } = req.params;
  
      if (!simuladoId) {
        return res.status(400).json({ error: 'Simulado ID não fornecido' });
      }
  
      // Ajuste na consulta SQL com base na estrutura do banco
      const result = await pool.query(`
        SELECT id, nome, quantidade_questoes
        FROM cadastro_provas
        WHERE simulado_id = $1
        ORDER BY nome
      `, [simuladoId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nenhuma prova encontrada para este simulado' });
      }
  
      // Retorna as provas para o simulado
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao buscar provas:', err);
      res.status(500).json({ error: 'Erro ao buscar provas' });
    }
  };
  
// Função para buscar as questões de um simulado e prova específicos
const buscarQuestoes = async (req, res) => {
  try {
    const { simuladoId, provaId } = req.params;

    if (!simuladoId || !provaId) {
      return res.status(400).json({ error: 'ID de simulado ou prova não fornecido' });
    }

    // Busca as questões associadas ao simulado e prova
    const result = await pool.query(`
      SELECT q.id, q.texto, q.tipo, q.peso
      FROM cadastro_simulados s
      JOIN cadastro_provas p ON p.simulado_id = s.id
      JOIN cadastro_questoes q ON q.prova_id = p.id
      WHERE s.id = $1 AND p.id = $2
    `, [simuladoId, provaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Simulado ou prova não encontrado' });
    }

    return res.status(200).json({ questoes: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar as questões' });
  }
};

// Função para registrar as respostas do aluno e calcular a nota
const registrarRespostas = async (req, res) => {
  try {
    const { simuladoId, provaId } = req.params;
    const respostas = req.body.respostas; // Array de respostas do aluno

    if (!Array.isArray(respostas) || respostas.length === 0) {
      return res.status(400).json({ error: 'Respostas inválidas ou vazias' });
    }

    // Busca as questões para o simulado e prova
    const result = await pool.query(`
      SELECT q.id, q.resposta, q.peso, q.tipo
      FROM cadastro_simulados s
      JOIN cadastro_provas p ON p.simulado_id = s.id
      JOIN cadastro_questoes q ON q.prova_id = p.id
      WHERE s.id = $1 AND p.id = $2
    `, [simuladoId, provaId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Simulado ou prova não encontrado' });
    }

    // Calcular a nota
    let notaFinal = 0;
    let questoesErradas = 0;
    let questoesCorretas = 0;

    for (let i = 0; i < respostas.length; i++) {
      const resposta = respostas[i];
      const questao = result.rows.find(q => q.id === resposta.questaoId);

      if (!questao) continue;

      const correta = questao.resposta === resposta.resposta;
      const peso = questao.peso;

      // Se a questão for correta, adiciona o peso
      if (correta) {
        questoesCorretas++;
        notaFinal += peso;
      } else {
        questoesErradas++;
      }
    }

    // Lógica para provas "Certo ou Errado" (anula a correta se errar uma)
    const tipoProva = result.rows[0].tipo;

    if (tipoProva === 'Certo ou Errado') {
      const questoesAnuladas = Math.min(questoesErradas, questoesCorretas);
      notaFinal -= questoesAnuladas * 2; // Subtrai o peso das questões anuladas
    }

    return res.status(200).json({
      notaFinal,
      questoesCorretas,
      questoesErradas,
      totalQuestoes: respostas.length
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao registrar respostas' });
  }
};

// Exportar as funções corretamente
module.exports = {
  buscarSimuladosDisponiveis,
  buscarProvasPorSimulado,
  buscarQuestoes,
  registrarRespostas,
};
