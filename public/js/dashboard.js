document.addEventListener("DOMContentLoaded", async () => {
    async function carregarDadosGraficos() {
        try {
            const usuarioId = localStorage.getItem("usuario_id");

                // 🔎 Log para depuração
                console.log("🔍 Usuário ID recuperado:", usuarioId);

                if (!usuarioId || isNaN(parseInt(usuarioId))) {
                    console.error("❌ Usuário não autenticado ou ID inválido.");
                    return;
                }

            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
            const dados = await response.json();
            console.log("✅ Dados carregados:", dados);

            // Função auxiliar para converter strings numéricas em números
            const converterNumero = (valor) => (valor ? parseFloat(valor) : 0);

            // 🔹 Gráfico 1: Questões por dia
            const questoesData = dados.questoes.map(item => ({
                data: new Date(item.data_estudo).toLocaleDateString(),
                certas: converterNumero(item.total_certas),
                erradas: converterNumero(item.total_erradas)
            }));

            const datasQuestao = questoesData.map(item => item.data);
            const qtdCertas = questoesData.map(item => item.certas);
            const qtdErradas = questoesData.map(item => item.erradas);

            // ✅ Atualiza o total de dias estudados
            document.getElementById("totalDias").textContent = dados.totalDias;

            console.log("🔎 Verificando elementos canvas...");
            console.log("lineChart:", document.getElementById("lineChart"));

            // 🔹 Criando apenas o gráfico de linha
            const ctxLine = document.getElementById("lineChart").getContext("2d");
            window.lineChart = new Chart(ctxLine, {
                type: "line",
                data: {
                    labels: datasQuestao,
                    datasets: [
                        {
                            label: "Questões Certas",
                            data: qtdCertas,
                            borderColor: "blue",
                            backgroundColor: "rgba(0, 0, 255, 0.1)",
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: "Questões Erradas",
                            data: qtdErradas,
                            borderColor: "red",
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                            tension: 0.4,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Total de Questões por Dia"
                        },
                        tooltip: {
                            mode: "index",
                            intersect: false
                        }
                    },
                    interaction: {
                        mode: "index",
                        intersect: false
                    },
                    scales: {
                        x: {
                            title: { display: true, text: "Data" }
                        },
                        y: {
                            title: { display: true, text: "Quantidade" },
                            beginAtZero: true
                        }
                    }
                }
            });

        } catch (error) {
            console.error("❌ Erro ao carregar dados para os gráficos:", error);
        }
    }

    // ✅ Inicializa os gráficos ao carregar a página
    carregarDadosGraficos();

    // ✅ Lógica para o menu lateral
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector(".toggle-btn");
    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
    });

    // ✅ Lógica para abrir e fechar o formulário
    const formPopup = document.getElementById("formPopup");
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");

    openFormButton.addEventListener("click", () => {
        formPopup.classList.add("active");
    });

    closeFormButton.addEventListener("click", () => {
        formPopup.classList.remove("active");
    });

    window.addEventListener("click", (event) => {
        if (event.target === formPopup) {
            formPopup.classList.remove("active");
        }
    });
});
