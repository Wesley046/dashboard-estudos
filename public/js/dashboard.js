document.addEventListener("DOMContentLoaded", async () => {
    let myChart = null;          // Instância do gráfico de linhas
    let myDoughnutChart = null;    // Instância do gráfico de rosca
    let myBarChart = null;         // Instância do gráfico de barras

    console.log("✅ dashboard.js carregado!");
    console.log(typeof Chart);

    async function carregarDadosGraficos() {
        try {
            const usuarioId = localStorage.getItem("usuario_id");
            if (!usuarioId) {
                console.error("❌ Usuário não autenticado.");
                return;
            }
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
            const dados = await response.json();
            console.log("✅ Dados carregados:", dados);

            const lineCanvas = document.getElementById("lineChart");
            if (!lineCanvas) {
                console.error("❌ O elemento #lineChart não foi encontrado no DOM.");
                return;
            }

            const questoesData = dados.questoes.map(item => ({
                data: new Date(item.data_estudo).toLocaleDateString(),
                certas: parseFloat(item.total_certas) || 0,
                erradas: parseFloat(item.total_erradas) || 0
            }));

            const datasQuestao = questoesData.map(item => item.data);
            const qtdCertas = questoesData.map(item => item.certas);
            const qtdErradas = questoesData.map(item => item.erradas);
            const ctxLine = lineCanvas.getContext("2d");

            // Se já houver um gráfico, destruí-lo antes de recriar
            if (myChart) {
                myChart.destroy();
            }

            myChart = new Chart(ctxLine, {
                type: "line",
                data: {
                    labels: datasQuestao,
                    datasets: [
                        {
                            label: "Questões Certas",
                            data: qtdCertas,
                            borderColor: "#36A2EB",
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            borderWidth: 2,
                            pointBackgroundColor: "#36A2EB",
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: "Questões Erradas",
                            data: qtdErradas,
                            borderColor: "#FF6384",
                            backgroundColor: "rgba(255, 99, 132, 0.2)",
                            borderWidth: 2,
                            pointBackgroundColor: "#FF6384",
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Total de Questões por Dia",
                            font: { size: 18 },
                            color: "#FFF"
                        }
                    }
                }
            });
        } catch (error) {
            console.error("❌ Erro ao carregar dados para os gráficos:", error);
        }
    }

    async function carregarDadosDoughnut() {
        try {
            console.log("📡 Carregando dados para o gráfico de rosca...");
    
            const usuarioId = localStorage.getItem("usuario_id");
            if (!usuarioId) {
                console.error("❌ Usuário não autenticado.");
                return;
            }
    
            // Buscar os dados da API para o gráfico de rosca
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
            const dados = await response.json();
    
            console.log("✅ Dados carregados para o gráfico de rosca:", dados);
            console.log("📌 Estrutura dos dados recebidos:", JSON.stringify(dados, null, 2));
    
            if (!dados.tipoEstudo || !Array.isArray(dados.tipoEstudo) || dados.tipoEstudo.length === 0) {
                console.warn("⚠️ Nenhum dado válido recebido para o gráfico de rosca.");
                return;
            }
    
            // Extraindo os rótulos e os valores corretamente a partir de 'tipoEstudo'
            const categorias = dados.tipoEstudo.map(item => item.tipo_estudo || "Desconhecido");
            const horasPorTipo = dados.tipoEstudo.map(item => parseFloat(item.total_horas) || 0);
    
            console.log("📊 Processando os dados do gráfico de rosca...");
            console.log("📌 Categorias (labels):", categorias);
            console.log("📌 Valores (data):", horasPorTipo);
    
            const doughnutCanvas = document.getElementById("doughnutChart");
            if (!doughnutCanvas) {
                console.error("❌ O elemento #doughnutChart não foi encontrado no DOM.");
                return;
            }
            const ctxDoughnut = doughnutCanvas.getContext("2d");
    
            if (myDoughnutChart) {
                myDoughnutChart.destroy();
            }
    
            myDoughnutChart = new Chart(ctxDoughnut, {
                type: "doughnut",
                data: {
                    labels: categorias,
                    datasets: [{
                        data: horasPorTipo,
                        backgroundColor: ["#87CEFA", "#8B0000", "#7FFFD4"],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "75%",
                    plugins: {
                        title: {
                            display: true,
                            text: "Porcentagem do Tempo de Estudo por Tipo",
                            font: { size: 18 },
                            color: "#FFF"
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed.toFixed(2)}h`;
                                }
                            },
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#FFF",
                            bodyColor: "#FFF"
                        },
                        legend: {
                            labels: { font: { size: 14 }, color: "#FFF" }
                        },
                        // Configuração do plugin de data labels:
                        datalabels: {
                            color: "#FFF",
                            font: { weight: 'bold', size: 14 },
                            formatter: function(value, context) {
                                return value;
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
            
            console.log("✅ Gráfico de rosca criado com sucesso!");
    
        } catch (error) {
            console.error("❌ Erro ao carregar dados para o gráfico de rosca:", error);
        }
    }
    
    async function carregarDadosBarras() {
        try {
            console.log("📡 Carregando dados para o gráfico de barras...");
    
            const usuarioId = localStorage.getItem("usuario_id");
            if (!usuarioId) {
                console.error("❌ Usuário não autenticado.");
                return;
            }
    
            // Buscar os dados do endpoint para questões por disciplina
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/questoesPorDisciplina?usuario_id=${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados de questões por disciplina");
            const dados = await response.json();
            console.log("✅ Dados para gráfico de barras carregados:", dados);
    
            if (!Array.isArray(dados) || dados.length === 0) {
                console.warn("⚠️ Nenhum dado válido recebido para o gráfico de barras.");
                return;
            }
    
            // Supondo que os dados tenham a estrutura:
            // [{ disciplina: "Matemática", total_questoes: 55 }, ... ]
            const disciplinas = dados.map(item => item.disciplina);
            const totalQuestoes = dados.map(item => parseInt(item.total_questoes) || 0);
    
            console.log("📊 Dados processados para gráfico de barras:");
            console.log("📌 Disciplinas:", disciplinas);
            console.log("📌 Total de Questões:", totalQuestoes);
    
            const barCanvas = document.getElementById("barChart");
            if (!barCanvas) {
                console.error("❌ O elemento #barChart não foi encontrado no DOM.");
                return;
            }
            const ctxBar = barCanvas.getContext("2d");
    
            if (myBarChart) {
                myBarChart.destroy();
            }
    
            myBarChart = new Chart(ctxBar, {
                type: "bar",
                data: {
                    labels: disciplinas,
                    datasets: [{
                        label: "Total de Questões Respondidas",
                        data: totalQuestoes,
                        backgroundColor: "#87CEFA",
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { color: "#FFF" },
                            title: { display: true, text: "Matérias", color: "#FFF" }
                        },
                        y: {
                            ticks: { color: "#FFF" },
                            title: { display: true, text: "Total de Questões", color: "#FFF" },
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: "#FFF" }
                        },
                        title: {
                            display: true,
                            text: "Questões Respondidas por Disciplina",
                            font: { size: 18 },
                            color: "#FFF"
                        },
                        tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#FFF",
                            bodyColor: "#FFF"
                        }
                    }
                }
            });
    
            console.log("✅ Gráfico de barras criado com sucesso!");
    
        } catch (error) {
            console.error("❌ Erro ao carregar dados para o gráfico de barras:", error);
        }
    }
    
    // Chamada para carregar os gráficos
    await carregarDadosGraficos();
    await carregarDadosDoughnut();
    await carregarDadosBarras();
});
