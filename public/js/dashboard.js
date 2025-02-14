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

            // ✅ Verifica se os elementos <canvas> existem antes de criar os gráficos
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

            // ✅ Criando o gráfico de linha
            setTimeout(() => {
                const ctxLine = lineCanvas.getContext("2d");
                new Chart(ctxLine, {
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
                    }
                });
            }, 500); // ✅ Delay de 500ms para garantir que o DOM carregue

        } catch (error) {
            console.error("❌ Erro ao carregar dados para os gráficos:", error);
        }
    }

    // ✅ Inicializa os gráficos ao carregar a página
    carregarDadosGraficos();
});
