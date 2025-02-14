document.addEventListener("DOMContentLoaded", async () => {
    let myChart = null; // Guarda a instância do gráfico de linhas
    let myDoughnutChart = null; // Guarda a instância do gráfico de rosca

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

            // Se existir um gráfico anterior, destrói-o antes de criar um novo
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
                    maintainAspectRatio: false, // <-- Essa linha permite que o canvas respeite as dimensões definidas no CSS
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
            
            let myDoughnutChart = null; // Guarda a instância do gráfico de rosca

async function carregarDadosDoughnut() {
    try {
        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
            console.error("❌ Usuário não autenticado.");
            return;
        }
        
        // Supondo que exista uma rota que retorne os estudos do usuário
        const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos?usuario_id=${usuarioId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
        const dados = await response.json();
        console.log("✅ Dados para gráfico de rosca carregados:", dados);

        // Inicializa os totais para cada tipo de estudo
        const totalHoras = {
            pratica: 0,
            teoria: 0,
            revisao: 0
        };

        // Processa cada registro para somar as horas por tipo
        dados.forEach(item => {
            const tipo = item.tipo_estudo.toLowerCase(); // padroniza para minúsculo
            // Converte o valor de horas_estudadas (formato "HH:MM") para horas decimais
            if(item.horas_estudadas){
                const partes = item.horas_estudadas.split(":");
                const horas = parseFloat(partes[0]) + parseFloat(partes[1]) / 60;
                if(totalHoras.hasOwnProperty(tipo)) {
                    totalHoras[tipo] += horas;
                }
            }
        });

        const somaTotal = totalHoras.pratica + totalHoras.teoria + totalHoras.revisao;
        // Calcula a porcentagem para cada tipo (caso somaTotal seja maior que zero)
        const porcentagens = somaTotal > 0 ? [
            (totalHoras.pratica / somaTotal * 100).toFixed(2),
            (totalHoras.teoria / somaTotal * 100).toFixed(2),
            (totalHoras.revisao / somaTotal * 100).toFixed(2)
        ] : [0, 0, 0];

        // Seleciona o canvas do gráfico de rosca
        const doughnutCanvas = document.getElementById("doughnutChart");
        if (!doughnutCanvas) {
            console.error("❌ O elemento #doughnutChart não foi encontrado no DOM.");
            return;
        }
        const ctxDoughnut = doughnutCanvas.getContext("2d");

        // Se existir um gráfico anterior, destrua-o antes de criar um novo
        if (myDoughnutChart) {
            myDoughnutChart.destroy();
        }

        // Cria o gráfico de rosca utilizando Chart.js
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
                maintainAspectRatio: false, // Essencial para respeitar seu CSS
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


            // Atualiza o total de dias estudados (se o elemento existir)
            const totalDiasElement = document.getElementById("totalDias");
            if(totalDiasElement) {
                totalDiasElement.textContent = dados.totalDias;
            }
        } catch (error) {
            console.error("❌ Erro ao carregar dados para os gráficos:", error);
        }
    }

    carregarDadosGraficos();

    // Lógica para o menu lateral
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector("#toggleSidebar");
    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
    });

    // Lógica para exibir/fechar o formulário
    const formPopup = document.getElementById("formPopup");
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");

    openFormButton.addEventListener("click", () => {
        formPopup.style.display = "flex";
        carregarDisciplinas();
    });

    closeFormButton.addEventListener("click", () => {
        formPopup.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === formPopup) {
            formPopup.style.display = "none";
        }
    });

    async function carregarDisciplinas() {
        try {
            const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/disciplinas");
            if (!response.ok) throw new Error("Erro ao buscar disciplinas");
            const disciplinas = await response.json();
            const selectDisciplina = document.getElementById("disciplina");
            selectDisciplina.innerHTML = `<option value="">Selecione a disciplina</option>`;
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

    async function carregarAssuntos(disciplinaNome) {
        try {
            if (!disciplinaNome) return;
            console.log(`📡 Buscando assuntos para a disciplina: ${disciplinaNome}`);
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/disciplinas/assuntos?disciplina=${encodeURIComponent(disciplinaNome)}`);
            if (!response.ok) throw new Error("Erro ao buscar assuntos");
            const assuntos = await response.json();
            const selectAssunto = document.getElementById("assunto");
            selectAssunto.innerHTML = `<option value="">Selecione o assunto</option>`;
            assuntos.forEach(assunto => {
                const option = document.createElement("option");
                // Note que o backend retornou { nome: "valor" } para os assuntos
                option.value = assunto.nome;
                option.textContent = assunto.nome;
                selectAssunto.appendChild(option);
            });
            console.log("✅ Assuntos carregados:", assuntos);
        } catch (error) {
            console.error("❌ Erro ao carregar assuntos:", error);
        }
    }

    document.getElementById("disciplina").addEventListener("change", (event) => {
        carregarAssuntos(event.target.value);
    });

    // Envio do formulário com logs detalhados
    document.getElementById("studyForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Formulário enviado!");

        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
            console.error("❌ Usuário não autenticado.");
            return;
        }

        // Obter o valor original do input de horas (formato "HH:MM")
        const horasEstudadas = document.getElementById("horas").value;
        console.log("Horas estudadas:", horasEstudadas);

        const formData = {
            usuario_id: usuarioId,
            disciplina: document.getElementById("disciplina").value,
            assunto: document.getElementById("assunto").value,
            horas_estudadas: horasEstudadas,
            data_estudo: new Date().toISOString().split("T")[0],
            questoes_erradas: document.getElementById("questoes_erradas").value || 0,
            questoes_certas: document.getElementById("questoes_certas").value || 0,
            tipo_estudo: document.getElementById("tipo_estudo").value
        };

        console.log("Dados do formulário:", formData);

        try {
            const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/estudos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            // Log de verificação do status da resposta
            console.log("Status da resposta:", response.status);
            const result = await response.json();
            console.log("Resposta do servidor:", result);

            if (!response.ok) throw new Error(result.error || "Erro ao enviar os dados!");

            console.log("✅ Dados enviados com sucesso");
            document.getElementById("studyForm").reset();
            formPopup.style.display = "none";
            carregarDadosGraficos();
        } catch (error) {
            console.error("❌ Erro ao enviar os dados:", error);
        }
    });
});


document.addEventListener