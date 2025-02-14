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

            // 🔍 Verificar se o elemento do gráfico existe
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

    // ✅ Inicializa os gráficos ao carregar a página
    carregarDadosGraficos();

    // ✅ Lógica para abrir/fechar o menu lateral
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector("#toggleSidebar");

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
    });

    // ✅ Lógica para abrir/fechar o formulário
    const formPopup = document.getElementById("formPopup");
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");

    openFormButton.addEventListener("click", () => {
        formPopup.style.display = "flex";
        carregarDisciplinas(); // ✅ Garante que as disciplinas são carregadas ao abrir o formulário
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

    // ✅ Função para carregar disciplinas
    async function carregarDisciplinas() {
        try {
            const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/disciplinas");
            if (!response.ok) throw new Error("Erro ao buscar disciplinas");
            const disciplinas = await response.json();

            const selectDisciplina = document.getElementById("disciplina");
            selectDisciplina.innerHTML = `<option value="">Selecione a disciplina</option>`; // Resetando antes de adicionar

            disciplinas.forEach(disciplina => {
                const option = document.createElement("option");
                option.value = disciplina.disciplina;
                option.textContent = disciplina.disciplina;
                selectDisciplina.appendChild(option);
            });

            console.log("✅ Disciplinas carregadas:", disciplinas);

        } catch (error) {
            console.error("❌ Erro ao carregar disciplinas:", error);
        }
    }

    // ✅ Função para carregar assuntos com base na disciplina selecionada
    async function carregarAssuntos(disciplinaNome) {
        try {
            if (!disciplinaNome) {
                console.warn("⚠ Nenhuma disciplina selecionada.");
                return;
            }

            console.log(`📡 Buscando assuntos para a disciplina: ${disciplinaNome}`);

            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/disciplinas/assuntos?disciplina=${encodeURIComponent(disciplinaNome)}`);
            if (!response.ok) throw new Error("Erro ao buscar assuntos");
            const assuntos = await response.json();

            const selectAssunto = document.getElementById("assunto");
            selectAssunto.innerHTML = `<option value="">Selecione o assunto</option>`; // Resetando antes de adicionar

            if (assuntos.length === 0) {
                console.warn(`⚠ Nenhum assunto encontrado para a disciplina: ${disciplinaNome}`);
            } else {
                assuntos.forEach(assunto => {
                    const option = document.createElement("option");
                    option.value = assunto.assunto;
                    option.textContent = assunto.assunto;
                    selectAssunto.appendChild(option);
                });

                console.log("✅ Assuntos carregados:", assuntos);
            }

        } catch (error) {
            console.error("❌ Erro ao carregar assuntos:", error);
        }
    }

    // ✅ Evento para carregar os assuntos quando a disciplina for selecionada
    document.getElementById("disciplina").addEventListener("change", (event) => {
        const disciplinaNome = event.target.value;
        if (disciplinaNome) {
            carregarAssuntos(disciplinaNome);
        } else {
            console.warn("⚠ Nenhuma disciplina foi selecionada.");
        }
    });

});
