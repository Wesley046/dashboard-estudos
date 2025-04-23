// src/routes/simuladoAlunoRoutes.js
const express = require('express');
const router = express.Router();
const simuladoAlunoController = require('../controllers/simuladoAlunoController');

// 🔹 Nova rota: Buscar todas as provas disponíveis (adicione isso)
router.get('/provas', simuladoAlunoController.buscarProvasPorSimulado);

// 🔹 Nova rota: Buscar todos os simulados disponíveis
router.get('/:simuladoId/provas', simuladoAlunoController.buscarSimuladosDisponiveis);

// 🔸 Buscar as questões de um simulado específico
router.get('/:simuladoId/provas/:provaId/questoes', simuladoAlunoController.buscarQuestoes);

// 🔸 Registrar as respostas do aluno e calcular a nota
router.post('/:simuladoId/provas/:provaId/registrarRespostas', simuladoAlunoController.registrarRespostas);

module.exports = router;
