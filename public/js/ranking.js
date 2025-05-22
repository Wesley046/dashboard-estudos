document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Iniciando carregamento do ranking...');

        // Configuração da URL base da API
        const API_BASE_URL = 'https://dashboard-objetivo-policial.onrender.com';

        // Elementos do DOM
        const rankingList = document.getElementById('rankingList');
        const rankingToggle = document.getElementById('rankingToggle');
        const simuladoFilterGroup = document.getElementById('simuladoFilterGroup');
        const simuladoFilter = document.getElementById('simuladoFilter');
        const disciplinaFilter = document.getElementById('disciplinaFilter');
        const filterButton = document.getElementById('filterButton');
        const resetButton = document.getElementById('resetButton');
        const dataInicioInput = document.getElementById('dataInicio');
        const dataFimInput = document.getElementById('dataFim');
        const assuntoFilter = document.getElementById('assuntoFilter');

        // Carregar dados iniciais
        await carregarSimulados();
        await carregarDisciplinas();
        await carregarRankingData(); // Carrega com o estado inicial do toggle

        // Função para exibir mensagens de erro
        function mostrarErro(message) {
            if (rankingList) {
                rankingList.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${message}
                    </div>
                `;
            }
        }

        // Função para carregar os simulados
        // Função para carregar os simulados
        async function carregarSimulados() {
            try {
                simuladoFilter.innerHTML = '<option value="">Carregando simulados...</option>';

                const response = await fetch(`${API_BASE_URL}/api/ranking-simulados/simulados`);
                if (!response.ok) throw new Error('Erro ao carregar simulados');

                const simulados = await response.json();

                simuladoFilter.innerHTML = '<option value="">Selecione um simulado</option>';

                simulados.forEach(simulado => {
                    const option = document.createElement('option');
                    option.value = simulado.id;
                    option.textContent = `Simulado ${simulado.numero_simulado} - ${simulado.prova}`;
                    simuladoFilter.appendChild(option);
                });

            } catch (error) {
                console.error('Erro ao carregar simulados:', error);
                simuladoFilter.innerHTML = '<option value="">Erro ao carregar simulados</option>';
            }
        }

        // Função para carregar as disciplinas
        async function carregarDisciplinas() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/disciplinas`);
                if (!response.ok) throw new Error('Erro ao carregar disciplinas');

                const disciplinas = await response.json();
                disciplinaFilter.innerHTML = '<option value="">Todas disciplinas</option>';

                disciplinas.forEach(disciplina => {
                    const option = document.createElement('option');
                    option.value = disciplina.disciplina;
                    option.textContent = disciplina.disciplina;
                    disciplinaFilter.appendChild(option);
                });
            } catch (error) {
                console.error('Erro ao carregar disciplinas:', error);
                mostrarErro('Erro ao carregar lista de disciplinas. Tente recarregar a página.');
            }
        }

        // Função para carregar os dados do ranking
        async function carregarRankingData() {
            try {
                rankingList.innerHTML = '<div class="loading">Carregando...</div>';

                const isSimulado = rankingToggle.checked;
                let url, params;

                if (isSimulado) {
                    // Ranking de Simulados
                    const simuladoId = simuladoFilter.value;
                    if (!simuladoId && simuladoFilter.options.length > 1) {
                        // Se não houver simulado selecionado, seleciona o primeiro disponível
                        simuladoFilter.value = simuladoFilter.options[1].value;
                        return await carregarRankingData();
                    }
                    if (!simuladoId) throw new Error('Selecione um simulado primeiro');

                    url = `${API_BASE_URL}/api/ranking-simulados/${simuladoId}`;
                } else {
                    // Ranking de Questões
                    url = `${API_BASE_URL}/api/ranking`;
                    params = new URLSearchParams({
                        tipoRanking: 'questoes',
                        disciplina: disciplinaFilter.value || '',
                        assunto: assuntoFilter.value || '',
                        data_inicio: dataInicioInput.value || '',
                        data_fim: dataFimInput.value || ''
                    });
                    url += `?${params.toString()}`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Erro ${response.status}`);
                }

                const data = await response.json();
                renderRanking(data);

            } catch (error) {
                console.error('Erro ao carregar ranking:', error);
                mostrarErro(error.message);
            }
        }

        // Função para renderizar os rankings
        function renderRanking(rankingData) {
            if (!rankingList) {
                console.error('Elemento rankingList não encontrado');
                return;
            }

            rankingList.innerHTML = '';

            if (!rankingData || rankingData.length === 0) {
                rankingList.innerHTML = `
                    <div class="no-data-message">
                        <i class="fas fa-info-circle"></i>
                        Nenhum dado disponível para os filtros selecionados
                    </div>
                `;
                return;
            }

            rankingData.forEach((aluno, index) => {
                const alunoElement = document.createElement('div');
                alunoElement.className = 'ranking-item';

                const aproveitamento = aluno.aproveitamento ? parseFloat(aluno.aproveitamento).toFixed(1) : '0.0';

                alunoElement.innerHTML = `
                    <div class="rank-position">${index + 1}º</div>
                    <div class="student-name">${aluno.nome || 'N/A'}</div>
                    <div class="questions-stats">
                        <span class="correct-questions">${aluno.total_certas || 0}</span>
                        <span class="separator">/</span>
                        <span class="wrong-questions">${aluno.total_erradas || 0}</span>
                    </div>
                    <div class="student-note">
                        <span class="nota-final">${aluno.nota_final || 0}</span>
                    </div>
                    <div class="student-performance">
                        <span class="performance-badge ${getBadgeClass(aproveitamento)}"></span>
                        ${aproveitamento}%
                    </div>
                `;
                rankingList.appendChild(alunoElement);
            });
        }

        // Função para obter a classe do desempenho do aluno
        function getBadgeClass(aproveitamento) {
            const perf = parseFloat(aproveitamento);
            if (perf >= 80) return 'badge-green';
            if (perf >= 50) return 'badge-yellow';
            return 'badge-red';
        }

    } catch (error) {
        console.error('Erro inesperado:', error);
        mostrarErro('Ocorreu um erro inesperado. Por favor, recarregue a página.');
    }
});