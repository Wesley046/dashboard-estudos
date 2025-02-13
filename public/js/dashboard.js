document.addEventListener("DOMContentLoaded", async () => {
    const disciplinaSelect = document.getElementById("disciplina");
    const assuntoSelect = document.getElementById("assunto");
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");
    const formPopup = document.getElementById("formPopup");
    const studyForm = document.getElementById("studyForm");

    // Abrir formulário
    openFormButton.addEventListener("click", () => {
        formPopup.style.display = "block";
        carregarDisciplinas(); // Recarrega as disciplinas sempre que abrir o formulário
    });

    // Fechar formulário
    closeFormButton.addEventListener("click", () => {
        formPopup.style.display = "none";
    });

    // Buscar disciplinas do backend
    async function carregarDisciplinas() {
        try {
            const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/disciplinas");
            if (!response.ok) throw new Error("Erro ao buscar disciplinas");

            const disciplinas = await response.json();
            disciplinaSelect.innerHTML = '<option value="">Selecione a disciplina</option>';
            
            disciplinas.forEach(item => {
                const option = document.createElement("option");
                option.value = item.disciplina;
                option.textContent = item.disciplina;
                disciplinaSelect.appendChild(option);
            });

            console.log("✅ Disciplinas carregadas:", disciplinas);
        } catch (error) {
            console.error("❌ Erro ao carregar disciplinas:", error);
        }
    }

    // Buscar assuntos com base na disciplina selecionada
    disciplinaSelect.addEventListener("change", async () => {
        const disciplina = disciplinaSelect.value;
        if (!disciplina) return;

        try {
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/disciplinas/assuntos/${encodeURIComponent(disciplina)}`);
            if (!response.ok) throw new Error("Erro ao buscar assuntos");

            const assuntos = await response.json();
            assuntoSelect.innerHTML = '<option value="">Selecione o assunto</option>';
            
            assuntos.forEach(item => {
                const option = document.createElement("option");
                option.value = item.assunto;
                option.textContent = item.assunto;
                assuntoSelect.appendChild(option);
            });

            console.log(`✅ Assuntos carregados para ${disciplina}:`, assuntos);
        } catch (error) {
            console.error("❌ Erro ao carregar assuntos:", error);
        }
    });

    // Envio do formulário para o backend
    studyForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const usuarioId = localStorage.getItem("usuario_id");
        const disciplina = disciplinaSelect.value.trim();
        const assunto = assuntoSelect.value.trim();
        const horasEstudadas = document.getElementById("horas").value;
        
        if (!horasEstudadas) {
            alert("❌ O campo Horas Estudadas é obrigatório!");
            return;
        }

        let dataEstudo = document.getElementById("data_estudo").value;
        if (!dataEstudo) {
            dataEstudo = new Date().toISOString().split("T")[0]; // Data atual no formato YYYY-MM-DD
            document.getElementById("data_estudo").value = dataEstudo;
        }

        const questoesErradas = document.getElementById("questoes_erradas").value.trim();
        const questoesCertas = document.getElementById("questoes_certas").value.trim();
        const tipoEstudo = document.getElementById("tipo_estudo").value;

        console.log("📋 Valores antes da validação:", {
            usuario_id: usuarioId,
            disciplina,
            assunto,
            horasEstudadas,
            dataEstudo,
            questoesErradas,
            questoesCertas,
            tipoEstudo
        });

        if (!usuarioId || !disciplina || !assunto || !horasEstudadas || !dataEstudo || !questoesErradas || !questoesCertas || !tipoEstudo) {
            console.error("❌ ERRO: Algum campo está vazio!");
            alert("❌ Todos os campos são obrigatórios!");
            return;
        }

        const formData = {
            usuario_id: usuarioId,
            disciplina,
            assunto,
            horas_estudadas: horasEstudadas,
            data_estudo: dataEstudo,
            questoes_erradas: questoesErradas,
            questoes_certas: questoesCertas,
            tipo_estudo: tipoEstudo,
        };

        console.log("📤 Enviando dados:", formData);

        try {
            const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/estudos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Estudo registrado com sucesso!");
                studyForm.reset();
                // Após registrar, recarrega os dados dos gráficos
                carregarDadosGraficos();
            } else {
                alert("❌ Erro ao registrar estudo: " + result.error);
            }
        } catch (error) {
            console.error("❌ Erro ao enviar os dados:", error);
            alert("Erro ao conectar com o servidor.");
        }
    });

   // dashboard.js
// Função para carregar dados dos estudos e renderizar os gráficos
async function carregarDadosGraficos() {
    try {
        const usuarioId = localStorage.getItem("usuario_id");
        // Chama o endpoint correto para gráficos
        const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
        
        const dados = await response.json();
        console.log("Dados recebidos para gráficos:", dados);

        // Extraindo os dados retornados
        const questoesData = dados.questoes;      // [{ data_estudo, total_erradas, total_certas }, ...]
        const tipoEstudoData = dados.tipoEstudo;     // [{ tipo_estudo, total_horas }, ...]
        const disciplinaData = dados.disciplina;     // [{ disciplina, total_horas }, ...]
        const horasData = dados.horasData;           // [{ data_estudo, total_horas }, ...]
        const totalDias = dados.totalDias;

        // Graph 1: Linha (Questões certas e erradas por dia)
        // Ordena as datas
        const datasQuestao = questoesData.map(item => item.data_estudo).sort();
        const qtdCertas = datasQuestao.map(data => {
            const found = questoesData.find(item => item.data_estudo === data);
            return found ? Number(found.total_certas) : 0;
        });
        const qtdErradas = datasQuestao.map(data => {
            const found = questoesData.find(item => item.data_estudo === data);
            return found ? Number(found.total_erradas) : 0;
        });

        // Graph 2: Rosca (Tipo de estudo)
        const tipos = tipoEstudoData.map(item => item.tipo_estudo);
        const totalHorasPorTipo = tipoEstudoData.map(item => Number(item.total_horas));

        // Graph 3: Barras (Horas estudadas por dia)
        const datasHoras = horasData.map(item => item.data_estudo).sort();
        const totalHoras = datasHoras.map(data => {
            const found = horasData.find(item => item.data_estudo === data);
            return found ? Number(found.total_horas) : 0;
        });

        // Graph 4: Barras Horizontal (Percentual de matérias estudadas)
        // Ordena os dados por total de horas em ordem decrescente
        const sortedDisciplinas = disciplinaData.sort((a, b) => Number(b.total_horas) - Number(a.total_horas));
        const disciplinasLabels = sortedDisciplinas.map(item => item.disciplina);
        const totalHorasDisciplinas = sortedDisciplinas.map(item => Number(item.total_horas));
        const somaTotalHorasDisciplinas = totalHorasDisciplinas.reduce((a, b) => a + b, 0);
        const percentuaisDisciplinas = totalHorasDisciplinas.map(horas => ((horas / somaTotalHorasDisciplinas) * 100).toFixed(2));

        // Renderizando os gráficos (usando Chart.js)
        if(window.lineChart) window.lineChart.destroy();
        if(window.doughnutChart) window.doughnutChart.destroy();
        if(window.barChart) window.barChart.destroy();
        if(window.horizontalBarChart) window.horizontalBarChart.destroy();

        // Gráfico 1: Linha (Questões certas e erradas por dia)
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
                        fill: false,
                    },
                    {
                        label: "Questões Erradas",
                        data: qtdErradas,
                        borderColor: "red",
                        backgroundColor: "rgba(255, 0, 0, 0.1)",
                        tension: 0.4,
                        fill: false,
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

        // Gráfico 2: Rosca (Tipo de estudo)
        const ctxDoughnut = document.getElementById("doughnutChart").getContext("2d");
        window.doughnutChart = new Chart(ctxDoughnut, {
            type: "doughnut",
            data: {
                labels: tipos,
                datasets: [{
                    data: totalHorasPorTipo,
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Horas por Tipo de Estudo"
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || "";
                                const value = context.parsed;
                                const total = totalHorasPorTipo.reduce((sum, cur) => sum + cur, 0);
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${label}: ${percentage}%`;
                            }
                        }
                    }
                }
            }
        });

        // Gráfico 3: Barras (Horas estudadas por dia)
        const ctxBar = document.getElementById("barChart").getContext("2d");
        window.barChart = new Chart(ctxBar, {
            type: "bar",
            data: {
                labels: datasHoras,
                datasets: [{
                    label: "Horas Estudadas",
                    data: totalHoras,
                    backgroundColor: "rgba(75, 192, 192, 0.5)"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Total de Horas Estudadas por Dia"
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: "Data" }
                    },
                    y: {
                        title: { display: true, text: "Horas" },
                        beginAtZero: true
                    }
                }
            }
        });

        // Gráfico 4: Barras Horizontal (Percentual de matérias estudadas)
        const ctxHorizontal = document.getElementById("horizontalBarChart").getContext("2d");
        window.horizontalBarChart = new Chart(ctxHorizontal, {
            type: "bar",
            data: {
                labels: disciplinasLabels,
                datasets: [{
                    label: "Percentual de Horas por Matéria (%)",
                    data: percentuaisDisciplinas,
                    backgroundColor: "rgba(153, 102, 255, 0.5)"
                }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Percentual de Matérias Estudadas (por Horas)"
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: "Percentual (%)" },
                        beginAtZero: true,
                        max: 100
                    },
                    y: {
                        title: { display: true, text: "Disciplina" }
                    }
                }
            }
        });

        // Atualiza o total de dias estudados (se houver um elemento para isso)
        const totalDiasElement = document.getElementById("totalDias");
        if(totalDiasElement) {
            totalDiasElement.textContent = totalDias;
        }

    } catch (error) {
        console.error("❌ Erro ao carregar dados para os gráficos:", error);
    }
}
    // Inicializa os gráficos ao carregar a página
    carregarDadosGraficos();
});

// Lógica para o menu lateral
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector(".toggle-btn");

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
    });
});
