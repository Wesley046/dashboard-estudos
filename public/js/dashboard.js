document.addEventListener("DOMContentLoaded", async () => {
  // 1. Configuração inicial
  const usuarioId = localStorage.getItem("usuario_id");
  if (usuarioId) {
    const usuarioIdElement = document.getElementById("usuario_id");
    if (usuarioIdElement) {
      usuarioIdElement.value = usuarioId;
    }
  }

  // Configura data padrão (amanhã)
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const formattedDate = today.toISOString().split("T")[0];
  const dataEstudoElement = document.getElementById("data_estudo");
  if (dataEstudoElement) {
    dataEstudoElement.value = formattedDate;
  }

  // Variáveis para gráficos
  let myChart = null;
  let myDoughnutChart = null;
  let myBarChart = null;
  let myPercentBarChart = null;

  console.log("dashboard.js carregado com sucesso!");

  // 2. Controle do Menu Lateral
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.querySelector("#toggleSidebar");

  if (toggleButton && sidebar) {
    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      sidebar.classList.toggle("expanded");
      
      // Fechar automaticamente em mobile após 3 segundos
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          if (sidebar.classList.contains("expanded")) {
            sidebar.classList.remove("expanded");
          }
        }, 3000);
      }
    });
    
    // Fechar menu ao clicar em um item (para mobile)
    sidebar.addEventListener("click", (e) => {
      if (window.innerWidth <= 768 && e.target.closest(".menu-item")) {
        setTimeout(() => sidebar.classList.remove("expanded"), 300);
      }
    });
  }

  // 3. Controle do Formulário Popup - VERSÃO CORRIGIDA
  const formPopup = document.getElementById("formPopup");
  const openFormButton = document.getElementById("openForm"); // Corrigido para usar ID
  const closeFormButton = document.getElementById("closeForm");
  const overlay = document.getElementById("overlay");

  // Garantir que o formulário comece fechado
  if (formPopup && overlay) {
    formPopup.style.display = "none";
    overlay.style.display = "none";
  }

  function openForm() {
    if (!formPopup || !overlay) return;
    
    overlay.style.display = "block";
    formPopup.style.display = "flex";
    document.body.classList.add("overlay-active");
    
    setTimeout(() => {
      overlay.style.opacity = "1";
      formPopup.style.opacity = "1";
    }, 10);
    
    // Carrega disciplinas ao abrir o formulário
    carregarDisciplinas();
  }

  function closeForm() {
    if (!formPopup || !overlay) return;
    
    overlay.style.opacity = "0";
    formPopup.style.opacity = "0";
    
    setTimeout(() => {
      overlay.style.display = "none";
      formPopup.style.display = "none";
      document.body.classList.remove("overlay-active");
    }, 300);
  }

  if (openFormButton) {
    openFormButton.addEventListener("click", function(e) {
      e.preventDefault();
      openForm();
    });
  }

  if (closeFormButton) {
    closeFormButton.addEventListener("click", closeForm);
  }

  if (overlay) {
    overlay.addEventListener("click", closeForm);
  }

  // 4. Controle do Ranking
  document.addEventListener("click", function(e) {
    const btnRanking = e.target.closest("#btnRanking");
    
    if (btnRanking) {
      e.preventDefault();
      console.log("Redirecionando para ranking...");
      
      // Fecha o menu se estiver aberto (mobile)
      if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove("expanded");
      }
      
      // Redirecionamento robusto
      try {
        window.location.href = "/ranking";
      } catch (error) {
        console.error("Erro no redirecionamento:", error);
        window.location.assign("/ranking");
      }
    }
  });

  // 5. Funções para carregar disciplinas e assuntos
  async function carregarDisciplinas() {
    try {
      const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/disciplinas");
      if (!response.ok) throw new Error("Erro ao buscar disciplinas");
      const disciplinas = await response.json();
      const selectDisciplina = document.getElementById("disciplina");
      
      if (selectDisciplina) {
        selectDisciplina.innerHTML = "<option value=''>Selecione a disciplina</option>";
        disciplinas.forEach(item => {
          const option = document.createElement("option");
          option.value = item.disciplina;
          option.textContent = item.disciplina;
          selectDisciplina.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    }
  }

  async function carregarAssuntos(disciplinaNome) {
    try {
      if (!disciplinaNome) return;
      const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/disciplinas/assuntos?disciplina=${encodeURIComponent(disciplinaNome)}`);
      if (!response.ok) throw new Error("Erro ao buscar assuntos");
      const assuntos = await response.json();
      const selectAssunto = document.getElementById("assunto");
      
      if (selectAssunto) {
        selectAssunto.innerHTML = "<option value=''>Selecione o assunto</option>";
        assuntos.forEach(item => {
          const option = document.createElement("option");
          option.value = item.nome;
          option.textContent = item.nome;
          selectAssunto.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar assuntos:", error);
    }
  }

  // 6. Event listeners para disciplinas e assuntos
  const disciplinaSelect = document.getElementById("disciplina");
  if (disciplinaSelect) {
    disciplinaSelect.addEventListener("change", (event) => {
      carregarAssuntos(event.target.value);
    });
  }

  // 7. Submit do formulário
  const studyForm = document.getElementById("studyForm");
  if (studyForm) {
    studyForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      console.log("Submit acionado");

      const formData = {
        usuario_id: document.getElementById("usuario_id").value,
        data_estudo: document.getElementById("data_estudo").value,
        disciplina: document.getElementById("disciplina").value,
        assunto: document.getElementById("assunto").value,
        horas_estudadas: document.getElementById("horas").value,
        questoes_erradas: document.getElementById("questoes_erradas").value,
        questoes_certas: document.getElementById("questoes_certas").value,
        tipo_estudo: document.getElementById("tipo_estudo").value
      };

      try {
        const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/estudos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao cadastrar dados");
        }

        console.log("Dados cadastrados com sucesso!");
        closeForm();
        location.reload();
      } catch (error) {
        console.error("Erro ao cadastrar dados:", error);
      }
    });
  }

  // 8. Função para atualizar gráficos
  async function atualizarGraficos() {
    try {
      console.log("Gráficos atualizados com os novos dados.");
      // Implementação real da atualização dos gráficos
    } catch (error) {
      console.error("Erro ao atualizar gráficos:", error);
    }
  }

  async function carregarDadosGraficos() {
      try {
        // Obtém o id do usuário e busca os dados da API para os gráficos
        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
          console.error("❌ Usuário não autenticado.");
          return;
        }
        const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
        if (!response.ok) throw new Error("Erro ao buscar dados de gráficos");
        const dados = await response.json();
    
        // Processa os dados para o gráfico de linhas (questões por dia)
        const questoesData = dados.questoes.map(item => ({
          data: new Date(item.data_estudo).toLocaleDateString(),
          certas: parseFloat(item.total_certas) || 0,
          erradas: parseFloat(item.total_erradas) || 0
        }));
    
        const datasQuestao = questoesData.map(item => item.data);
        const qtdCertas = questoesData.map(item => item.certas);
        const qtdErradas = questoesData.map(item => item.erradas);
    

        const lineCanvas = document.getElementById("lineChart");
        if (!lineCanvas) {
          console.error("❌ O elemento #lineChart não foi encontrado no DOM.");
          return;
        }
        const ctxLine = lineCanvas.getContext("2d");
    
        //  evitar sobreposição
        if (myChart) {
          myChart.destroy();
        }
    
        // gráfico de linhas com as customizações
        myChart = new Chart(ctxLine, {
          type: "line",
          data: {
            labels: datasQuestao,
            datasets: [
              {
                label: "Questões Certas",
                data: qtdCertas,
                borderColor: "#ffe0dc",
                backgroundColor: "rgba(255, 224, 220, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#ffe0dc",
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true
              },
              {
                label: "Questões Erradas",
                data: qtdErradas,
                borderColor: "#de3c3c", 
                backgroundColor: "rgba(222, 60, 60, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: "#de3c3c",
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
                // font: { size: 18, weight: "bold" },
                color: "#FFF" 
              },
              legend: {
                labels: {
                  color: "#FFF", 
                  // font: { size: 14 },
                  usePointStyle: true,
                  pointStyle: "circle"
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  color: "#FFF",
                  // font: { size: 12 }
                },
                grid: {
                  display: false 
                }
              },
              y: {
                ticks: {
                  color: "#FFF",
                  // font: { size: 12 }
                },
                grid: {
                  display: false 
                }
              }
            }
          }
        });
        console.log(" Gráfico de linhas criado com sucesso!");
      } catch (error) {
        console.error(" Erro ao carregar dados para os gráficos:", error);
      }
    }      

    async function carregarDadosDoughnut() {
      try {
          console.log("Carregando dados para o gráfico de rosca...");
  
          const usuarioId = localStorage.getItem("usuario_id");
          if (!usuarioId) {
              console.error("Usuário não autenticado.");
              return;
          }
  
          const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
          if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
          const dados = await response.json();
  
          console.log("Dados carregados para o gráfico de rosca:", dados);
          
          if (!dados.tipoEstudo || !Array.isArray(dados.tipoEstudo) || dados.tipoEstudo.length === 0) {
              console.warn("Nenhum dado válido recebido para o gráfico de rosca.");
              return;
          }
  
          // Extraindo os rótulos e os valores
          const categorias = dados.tipoEstudo.map(item => item.tipo_estudo || "Desconhecido");
          const horasPorTipo = dados.tipoEstudo.map(item => parseFloat(item.total_horas) || 0);
          const totalHoras = horasPorTipo.reduce((a, b) => a + b, 0);
  
          console.log("Processando os dados do gráfico de rosca...");
          console.log("Categorias (labels):", categorias);
          console.log("Valores (data):", horasPorTipo);
  
          const doughnutCanvas = document.getElementById("doughnutChart");
          if (!doughnutCanvas) {
              console.error("Elemento #doughnutChart não encontrado no DOM.");
              return;
          }
          const ctxDoughnut = doughnutCanvas.getContext("2d");
  
          if (myDoughnutChart) {
              myDoughnutChart.destroy();
          }
  
          // Configuração específica apenas para este gráfico
          myDoughnutChart = new Chart(ctxDoughnut, {
              type: "doughnut",
              data: {
                  labels: categorias,
                  datasets: [{
                      data: horasPorTipo,
                      backgroundColor: ["#6a8ce4", "#de3c3c", "#ffc2ba"],
                      borderWidth: 0,
                      hoverOffset: 15
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "75%",
                  plugins: {
                      legend: {
                          display: true,
                          position: 'right',
                          labels: {
                              color: "#FFF",
                              usePointStyle: true,
                              pointStyle: "circle",
                              padding: 20,
                              font: {
                                  size: 14
                              }
                          }
                      },
                      tooltip: {
                          callbacks: {
                              label: function(context) {
                                  const percentage = ((context.raw / totalHoras) * 100).toFixed(1);
                                  return `${context.label}: ${context.raw.toFixed(1)}h (${percentage}%)`;
                              }
                          },
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          titleColor: "#FFF",
                          bodyColor: "#FFF",
                          borderColor: "#B92C2C",
                          borderWidth: 1
                      },
                      title: {
                          display: false // Removemos o título para ficar mais limpo
                      },
                      datalabels: {
                          display: false // Desativamos os datalabels padrão
                      }
                  },
                  animation: {
                      animateScale: true,
                      animateRotate: true,
                      duration: 1000
                  }
              },
              plugins: [
                  // Plugin personalizado para texto central
                  {
                      id: 'doughnutCenterText',
                      beforeDraw(chart) {
                          const { ctx, chartArea: { width, height } } = chart;
                          
                          ctx.save();
                          ctx.textAlign = 'center';
                          ctx.textBaseline = 'middle';
                          
                          // Texto "TOTAL"
                          ctx.font = 'bold 16px "Bebas Neue", sans-serif';
                          ctx.fillStyle = '#FFF';
                          ctx.fillText('TOTAL:', width / 2, height / 2 - 15);
                          
                          // Valor total
                          ctx.font = 'bold 24px "Bebas Neue", sans-serif';
                          ctx.fillStyle = '#FFF';
                          ctx.fillText(totalHoras.toFixed(1) + 'h', width / 2, height / 2 + 15);
                          ctx.restore();
                      }
                  },
                  // Plugin personalizado para porcentagens
                  {
                      id: 'doughnutPercentages',
                      afterDraw(chart) {
                          const { ctx, chartArea: { width, height }, data } = chart;
                          const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                          
                          chart.getDatasetMeta(0).data.forEach((arc, i) => {
                              const angle = arc.endAngle - arc.startAngle;
                              const percentage = ((data.datasets[0].data[i] / total) * 100).toFixed(1);
                              
                              // Mostra porcentagem apenas para fatias significativas
                              if (angle > 0.3 && percentage > 5) {
                                  const x = arc.tooltipPosition().x;
                                  const y = arc.tooltipPosition().y;
                                  
                                  ctx.save();
                                  ctx.textAlign = 'center';
                                  ctx.textBaseline = 'middle';
                                  ctx.font = 'bold 12px Montserrat';
                                  ctx.fillStyle = '#FFF';
                                  ctx.fillText(`${percentage}%`, x, y);
                                  ctx.restore();
                              }
                          });
                      }
                  }
              ]
          });
  
          console.log("Gráfico de rosca criado com sucesso!");
      } catch (error) {
          console.error("Erro ao carregar dados para o gráfico de rosca:", error);
      }
  }
  async function carregarDadosBarras() {
    try {
      console.log("📡 Carregando dados para o gráfico de barras...");
  
      const usuarioId = localStorage.getItem("usuario_id");
      if (!usuarioId) {
        console.error(" Usuário não autenticado.");
        return;
      }
  
      const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/questoesPorDisciplina?usuario_id=${usuarioId}`);
      if (!response.ok) throw new Error("Erro ao buscar dados de questões por disciplina");
      const dados = await response.json();
      console.log(" Dados para gráfico de barras carregados:", dados);
  
      if (!Array.isArray(dados) || dados.length === 0) {
        console.warn(" Nenhum dado válido recebido para o gráfico de barras.");
        return;
      }
  
      // Ordena os dados do maior para o menor volume de questões
      dados.sort((a, b) => parseInt(b.total_questoes) - parseInt(a.total_questoes));
  
      const disciplinas = dados.map(item => item.disciplina);
      const totalQuestoes = dados.map(item => parseInt(item.total_questoes) || 0);
  
      console.log(" Dados processados para gráfico de barras:");
      console.log(" Disciplinas:", disciplinas);
      console.log(" Total de Questões:", totalQuestoes);
  
      const barCanvas = document.getElementById("barChart");
      if (!barCanvas) {
        console.error(" O elemento #barChart não foi encontrado no DOM.");
        return;
      }
      const ctxBar = barCanvas.getContext("2d");
  
      if (myBarChart) {
        myBarChart.destroy();
      }
  
      myBarChart = new Chart(ctxBar, {
        type: "bar",
        data: {
          labels: disciplinas,
          datasets: [{
            label: "Total de Questões Respondidas",
            data: totalQuestoes,
            backgroundColor: "#de3c3c",
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { color: "#FFF" },
              title: { display: true, text: "Matérias", color: "#FFF" },
              grid: { display: false }
            },
            y: {
              ticks: { color: "#FFF" },
              title: { display: true, text: "Total de Questões", color: "#FFF" },
              beginAtZero: true,
              grid: { display: false }
            }
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#FFF",
                // font: { size: 14 },
                usePointStyle: true,
                pointStyle: "circle"
              }
            },
            title: {
              display: true,
              text: "Questões Respondidas por Disciplina",
              // font: { size: 18 },
              color: "#FFF"
            },
            tooltip: {
              backgroundColor: "rgba(0, 0, 0, 0.8)", 
              titleColor: "#FFF",
              bodyColor: "#FFF"
            },
            datalabels: {
              formatter: (value) => value.toFixed(0),
              color: "#FFF",
              anchor: "end",
              align: "end",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: 3,
              padding: 4,
              font: { weight: "bold" }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
  
      console.log(" Gráfico de barras criado com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar dados para o gráfico de barras:", error);
    }
  }
    async function carregarDadosBarrasPercentual() {
      try {
          console.log("Carregando dados para o gráfico horizontal de percentual...");
  
          const usuarioId = localStorage.getItem("usuario_id");
          if (!usuarioId) {
              console.error("Usuário não autenticado.");
              return;
          }
  
          const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
          if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
          const dados = await response.json();
  
          if (!dados.disciplina || !Array.isArray(dados.disciplina) || dados.disciplina.length === 0) {
              console.warn("Nenhum dado válido recebido.");
              return;
          }
  
          // Processa os dados
          const totalHorasEstudo = dados.disciplina.reduce((sum, item) => sum + Number(item.total_horas), 0);
          const combinados = dados.disciplina.map(item => ({
              disciplina: item.disciplina,
              percentual: totalHorasEstudo ? Math.round((Number(item.total_horas) / totalHorasEstudo) * 100) : 0
          })).sort((a, b) => b.percentual - a.percentual);
  
          const percentBarCanvas = document.getElementById("percentBarChart");
          if (!percentBarCanvas) {
              console.error("Elemento #percentBarChart não encontrado.");
              return;
          }
  
          if (myPercentBarChart) {
              myPercentBarChart.destroy();
          }
  
          // Cores
          const cores = ["#6a8ce4", "#de3c3c", "#ffc2ba", "#B92C2C", "#3aa693", "#285dab"];
          const coresHover = ["#8aacff", "#ff5c5c", "#ffd4cc", "#d93434", "#4cc6b3", "#3a7bcc"];
  
          myPercentBarChart = new Chart(percentBarCanvas.getContext("2d"), {
              type: 'bar',
              data: {
                  labels: combinados.map(item => item.disciplina),
                  datasets: [
                      {
                          label: 'Percentual',
                          data: combinados.map(item => item.percentual),
                          backgroundColor: combinados.map((_, i) => cores[i % cores.length]),
                          hoverBackgroundColor: combinados.map((_, i) => coresHover[i % coresHover.length]),
                          borderWidth: 0,
                          borderRadius: 4,
                          borderSkipped: false
                      }
                  ]
              },
              options: {
                  indexAxis: 'y', // Faz as barras ficarem horizontais
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      x: {
                          min: 0,
                          max: 100,
                          ticks: {
                              callback: function(value) {
                                  return value + '%';
                              },
                              color: '#FFF'
                          },
                          grid: {
                              display: false,
                              drawBorder: false
                          }
                      },
                      y: {
                          ticks: {
                              color: '#FFF'
                          },
                          grid: {
                              display: false,
                              drawBorder: false
                          }
                      }
                  },
                  plugins: {
                      legend: {
                          display: false
                      },
                      tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          bodyColor: '#FFF',
                          displayColors: false,
                          callbacks: {
                              label: function(context) {
                                  return `${context.parsed.x}%`;
                              }
                          }
                      },
                      datalabels: {
                          color: '#FFF',
                          anchor: 'end',
                          align: 'end',
                          formatter: function(value) {
                              return value + '%';
                          },
                          font: {
                              weight: 'bold'
                          }
                      }
                  },
                  animation: {
                      duration: 1500,
                      easing: 'easeOutQuart'
                  }
              },
              plugins: [ChartDataLabels]
          });
  
          console.log("Gráfico horizontal de percentual criado com sucesso!");
      } catch (error) {
          console.error("Erro ao carregar dados:", error);
      }
  }

  // Chamada para carregar os gráficos
  await carregarDadosGraficos();
  await carregarDadosDoughnut();
  await carregarDadosBarras();
  await carregarDadosBarrasPercentual();

  // Atualiza o contador de dias de estudo
  try {
      const usuarioId = localStorage.getItem("usuario_id");
      if (usuarioId) {
          const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
          if (response.ok) {
              const data = await response.json();
              const totalDiasElement = document.getElementById("totalDias");
              if (totalDiasElement) {
                  totalDiasElement.textContent = `Dias de Estudo: ${data.totalDias}`;
              }
          }
      }
  } catch (error) {
      console.error("Erro ao carregar o total de dias de estudo:", error);
  }
});

// Fallback garantido para o botão de ranking
function initRankingButton() {
  const btnRanking = document.getElementById("btnRanking");
  
  if (!btnRanking) {
    console.error("Botão de ranking não encontrado!");
    return;
  }

  btnRanking.addEventListener("click", function(e) {
    e.preventDefault();
    console.log("Botão de ranking clicado - redirecionando...");
    
    // Fecha o menu lateral se existir
    const sidebar = document.querySelector(".sidebar");
    if (sidebar && window.innerWidth <= 768) {
      sidebar.classList.remove("expanded");
    }
    
    // Força o redirecionamento
    window.location.href = "/ranking";
  });
}

// Inicializa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", initRankingButton);

// Tenta novamente após 3 segundos (fallback)
setTimeout(initRankingButton, 3000);
