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
// Função para converter o objeto de horas em número (horas + minutos/60)
function converterHoras(obj) {
    if (!obj) return 0;
    const horas = obj.hours ? Number(obj.hours) : 0;
    const minutos = obj.minutes ? Number(obj.minutes) : 0;
    return horas + (minutos / 60);
  }
  
  async function carregarDadosGraficos() {
      try {
          const usuarioId = localStorage.getItem("usuario_id");
          const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
          if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
          const dados = await response.json();
          console.log("Dados para gráficos:", dados);
  
          // Processamento dos dados:
  
          // Graph 1: Questões por dia
          const questoesData = dados.questoes.map(item => {
              return {
                  data: new Date(item.data_estudo).toLocaleDateString(),
                  certas: item.total_certas ? Number(item.total_certas) : 0,
                  erradas: item.total_erradas ? Number(item.total_erradas) : 0
              }
          });
          // Ordena as datas
          questoesData.sort((a, b) => new Date(a.data) - new Date(b.data));
          const datasQuestao = questoesData.map(item => item.data);
          const qtdCertas = questoesData.map(item => item.certas);
          const qtdErradas = questoesData.map(item => item.erradas);
  
          // Graph 2: Tipo de Estudo (horas)
          const tipoEstudoData = dados.tipoEstudo.map(item => {
              return {
                  tipo: item.tipo_estudo || "Não informado",
                  total: converterHoras(item.total_horas)
              }
          });
          const tipos = tipoEstudoData.map(item => item.tipo);
          const totalHorasPorTipo = tipoEstudoData.map(item => item.total);
  
          // Graph 3: Horas estudadas por dia
          const horasData = dados.horasData.map(item => {
              return {
                  data: new Date(item.data_estudo).toLocaleDateString(),
                  total: converterHoras(item.total_horas)
              }
          });
          horasData.sort((a, b) => new Date(a.data) - new Date(b.data));
          const datasHoras = horasData.map(item => item.data);
          const totalHoras = horasData.map(item => item.total);
  
          // Graph 4: Horas por Disciplina
          const disciplinaData = dados.disciplina.map(item => {
              return {
                  disciplina: item.disciplina,
                  total: converterHoras(item.total_horas)
              }
          });
          // Ordena do maior para o menor
          disciplinaData.sort((a, b) => b.total - a.total);
          const disciplinasLabels = disciplinaData.map(item => item.disciplina);
          const totalHorasDisciplinas = disciplinaData.map(item => item.total);
          const somaTotalHorasDisciplinas = totalHorasDisciplinas.reduce((a, b) => a + b, 0);
          const percentuaisDisciplinas = totalHorasDisciplinas.map(horas => ((horas / somaTotalHorasDisciplinas) * 100).toFixed(2));
  
          // Atualiza o total de dias estudados (se houver elemento)
          const totalDiasElement = document.getElementById("totalDias");
          if(totalDiasElement) {
              totalDiasElement.textContent = dados.totalDias;
          }
  
          // Renderiza os gráficos
          if(window.lineChart) window.lineChart.destroy();
          if(window.doughnutChart) window.doughnutChart.destroy();
          if(window.barChart) window.barChart.destroy();
          if(window.horizontalBarChart) window.horizontalBarChart.destroy();
  
          // Gráfico 1: Linha - Questões por dia
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
  
          // Gráfico 2: Rosca - Horas por Tipo de Estudo
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
  
          // Gráfico 3: Barras - Horas estudadas por dia
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
  
          // Gráfico 4: Barras Horizontal - Percentual de Horas por Disciplina
          const ctxHorizontal = document.getElementById("horizontalBarChart").getContext("2d");
          window.horizontalBarChart = new Chart(ctxHorizontal, {
              type: "bar",
              data: {
                  labels: disciplinasLabels,
                  datasets: [{
                      label: "Percentual de Horas por Disciplina (%)",
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
                          text: "Percentual de Horas por Disciplina"
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
