document.addEventListener("DOMContentLoaded", async () => {
    let myChart = null; // Instância do gráfico de linhas
    let myDoughnutChart = null; // Instância do gráfico de rosca

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
    
            // Buscar os dados da API
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
            const dados = await response.json();
    
            console.log("✅ Dados carregados para o gráfico de rosca:", dados);
    
            // Verifique a estrutura dos dados recebidos no console
            console.log("📌 Estrutura dos dados recebidos:", JSON.stringify(dados, null, 2));
    
            if (!dados.tipoEstudo || !Array.isArray(dados.tipoEstudo) || dados.tipoEstudo.length === 0) {
                console.warn("⚠️ Nenhum dado válido recebido para o gráfico de rosca.");
                return;
            }
    
            // Processamento dos dados
            const categorias = dados.tipoEstudo.map(item => item.tipo || "Desconhecido");
            const horasPorTipo = dados.tipoEstudo.map(item => parseFloat(item.horas_estudadas) || 0);
    
            console.log("📊 Processando os dados do gráfico de rosca...");
            console.log("📌 Categorias (labels):", categorias);
            console.log("📌 Valores (data):", horasPorTipo);
    
            // Criar o gráfico de rosca
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
                        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
                        hoverBackgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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
                            }
                        },
                        legend: {
                            labels: { font: { size: 14 }, color: "#FFF" }
                        }
                    }
                }
            });
    
            console.log("✅ Gráfico de rosca criado com sucesso!");
    
        } catch (error) {
            console.error("❌ Erro ao carregar dados para o gráfico de rosca:", error);
        }
    }
    
    
    // ✅ Chamada para carregar os gráficos
    await carregarDadosGraficos();
    await carregarDadosDoughnut();

});

