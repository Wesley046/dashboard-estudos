document.addEventListener("DOMContentLoaded", async () => {
    // Função para converter objeto de horas (ex: { hours: 2, minutes: 30 }) em número decimal
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
        
        // Gráfico 1: Questões por dia  
        // Aqui armazenamos tanto o objeto Date quanto a string formatada para ordenação correta.
        const questoesData = dados.questoes.map(item => {
          const d = new Date(item.data_estudo);
          return {
            date: d,
            data: d.toLocaleDateString(),
            certas: item.total_certas ? Number(item.total_certas) : 0,
            erradas: item.total_erradas ? Number(item.total_erradas) : 0
          };
        });
        questoesData.sort((a, b) => a.date - b.date);
        const datasQuestao = questoesData.map(item => item.data);
        const qtdCertas = questoesData.map(item => item.certas);
        const qtdErradas = questoesData.map(item => item.erradas);
    
        // Gráfico 2: Tipo de Estudo – soma das horas por tipo  
        const tipoEstudoData = dados.tipoEstudo.map(item => ({
          tipo: item.tipo_estudo || "Não informado",
          total: converterHoras(item.total_horas)
        }));
        const tipos = tipoEstudoData.map(item => item.tipo);
        const totalHorasPorTipo = tipoEstudoData.map(item => item.total);
    
        // Gráfico 3: Horas estudadas por dia  
        const horasData = dados.horasData.map(item => {
          const d = new Date(item.data_estudo);
          return {
            date: d,
            data: d.toLocaleDateString(),
            total: converterHoras(item.total_horas)
          };
        });
        horasData.sort((a, b) => a.date - b.date);
        const datasHoras = horasData.map(item => item.data);
        const totalHoras = horasData.map(item => item.total);
    
        // Gráfico 4: Horas por Disciplina  
        const disciplinaData = dados.disciplina.map(item => ({
          disciplina: item.disciplina,
          total: converterHoras(item.total_horas)
        }));
        // Ordena do maior para o menor
        disciplinaData.sort((a, b) => b.total - a.total);
        const disciplinasLabels = disciplinaData.map(item => item.disciplina);
        const totalHorasDisciplinas = disciplinaData.map(item => item.total);
        const somaTotalHorasDisciplinas = totalHorasDisciplinas.reduce((acc, cur) => acc + cur, 0);
        const percentuaisDisciplinas = totalHorasDisciplinas.map(horas => ((horas / somaTotalHorasDisciplinas) * 100).toFixed(2));
    
        // Atualiza o total de dias estudados
        const totalDiasElement = document.getElementById("totalDias");
        if (totalDiasElement) {
          totalDiasElement.textContent = dados.totalDias;
        }
    
        // Destrói gráficos antigos, se existirem
        if (window.lineChart) window.lineChart.destroy();
        if (window.doughnutChart) window.doughnutChart.destroy();
        if (window.barChart) window.barChart.destroy();
        if (window.horizontalBarChart) window.horizontalBarChart.destroy();
    
        // Gráfico 1: Linha – Questões por Dia
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
    
        // Gráfico 2: Rosca – Horas por Tipo de Estudo
        const ctxDoughnut = document.getElementById("doughnutChart").getContext("2d");
        window.doughnutChart = new Chart(ctxDoughnut, {
          type: "doughnut",
          data: {
            labels: tipos,
            datasets: [{
              data: totalHorasPorTipo,
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
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
    
        // Gráfico 3: Barras – Horas Estudadas por Dia
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
    
        // Gráfico 4: Barras Horizontal – Percentual de Horas por Disciplina
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
    
    // Lógica para o menu lateral
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector(".toggle-btn");
    toggleButton.addEventListener("click", () => {
      sidebar.classList.toggle("expanded");
    });
  });
  