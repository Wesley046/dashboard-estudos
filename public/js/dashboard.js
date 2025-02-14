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
            const converterNumero = (valor) => (valor ? parseFloat(valor) : 0);
            const questoesData = dados.questoes.map(item => ({
                data: new Date(item.data_estudo).toLocaleDateString(),
                certas: converterNumero(item.total_certas),
                erradas: converterNumero(item.total_erradas)
            }));

            const datasQuestao = questoesData.map(item => item.data);
            const qtdCertas = questoesData.map(item => item.certas);
            const qtdErradas = questoesData.map(item => item.erradas);
            const ctxLine = lineCanvas.getContext("2d");

            //grafico testes

            document.addEventListener("DOMContentLoaded", function () {
                console.log("✅ DOM carregado. Criando gráfico de rosca...");
            
                const ctxDoughnut = document.getElementById("doughnutChart")?.getContext("2d");
            
                if (!ctxDoughnut) {
                    console.error("❌ O elemento #doughnutChart NÃO foi encontrado no DOM.");
                    return;
                }
            
                console.log("✅ O canvas foi encontrado. Criando gráfico...");
            
                new Chart(ctxDoughnut, {
                    type: "doughnut",
                    data: {
                        labels: ["Prática", "Teoria", "Revisão"],
                        datasets: [{
                            data: [40, 30, 30], // Teste com valores fixos
                            backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: "Teste de Gráfico de Rosca dentro do dashboard.js",
                                font: { size: 18 },
                                color: "#FFF"
                            }
                        }
                    }
                });
            });
            

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
                    maintainAspectRatio: false, // Permite que o CSS controle o tamanho
                    plugins: {
                        title: {
                            display: true,
                            text: "Total de Questões por Dia",
                            font: { size: 18 },
                            color: "#FFF"
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false,
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#fff",
                            bodyColor: "#fff"
                        },
                        legend: {
                            labels: { font: { size: 14 }, color: "#FFF" }
                        }
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Data", color: "#FFF" },
                            ticks: { color: "#FFF" }
                        },
                        y: {
                            title: { display: true, text: "Quantidade", color: "#FFF" },
                            beginAtZero: true,
                            ticks: { color: "#FFF" }
                        }
                    },
                    animation: {
                        duration: 1500,
                        easing: "easeInOutQuart"
                    }
                }
            });

        } catch (error) {
            console.error("❌ Erro ao carregar dados para os gráficos:", error);
        }
    }

    async function carregarDadosDoughnut() {
        try {
            const usuarioId = localStorage.getItem("usuario_id");
            if (!usuarioId) {
                console.error("❌ Usuário não autenticado.");
                return;
            }

            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos?usuario_id=${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
            const dados = await response.json();
            console.log("✅ Dados para gráfico de rosca carregados:", dados);

            const totalHoras = {
                pratica: 0,
                teoria: 0,
                revisao: 0
            };

            // Processamento dos dados
            dados.forEach(item => {
                const tipo = item.tipo_estudo.toLowerCase();
                if (item.horas_estudadas) {
                    const partes = item.horas_estudadas.split(":");
                    const horas = parseFloat(partes[0]) + parseFloat(partes[1]) / 60;
                    if (totalHoras.hasOwnProperty(tipo)) {
                        totalHoras[tipo] += horas;
                    }
                }
            });

            const somaTotal = totalHoras.pratica + totalHoras.teoria + totalHoras.revisao;
            const porcentagens = somaTotal > 0 ? [
                (totalHoras.pratica / somaTotal * 100).toFixed(2),
                (totalHoras.teoria / somaTotal * 100).toFixed(2),
                (totalHoras.revisao / somaTotal * 100).toFixed(2)
            ] : [0, 0, 0];

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
                    labels: ["Prática", "Teoria", "Revisão"],
                    datasets: [{
                        data: porcentagens,
                        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
                        hoverBackgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Mantém o formato quadrado no CSS
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
                                    return context.label + ": " + context.parsed + "%";
                                }
                            },
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#fff",
                            bodyColor: "#fff"
                        },
                        legend: {
                            labels: { font: { size: 14 }, color: "#FFF" }
                        }
                    }
                }
            });

        } catch (error) {
            console.error("❌ Erro ao carregar dados para o gráfico de rosca:", error);
        }
    }

    // Chamada para carregar os gráficos
    await carregarDadosGraficos();
    await carregarDadosDoughnut(); // Agora o gráfico de rosca será carregado corretamente

});
