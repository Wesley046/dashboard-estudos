document.addEventListener("DOMContentLoaded", () => {
    // Botão de abrir/fechar menu lateral
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("hidden");
    });

    // Botão para abrir e fechar formulário
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");
    const formPopup = document.getElementById("formPopup");

    openFormButton.addEventListener("click", () => {
        formPopup.style.display = "block";
    });

    closeFormButton.addEventListener("click", () => {
        formPopup.style.display = "none";
    });

    // Envio do formulário para o backend
    const studyForm = document.getElementById("studyForm");

    studyForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Recupera o usuario_id do localStorage
        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
            alert("Erro: Usuário não autenticado. Faça login novamente.");
            console.error("Erro: usuario_id não encontrado no localStorage.");
            return;
        }

        const formData = {
            usuario_id: usuarioId,
            disciplina: document.getElementById("disciplina").value,
            horas_estudadas: document.getElementById("horas").value,
            data_estudo: document.getElementById("data").value,
            questoes_erradas: document.getElementById("questoes_erradas").value,
            questoes_certas: document.getElementById("questoes_certas").value,
            tipo_estudo: document.getElementById("tipo_estudo").value,
        };

        try {
            const response = await fetch("/api/estudos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Estudo registrado com sucesso!");
                formPopup.style.display = "none";
                studyForm.reset();
                carregarGraficos(); // Atualiza os gráficos após inserção
            } else {
                alert("Erro ao registrar estudo: " + result.error);
                console.error("Erro ao registrar estudo:", result);
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro na conexão com o servidor.");
        }
    });

    // Função para carregar gráficos
    async function carregarGraficos() {
        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
            console.error("Erro: usuario_id não encontrado no localStorage.");
            return;
        }

        try {
            const response = await fetch(`/api/estudos/graficos?usuario_id=${usuarioId}`);
            const data = await response.json();

            // Gráfico de linhas
            gerarGraficoLinhas(data.questoes);
            
            // Gráfico de pizza
            gerarGraficoPizza(data.tipoEstudo);
            
            // Gráfico de barras
            gerarGraficoBarras(data.disciplina);
            
            // Exibir total de dias estudados
            document.getElementById("totalDias").innerText = data.totalDias;
        } catch (error) {
            console.error("Erro ao carregar gráficos:", error);
        }
    }

    // Funções para gerar gráficos
    function gerarGraficoLinhas(questoes) {
        const ctx = document.getElementById('lineChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: questoes.map(q => q.data_estudo),
                datasets: [{
                    label: 'Questões Erradas',
                    data: questoes.map(q => q.total_erradas),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }, {
                    label: 'Questões Certas',
                    data: questoes.map(q => q.total_certas),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function gerarGraficoPizza(tipoEstudo) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: tipoEstudo.map(t => t.tipo_estudo),
                datasets: [{
                    label: 'Horas por Tipo de Estudo',
                    data: tipoEstudo.map(t => t.total_horas),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }

    function gerarGraficoBarras(disciplina) {
        const ctx = document.getElementById('barChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: disciplina.map(d => d.disciplina),
                datasets: [{
                    label: 'Horas por Disciplina',
                    data: disciplina.map(d => d.total_horas),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    carregarGraficos(); // Carrega os gráficos ao iniciar a página
});