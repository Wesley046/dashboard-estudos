const express = require("express");
const db = require("../config/db"); // Ajuste o caminho conforme seu projeto
const router = express.Router();

// Middleware para verificar existência do simulado
async function verificarSimulado(req, res, next) {
  try {
    const { simulado_id } = req.params;
    const result = await client.query(
      "SELECT id, tipo_simulado FROM public.cadastro_simulados WHERE id = $1",
      [simulado_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Simulado não encontrado" });
    }
    
    req.tipo_simulado = result.rows[0].tipo_simulado;
    next();
  } catch (error) {
    console.error("Erro ao verificar simulado:", error);
    res.status(500).json({ error: "Erro interno ao verificar simulado" });
  }
}

// Rota GET para carregar todos os simulados
router.get("/simulados", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT id, numero_simulado, prova, tipo_simulado FROM public.cadastro_simulados"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao carregar simulados:", error);
    res.status(500).json({ error: "Erro ao carregar simulados" });
  }
});

// Rota GET para carregar questões + tipo de prova
router.get("/simulados/:simulado_id/questoes", verificarSimulado, async (req, res) => {
    try {
      const { simulado_id } = req.params;
      const result = await client.query(
        `SELECT id, numero_questao, gabarito, peso, comentario, disciplina 
         FROM public.questoes_simulado 
         WHERE simulado_id = $1 
         ORDER BY numero_questao`,
        [simulado_id]
      );
      
      res.status(200).json({
        tipo_simulado: req.tipo_simulado,
        questoes: result.rows
      });
    } catch (error) {
      console.error("Erro ao carregar questões:", error);
      res.status(500).json({ error: "Erro ao carregar questões" });
    }
  });

