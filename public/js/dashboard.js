document.addEventListener("DOMContentLoaded", async () => {
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

            // ✅ Verifica se o elemento <canvas> do gráfico de linha existe
            const lineCanvas = document.getElementById("lineChart");
            if (!lineCanvas) {
                console.error("❌ O elemento #lineChart não foi encontrado no DOM.");
                return;
            }

            // ✅ Processamento dos dados
            const converterNumero = (valor) => (valor ? parseFloat(valor) : 0);

            const questoesData = dados.questoes.map(item => ({
                data: new Date(item.data_estudo).toLocaleDateString(),
                certas: converterNumero(item.total_certas),
                erradas: converterNumero(item.total_erradas)
            }));

            const datasQuestao = questoesData.map(item => item.data);
            const qtdCertas = questoesData.map(item => item.certas);
            const qtdErradas = questoesData.map(item => item.erradas);

            // ✅ Criando o gráfico de linha com estilos otimizados
            const ctxLine = lineCanvas.getContext("2d");
            new Chart(ctxLine, {
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
                    plugins: {
                        title: {
                            display: true,
                            text: "Total de Questões por Dia",
                            font: { size: 18 }
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false,
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#fff",
                            bodyColor: "#fff"
                        },
                        legend: {
                            labels: { font: { size: 14 } }
                        }
                    },
                    interaction: {
                        mode: "index",
                        intersect: false
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Data" },
                            ticks: { color: "#000" }
                        },
                        y: {
                            title: { display: true, text: "Quantidade" },
                            beginAtZero: true,
                            ticks: { color: "#000" }
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

    // ✅ Inicializa os gráficos ao carregar a página
    carregarDadosGraficos();

    // ✅ Lógica para abrir/fechar o menu lateral
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector(".toggle-btn");

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
    });

    // ✅ Fechar menu ao clicar fora dele
    document.addEventListener("click", (event) => {
        if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
            sidebar.classList.remove("expanded");
        }
    });

    // ✅ Lógica para abrir/fechar o formulário
    const formPopup = document.getElementById("formPopup");
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");

    openFormButton.addEventListener("click", () => {
        formPopup.style.display = "flex";
    });

    closeFormButton.addEventListener("click", () => {
        formPopup.style.display = "none";
    });

    // ✅ Fechar formulário ao clicar fora dele
    window.addEventListener("click", (event) => {
        if (event.target === formPopup) {
            formPopup.style.display = "none";
        }
    });
});
