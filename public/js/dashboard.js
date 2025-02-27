document.addEventListener("DOMContentLoaded", async () => {
    // Define o usuário logado (obtido do localStorage, por exemplo)
    const usuarioId = localStorage.getItem("usuario_id"); // Certifique-se de que o ID foi armazenado durante o login
    if (usuarioId) {
      document.getElementById("usuario_id").value = usuarioId;
    }
  
    // Obtém a data atual, adiciona 1 dia e formata no padrão YYYY-MM-DD
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const formattedDate = today.toISOString().split("T")[0];
    document.getElementById("data_estudo").value = formattedDate;
  
    // Resto do seu código, como carregar disciplinas, configurar listeners, etc.
    let myChart = null;          // Gráfico de linhas
    let myDoughnutChart = null;  // Gráfico de rosca
    let myBarChart = null;       // Gráfico de barras (total de questões)
    let myPercentBarChart = null;// Gráfico de percentual de estudo por disciplina
  
    console.log("✅ dashboard.js carregado!");
    console.log(typeof Chart);
  
    // Função para carregar as disciplinas
    async function carregarDisciplinas() {
      try {
        const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/disciplinas");
        if (!response.ok) throw new Error("Erro ao buscar disciplinas");
        const disciplinas = await response.json();
        const selectDisciplina = document.getElementById("disciplina");
        // Limpa e preenche o select
        selectDisciplina.innerHTML = "<option value=''>Selecione a disciplina</option>";
        disciplinas.forEach(item => {
          const option = document.createElement("option");
          option.value = item.disciplina;
          option.textContent = item.disciplina;
          selectDisciplina.appendChild(option);
        });
        console.log("Disciplinas carregadas:", disciplinas);
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
      }
    }
  
    // Função para carregar os assuntos de uma disciplina específica
    async function carregarAssuntos(disciplinaNome) {
      try {
        if (!disciplinaNome) return;
        const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/disciplinas/assuntos?disciplina=${encodeURIComponent(disciplinaNome)}`);
        if (!response.ok) throw new Error("Erro ao buscar assuntos");
        const assuntos = await response.json();
        const selectAssunto = document.getElementById("assunto");
        // Limpa e preenche o select
        selectAssunto.innerHTML = "<option value=''>Selecione o assunto</option>";
        assuntos.forEach(item => {
          const option = document.createElement("option");
          option.value = item.nome;
          option.textContent = item.nome;
          selectAssunto.appendChild(option);
        });
        console.log("Assuntos carregados para a disciplina", disciplinaNome, ":", assuntos);
      } catch (error) {
        console.error("Erro ao carregar assuntos:", error);
      }
    }
  
    // Chama a função para carregar as disciplinas ao carregar o DOM
    await carregarDisciplinas();
  
    // Quando a disciplina for alterada, carrega os assuntos
    document.getElementById("disciplina").addEventListener("change", (event) => {
      carregarAssuntos(event.target.value);
    });
  
    // Função para atualizar os gráficos (exemplo)
    async function atualizarGraficos() {
      try {
        console.log("Gráficos atualizados com os novos dados.");
      } catch (error) {
        console.error("Erro ao atualizar gráficos:", error);
      }
    }
  
    // Listener para o submit do formulário
    document.getElementById("studyForm").addEventListener("submit", async function(e) {
      e.preventDefault();
      console.log("Submit acionado");
  
      // Captura os dados do formulário, incluindo o usuario_id e data_estudo já definida
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
  
      console.log("Dados do formulário:", formData);
  
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
        await atualizarGraficos();
        document.getElementById("studyForm").reset();
        location.reload();
      } catch (error) {
        console.error("Erro ao cadastrar dados:", error);
      }
    });


    // Função para o menu lateral
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector("#toggleSidebar");

    if (toggleButton && sidebar) {
      toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
      });
    }

    // Funções para o formulário popup
    const formPopup = document.getElementById("formPopup");
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");

    if (openFormButton && formPopup) {
      openFormButton.addEventListener("click", () => {
        formPopup.style.display = "flex";
      });
    }

    if (closeFormButton && formPopup) {
      closeFormButton.addEventListener("click", () => {
        formPopup.style.display = "none";
      });
    }

    // Fechar o formulário quando clicar fora dele
    window.addEventListener("click", (event) => {
      if (event.target === formPopup) {
        formPopup.style.display = "none";
      }
    });

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

            // Prepara os dados para o gráfico de linhas
            const questoesData = dados.questoes.map(item => ({
                data: new Date(item.data_estudo).toLocaleDateString(),
                certas: parseFloat(item.total_certas) || 0,
                erradas: parseFloat(item.total_erradas) || 0
              }));
            
              const datasQuestao = questoesData.map(item => item.data);
              const qtdCertas = questoesData.map(item => item.certas);
              const qtdErradas = questoesData.map(item => item.erradas);
              const ctxLine = lineCanvas.getContext("2d");
            
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
                      borderColor: "#ffe0dc", // Linha em cor #ffe0dc
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
                      borderColor: "#de3c3c", // Linha em cor #de3c3c
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
                      font: { size: 18, weight: "bold" },
                      color: "#FFF" // Título em branco
                    },
                    legend: {
                      labels: {
                        color: "#FFF", // Legenda em branco
                        font: { size: 14 },
                        usePointStyle: true,
                        pointStyle: "circle"
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "#FFF",
                        font: { size: 12 }
                      },
                      grid: {
                        display: false // Retira a grade do eixo X
                      }
                    },
                    y: {
                      ticks: {
                        color: "#FFF",
                        font: { size: 12 }
                      },
                      grid: {
                        display: false // Retira a grade do eixo Y
                      }
                    }
                  }
                }
              });
            } catch (error) {
              console.error("❌ Erro ao carregar dados para os gráficos:", error);
        }
    }

    async function carregarDadosDoughnut() {
        try {
            console.log("📡 Carregando dados para o gráfico de rosca...");

    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      console.error("❌ Usuário não autenticado.");
      return;
    }

    const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
    if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
    const dados = await response.json();

    console.log("✅ Dados carregados para o gráfico de rosca:", dados);
    console.log("📌 Estrutura dos dados recebidos:", JSON.stringify(dados, null, 2));

    if (!dados.tipoEstudo || !Array.isArray(dados.tipoEstudo) || dados.tipoEstudo.length === 0) {
      console.warn("⚠️ Nenhum dado válido recebido para o gráfico de rosca.");
      return;
    }

    // Extraindo os rótulos e os valores
    const categorias = dados.tipoEstudo.map(item => item.tipo_estudo || "Desconhecido");
    const horasPorTipo = dados.tipoEstudo.map(item => parseFloat(item.total_horas) || 0);

    console.log("📊 Processando os dados do gráfico de rosca...");
    console.log("📌 Categorias (labels):", categorias);
    console.log("📌 Valores (data):", horasPorTipo);

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
        labels: categorias,
        datasets: [{
          data: horasPorTipo,
          // Cores definidas conforme solicitado:
          backgroundColor: ["#6a8ce4", "#de3c3c", "#ffc2ba"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
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
                return `${context.label}: ${context.parsed.toFixed(1)}h`;
              }
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#FFF",
            bodyColor: "#FFF"
          },
          legend: {
            labels: {
              font: { size: 14 },
              color: "#FFF",
              usePointStyle: true,
              pointStyle: "circle"
            }
          },
          datalabels: {
            color: "#FFF",
            backgroundColor: "rgba(0, 0, 0, 0.1)", // Fundo leve e transparente
            borderRadius: 3,
            font: { weight: 'bold', size: 14 },
            formatter: function(value, context) {
              return value.toFixed(1) + "h";
            },
            padding: 4
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    console.log("✅ Gráfico de rosca criado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao carregar dados para o gráfico de rosca:", error);
        }
    }

    async function carregarDadosBarras() {
        try {
            console.log("📡 Carregando dados para o gráfico de rosca...");

    const usuarioId = localStorage.getItem("usuario_id");
    if (!usuarioId) {
      console.error("❌ Usuário não autenticado.");
      return;
    }

    const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
    if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
    const dados = await response.json();

    console.log("✅ Dados carregados para o gráfico de rosca:", dados);
    console.log("📌 Estrutura dos dados recebidos:", JSON.stringify(dados, null, 2));

    if (!dados.tipoEstudo || !Array.isArray(dados.tipoEstudo) || dados.tipoEstudo.length === 0) {
      console.warn("⚠️ Nenhum dado válido recebido para o gráfico de rosca.");
      return;
    }

    // Extraindo os rótulos e os valores
    const categorias = dados.tipoEstudo.map(item => item.tipo_estudo || "Desconhecido");
    const horasPorTipo = dados.tipoEstudo.map(item => parseFloat(item.total_horas) || 0);

    console.log("📊 Processando os dados do gráfico de rosca...");
    console.log("📌 Categorias (labels):", categorias);
    console.log("📌 Valores (data):", horasPorTipo);

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
        labels: categorias,
        datasets: [{
          data: horasPorTipo,
          // Cores definidas conforme solicitado:
          backgroundColor: ["#6a8ce4", "#de3c3c", "#ffc2ba"],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
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
                return `${context.label}: ${context.parsed.toFixed(1)}h`;
              }
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#FFF",
            bodyColor: "#FFF"
          },
          legend: {
            labels: {
              font: { size: 14 },
              color: "#FFF",
              usePointStyle: true,
              pointStyle: "circle"
            }
          },
          datalabels: {
            color: "#FFF",
            backgroundColor: "rgba(0, 0, 0, 0.1)", // Fundo leve e transparente
            borderRadius: 3,
            font: { weight: 'bold', size: 14 },
            formatter: function(value, context) {
              return value.toFixed(1) + "h";
            },
            padding: 4
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    console.log("✅ Gráfico de rosca criado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao carregar dados para o gráfico de rosca:", error)
        }
    }

    async function carregarDadosBarrasPercentual() {
        try {
            console.log("📡 Carregando dados para o gráfico de percentual por disciplina...");

            const usuarioId = localStorage.getItem("usuario_id");
            if (!usuarioId) {
                console.error("❌ Usuário não autenticado.");
                return;
            }

            // Usa os dados da propriedade "disciplina" do endpoint "/graficos"
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/estudos/graficos?usuario_id=${usuarioId}`);
            if (!response.ok) throw new Error("Erro ao buscar dados de estudo");
            const dados = await response.json();
            console.log("✅ Dados carregados para o gráfico de percentual:", dados);

            if (!dados.disciplina || !Array.isArray(dados.disciplina) || dados.disciplina.length === 0) {
                console.warn("⚠️ Nenhum dado válido recebido para o gráfico de percentual.");
                return;
            }

            // Calcula o total de horas estudadas em todas as disciplinas
            const totalHorasEstudo = dados.disciplina.reduce((sum, item) => sum + Number(item.total_horas), 0);
            // Calcula o percentual para cada disciplina
            const disciplinas = dados.disciplina.map(item => item.disciplina);
            const percentuais = dados.disciplina.map(item => {
                const percentual = totalHorasEstudo
                    ? ((Number(item.total_horas) / totalHorasEstudo) * 100)
                    : 0;
                return Number(percentual.toFixed(2));
            });

            console.log("📊 Dados processados para gráfico de percentual:");
            console.log("📌 Disciplinas:", disciplinas);
            console.log("📌 Percentuais:", percentuais);

            const percentBarCanvas = document.getElementById("percentBarChart");
            if (!percentBarCanvas) {
                console.error("❌ O elemento #percentBarChart não foi encontrado no DOM.");
                return;
            }
            const ctxPercentBar = percentBarCanvas.getContext("2d");

            if (myPercentBarChart) {
                myPercentBarChart.destroy();
            }

            // Força gráfico de barras vertical (colunas)
            myPercentBarChart = new Chart(ctxPercentBar, {
                type: "bar",
                data: {
                    labels: disciplinas,
                    datasets: [{
                        label: "% de Estudo por Disciplina",
                        data: percentuais,
                        backgroundColor: "#FFCE56",
                        borderWidth: 0
                    }]
                },
                options: {
                    // Remova indexAxis se estiver definido para 'y'
                    // indexAxis: 'x', // O padrão é vertical
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { color: "#FFF" },
                            title: { display: true, text: "Disciplinas", color: "#FFF" }
                        },
                        y: {
                            ticks: { color: "#FFF" },
                            title: { display: true, text: "% de Estudo", color: "#FFF" },
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: "#FFF" }
                        },
                        title: {
                            display: true,
                            text: "% de Estudo por Disciplina",
                            font: { size: 18 },
                            color: "#FFF"
                        },
                        tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleColor: "#FFF",
                            bodyColor: "#FFF",
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed}%`;
                                }
                            }
                        }
                    }
                }
            });

            console.log("✅ Gráfico de percentual por disciplina criado com sucesso!");

        } catch (error) {
            console.error("❌ Erro ao carregar dados para o gráfico de percentual por disciplina:", error);
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