// Rota POST para registrar respostas - Versão corrigida
router.post("/respostas", async (req, res) => {
  const { aluno_id, simulado_id, respostas } = req.body;

  // Validação inicial
  if (!aluno_id || !simulado_id || !respostas || !Array.isArray(respostas)) {
    return res.status(400).json({
      success: false,
      error: "Dados inválidos",
      message: "Forneça aluno_id, simulado_id e um array de respostas"
    });
  }

  try {
    await client.query("BEGIN");

    // 1. Verificar se aluno e simulado existem
    const verification = await client.query(
      `SELECT 1 FROM public.usuarios WHERE id = $1 UNION ALL
       SELECT 1 FROM public.cadastro_simulados WHERE id = $2`,
      [aluno_id, simulado_id]
    );
    
    if (verification.rows.length < 2) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: "Não encontrado",
        message: "Aluno ou simulado não encontrado"
      });
    }

    // 2. Obter informações do simulado e questões COM GABARITO
    const simuladoInfo = await client.query(
      `SELECT tipo_simulado FROM public.cadastro_simulados WHERE id = $1`,
      [simulado_id]
    );
    const tipoSimulado = simuladoInfo.rows[0].tipo_simulado;

    const questoes = await client.query(
      `SELECT numero_questao, gabarito, peso, comentario, disciplina 
       FROM public.questoes_simulado 
       WHERE simulado_id = $1 AND gabarito IS NOT NULL
       ORDER BY numero_questao`,
      [simulado_id]
    );

    if (questoes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: "Gabarito incompleto",
        message: "Nenhuma questão com gabarito válido encontrada para este simulado"
      });
    }

    // 3. Processar respostas e calcular nota
    let acertos = 0;
    let totalPontos = 0;
    let totalPossivel = 0;
    const detalhes = [];
    const disciplinasMap = new Map(); // Mapa para armazenar dados por disciplina

    for (const resposta of respostas) {
        const questao = questoes.rows.find(q => q.numero_questao === resposta.numero_questao);
        
        if (!questao || !questao.gabarito) {
            console.warn(`Questão ${resposta.numero_questao} sem gabarito válido`);
            continue;
        }

        const respostaAluno = resposta.resposta_aluno?.toUpperCase().trim() || '';
        const gabaritoOficial = questao.gabarito.toUpperCase().trim();
        const pesoQuestao = parseFloat(questao.peso) || 1;
        let nota = 0;
        let acertou = false;

        // Lógica de correção por tipo de simulado
        if (tipoSimulado === "Certo ou Errado") {
            acertou = respostaAluno === gabaritoOficial;
            nota = acertou ? pesoQuestao : -1;
        } else {
            acertou = respostaAluno === gabaritoOficial;
            nota = acertou ? pesoQuestao : 0;
        }

        if (acertou) acertos++;
        totalPontos += nota;
        totalPossivel += pesoQuestao;

        // Acumular dados por disciplina
        if (questao.disciplina) {
            if (!disciplinasMap.has(questao.disciplina)) {
                disciplinasMap.set(questao.disciplina, {
                    acertos: 0,
                    total: 0,
                    pontos: 0
                });
            }
            const disciplina = disciplinasMap.get(questao.disciplina);
            disciplina.total++;
            disciplina.pontos += nota;
            if (acertou) disciplina.acertos++;
        }

        // 4. Registrar resposta no banco
        await client.query(
          `INSERT INTO public.respostas_aluno (
            aluno_id, simulado_id, numero_questao, resposta,
            gabarito_oficial, peso, comentario, tipo_prova, nota, acertou
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT ON CONSTRAINT unique_resposta 
          DO UPDATE SET
            resposta = EXCLUDED.resposta,
            nota = EXCLUDED.nota,
            acertou = EXCLUDED.acertou`,
          [
            aluno_id,
            simulado_id,
            resposta.numero_questao,
            resposta.resposta_aluno,
            gabaritoOficial,
            questao.peso,
            questao.comentario,
            tipoSimulado,
            nota,
            acertou
          ]
        );

        detalhes.push({
          numero_questao: resposta.numero_questao,
          resposta_aluno: resposta.resposta_aluno,
          gabarito: gabaritoOficial,
          peso: questao.peso,
          nota,
          acertou,
          tipo_prova: tipoSimulado,
          comentario: questao.comentario,
          disciplina: questao.disciplina // Adicionando a disciplina aqui
        });
    }

    await client.query("COMMIT");

    // 5. Calcular percentuais e desempenho por disciplina
    const disciplinas = Array.from(disciplinasMap.entries()).map(([nome, dados]) => ({
        nome,
        acertos: dados.acertos,
        erros: dados.total - dados.acertos,
        total: dados.total,
        pontos: dados.pontos,
        percentual: dados.total > 0 ? (dados.acertos / dados.total * 100) : 0
    }));

    // Ordenar disciplinas por percentual
    disciplinas.sort((a, b) => b.percentual - a.percentual);

    // Identificar melhor e pior disciplina
    const melhorDisciplina = disciplinas.length > 0 ? disciplinas[0] : null;
    const piorDisciplina = disciplinas.length > 0 ? disciplinas[disciplinas.length - 1] : null;

    totalPontos = parseFloat(totalPontos.toFixed(2));
    totalPossivel = parseFloat(totalPossivel.toFixed(2));

    const percentual_acertos = totalPossivel > 0 ? Math.round((totalPontos / totalPossivel) * 100) : 0;

// Retornar o percentual no formato desejado junto com o total de pontos
return res.json({
    success: true,
    data: {
        total_questoes: questoes.rows.length,
        acertos,
        total_pontos: totalPontos, // Total de pontos certo
        total_pontos_possivel: totalPossivel,
        percentual: percentual_acertos, // Percentual de acertos
        tipo_simulado: tipoSimulado,
        disciplinas,
        melhor_disciplina: melhorDisciplina,
        pior_disciplina: piorDisciplina,
        detalhes: detalhes.sort((a, b) => a.numero_questao - b.numero_questao)
    }
});

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro detalhado:", error);
    return res.status(500).json({
      success: false,
      error: "Erro no servidor",
      message: error.message.includes("gabarito") 
        ? "Erro ao processar gabarito das questões" 
        : "Falha ao processar respostas"
    });
  }
});

