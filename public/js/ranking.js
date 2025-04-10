document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Iniciando carregamento do ranking...');

        // 1. Configuração do Menu Lateral
        const setupMenuLateral = () => {
            const sidebar = document.querySelector(".sidebar");
            const toggleButton = document.querySelector("#toggleSidebar");
            
            if (!sidebar || !toggleButton) {
                console.error("Elementos do menu não encontrados");
                return;
            }

            // Toggle do menu
            toggleButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                sidebar.classList.toggle("expanded");
                
                // Fechar automaticamente em mobile após 3 segundos
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        sidebar.classList.remove("expanded");
                    }, 3000);
                }
            });

            // Fechar ao clicar fora do menu (desktop)
            document.addEventListener("click", (e) => {
                if (!sidebar.contains(e.target) && !toggleButton.contains(e.target)) {
                    sidebar.classList.remove("expanded");
                }
            });

            // Controle de navegação
            const menuActions = {
                openForm: () => window.location.href = "/dashboard",
                btnRanking: null, // Não faz nada pois já está na página
                openCronograma: () => window.location.href = "/cronograma"
            };

            Object.entries(menuActions).forEach(([id, action]) => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.addEventListener("click", (e) => {
                        e.preventDefault();
                        if (window.innerWidth <= 768) {
                            sidebar.classList.remove("expanded");
                        }
                        if (action) action();
                    });
                }
            });
        };
// Função para redirecionar para o Dashboard
function redirectToDashboard() {
    window.location.href = "dashboard.html"; // Substitua pelo caminho correto do seu dashboard
}

// Adiciona o event listener ao botão Dashboard quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const dashboardButton = document.getElementById('dashboardButton'); // Certifique-se que o botão tem este ID
    
    if (dashboardButton) {
        dashboardButton.addEventListener('click', redirectToDashboard);
    }
});
        // Inicializa o menu lateral
        setupMenuLateral();

        // 2. Elementos dos Filtros
        const rankingList = document.getElementById('rankingList');
        const disciplinaFilter = document.getElementById('disciplinaFilter');
        const assuntoFilter = document.getElementById('assuntoFilter');
        const filterButton = document.getElementById('filterButton');
        const resetButton = document.getElementById('resetButton');
        
        // 3. Carregar dados iniciais
        await carregarDisciplinas();
        await carregarRankingData();
        
        // 4. Event listeners para os filtros
        if (disciplinaFilter) {
            disciplinaFilter.addEventListener('change', async function() {
                await carregarAssuntos(this.value);
            });
        }

        if (filterButton) {
            filterButton.addEventListener('click', async function(e) {
                e.preventDefault();
                await carregarRankingData();
            });
        }
        
        if (resetButton) {
            resetButton.addEventListener('click', async function(e) {
                e.preventDefault();
                if (disciplinaFilter) disciplinaFilter.value = '';
                if (assuntoFilter) assuntoFilter.value = '';
                await carregarRankingData();
            });
        }

    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        showErrorMessage('Erro ao carregar o ranking. Tente recarregar a página.');
    }

    // Função para carregar os dados do ranking
    async function carregarRankingData() {
        try {
            const disciplina = document.getElementById('disciplinaFilter')?.value || '';
            const assunto = document.getElementById('assuntoFilter')?.value || '';
            
            let url = '/api/ranking';
            const params = new URLSearchParams();
            
            if (disciplina) params.append('disciplina', disciplina);
            if (assunto) params.append('assunto', assunto);
            
            params.append('_', Date.now()); // Evitar cache
            
            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const rankingData = await response.json();
            renderRanking(rankingData);
            
        } catch (error) {
            console.error('Erro ao carregar dados do ranking:', error);
            showErrorMessage('Erro ao carregar dados. Tente novamente.');
        }
    }
    
    // Função para renderizar o ranking
    function renderRanking(rankingData) {
        const rankingList = document.getElementById('rankingList');
        if (!rankingList) return;
        
        rankingList.innerHTML = '';
        
        if (!rankingData || rankingData.length === 0) {
            rankingList.innerHTML = '<p class="no-data">Nenhum dado de ranking disponível</p>';
            return;
        }
        
        rankingData.forEach((aluno, index) => {
            const certas = aluno.total_certas || 0;
            const erradas = aluno.total_erradas || 0;
            const total = aluno.total_questoes || (certas + erradas);
            const aproveitamento = parseFloat(aluno.aproveitamento || 0).toFixed(1);
            
            const alunoElement = document.createElement('div');
            alunoElement.className = 'ranking-item';
            alunoElement.innerHTML = `
                <div class="rank-position">${index + 1}º</div>
                <div class="student-name">${aluno.nome || 'N/A'}</div>
                <div class="questions-stats">
                    <span class="correct-questions">${certas}</span>
                    <span class="separator">/</span>
                    <span class="wrong-questions">${erradas}</span>
                </div>
                <div class="total-questions">${total}</div>
                <div class="student-performance">
                    <span class="performance-badge ${getBadgeClass(aproveitamento)}"></span>
                    ${aproveitamento}%
                </div>
            `;
            rankingList.appendChild(alunoElement);
        });
    }

    // Funções auxiliares
    function getBadgeClass(aproveitamento) {
        const perf = parseFloat(aproveitamento);
        return perf >= 80 ? 'badge-green' : 
               perf >= 50 ? 'badge-yellow' : 'badge-red';
    }

    async function carregarDisciplinas() {
        try {
            const response = await fetch('/api/disciplinas');
            if (!response.ok) throw new Error('Erro ao buscar disciplinas');
            
            const disciplinas = await response.json();
            const select = document.getElementById('disciplinaFilter');
            
            if (select) {
                select.innerHTML = '<option value="">Todas disciplinas</option>';
                disciplinas.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.disciplina;
                    option.textContent = item.disciplina;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar disciplinas:', error);
        }
    }
    
    async function carregarAssuntos(disciplinaNome) {
        try {
            const assuntoFilter = document.getElementById('assuntoFilter');
            if (!assuntoFilter) return;
            
            assuntoFilter.innerHTML = '<option value="">Carregando...</option>';
            assuntoFilter.disabled = true;
            
            if (!disciplinaNome) {
                assuntoFilter.innerHTML = '<option value="">Todos assuntos</option>';
                return;
            }
            
            const response = await fetch(`/api/disciplinas/assuntos?disciplina=${encodeURIComponent(disciplinaNome)}&_=${Date.now()}`);
            if (!response.ok) throw new Error('Erro ao buscar assuntos');
            
            const assuntos = await response.json();
            
            assuntoFilter.innerHTML = '<option value="">Todos assuntos</option>';
            assuntos.forEach(item => {
                const option = document.createElement('option');
                option.value = item.nome;
                option.textContent = item.nome;
                assuntoFilter.appendChild(option);
            });
            
            assuntoFilter.disabled = false;
            
        } catch (error) {
            console.error('Erro ao carregar assuntos:', error);
            const assuntoFilter = document.getElementById('assuntoFilter');
            if (assuntoFilter) {
                assuntoFilter.innerHTML = '<option value="">Erro ao carregar</option>';
            }
        }
    }
    
    function showErrorMessage(message) {
        const rankingList = document.getElementById('rankingList');
        if (rankingList) {
            rankingList.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }
});