// rota dos graficos
// Rota GET para desempenho do aluno - VERSÃO CORRIGIDA
router.get("/aluno/:aluno_id/desempenho", async (req, res) => {
  try {
    // Obter o ID do aluno dos parâmetros da rota
    const alunoId = req.params.aluno_id;
    
    if (!alunoId || isNaN(alunoId)) {
      return res.status(400).json({ 
        success: false,
        error: "ID do aluno inválido" 
      });
    }

    // Dados consolidados de desempenho
    const desempenhoQuery = await client.query(`
      SELECT 
        COUNT(CASE WHEN ra.acertou = true THEN 1 END) as acertos,
        COUNT(CASE WHEN ra.acertou = false THEN 1 END) as erros,
        COUNT(*) as total_questoes,
        AVG(ra.nota) as media_nota,
        cs.prova as nome_simulado,
        cs.tipo_simulado,
        qs.disciplina
      FROM public.respostas_aluno ra
      JOIN public.cadastro_simulados cs ON ra.simulado_id = cs.id
      JOIN public.questoes_simulado qs ON ra.simulado_id = qs.simulado_id 
        AND ra.numero_questao = qs.numero_questao
      WHERE ra.aluno_id = $1
      GROUP BY cs.prova, cs.tipo_simulado, qs.disciplina
      ORDER BY MAX(ra.created_at) DESC
    `, [alunoId]);

    // Dados por disciplina
    const disciplinaQuery = await client.query(`
      SELECT 
        qs.disciplina,
        COUNT(CASE WHEN ra.acertou = true THEN 1 END) as acertos,
        COUNT(CASE WHEN ra.acertou = false THEN 1 END) as erros,
        COUNT(*) as total,
        ROUND(COUNT(CASE WHEN ra.acertou = true THEN 1 END) * 100.0 / COUNT(*), 2) as percentual_acerto
      FROM public.respostas_aluno ra
      JOIN public.questoes_simulado qs ON ra.simulado_id = qs.simulado_id 
        AND ra.numero_questao = qs.numero_questao
      WHERE ra.aluno_id = $1 AND qs.disciplina IS NOT NULL
      GROUP BY qs.disciplina
      ORDER BY percentual_acerto DESC
    `, [alunoId]);

    // Dados para evolução temporal
    const evolucaoQuery = await client.query(`
      SELECT
        DATE(ra.created_at) as data,
        COUNT(CASE WHEN ra.acertou = true THEN 1 END) as acertos,
        COUNT(*) as total_questoes,
        ROUND(AVG(ra.nota), 2) as media_nota
      FROM public.respostas_aluno ra
      WHERE ra.aluno_id = $1
      GROUP BY DATE(ra.created_at)
      ORDER BY DATE(ra.created_at) ASC
    `, [alunoId]);

    // Notas finais por simulado
    const notasFinaisQuery = await client.query(`
      SELECT 
        cs.id as simulado_id,
        cs.prova as nome_simulado,
        SUM(ra.nota) as nota_final,
        MAX(ra.created_at) as data_realizacao
      FROM public.respostas_aluno ra
      JOIN public.cadastro_simulados cs ON ra.simulado_id = cs.id
      WHERE ra.aluno_id = $1
      GROUP BY cs.id, cs.prova
      ORDER BY MAX(ra.created_at) ASC
    `, [alunoId]);

    res.status(200).json({
      success: true,
      data: {
        desempenhoGeral: desempenhoQuery.rows,
        desempenhoPorDisciplina: disciplinaQuery.rows,
        evolucaoTemporal: evolucaoQuery.rows,
        notasFinais: notasFinaisQuery.rows
      }
    });

  } catch (error) {
    console.error("Erro ao carregar desempenho:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro ao carregar dados de desempenho",
      message: error.message 
    });
  }
});

module.exports = router;