document.addEventListener("DOMContentLoaded", function() {
  // Detecta se está rodando localmente
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  // Define a base da API conforme ambiente
  const API_BASE_URL = isLocalhost 
    ? "http://localhost:3000/api" 
    : "https://dashboard-objetivo-policial.onrender.com/api";

  // Elementos da interface
  const simuladoSelect = document.getElementById("simulado");
  const finalizarBtn = document.getElementById("finalizarSimulado");
  const questoesContainer = document.getElementById("questoes-container");
  const resultadoContainer = document.createElement("div");
  resultadoContainer.id = "resultado-container";
  document.querySelector(".simulado-aluno-container").appendChild(resultadoContainer);
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
}
  
  // 1. Carregar simulados disponíveis
  async function carregarSimulados() {
    try {
      const response = await fetch(`${API_BASE_URL}/simulado-aluno/simulados`);
      if (!response.ok) throw new Error("Erro ao carregar simulados");
      
      const simulados = await response.json();
      simuladoSelect.innerHTML = '<option value="">Selecione um simulado</option>';

      simulados.forEach(simulado => {
        const option = document.createElement("option");
        option.value = simulado.id;
        option.textContent = `${simulado.numero_simulado} - ${simulado.prova}`;
        option.dataset.tipo = simulado.tipo_simulado;
        simuladoSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar simulados:", error);
      alert("Erro ao carregar simulados. Atualize a página.");
    }
  }

  // 2. Carregar questões do simulado selecionado
  async function carregarQuestoes() {
    const simuladoId = simuladoSelect.value;
    if (!simuladoId) return;

    try {
      // Mostrar loading
      questoesContainer.innerHTML = '<p class="loading">Carregando questões...</p>';
      finalizarBtn.disabled = true;
      
      const response = await fetch(`${API_BASE_URL}/simulado-aluno/simulados/${simuladoId}/questoes`);
      if (!response.ok) throw new Error("Erro ao carregar questões");
      
      const data = await response.json();
      const { tipo_simulado, questoes } = data;

      questoesContainer.innerHTML = "";
      resultadoContainer.style.display = "none";

      if (!questoes || questoes.length === 0) {
        throw new Error("Nenhuma questão encontrada para este simulado");
      }

      // Criar campos de resposta com disciplina
      questoes.forEach(questao => {
        const questaoDiv = document.createElement("div");
        questaoDiv.className = "questao-item";
        questaoDiv.dataset.questaoId = questao.numero_questao;
    
        // Criar container para a label
        const labelContainer = document.createElement("div");
        labelContainer.className = "label-container";
    
        const label = document.createElement("label");
        label.innerHTML = `
            <span class="questao-numero">Questão ${questao.numero_questao}</span>
            <span class="disciplina-tag">${questao.disciplina || 'Geral'}</span>
        `;
        label.className = "questao-label";
    
        const input = criarInputQuestao(tipo_simulado);
        input.dataset.numeroQuestao = questao.numero_questao;
        input.dataset.peso = questao.peso || 1;
        input.required = true;
    
        // Adicionar elementos na ordem correta
        labelContainer.appendChild(label);
        questaoDiv.appendChild(labelContainer);
        questaoDiv.appendChild(input); // Input agora estará abaixo da label
        questoesContainer.appendChild(questaoDiv);
    });

      finalizarBtn.disabled = false;
    } catch (error) {
      console.error("Erro ao carregar questões:", error);
      questoesContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    }
  }

  // Função auxiliar para criar inputs baseados no tipo
  function criarInputQuestao(tipoProva) {
    let input;
    
    if (tipoProva === "Certo ou Errado") {
      input = document.createElement("select");
      input.className = "questao-input";
    
      const opcoes = [
        { value: "EM_BRANCO", text: "Em Branco" },  // <-- valor claro para backend
        { value: "C", text: "Certo" },
        { value: "E", text: "Errado" }
      ];
    
      opcoes.forEach(opcao => {
        const option = document.createElement("option");
        option.value = opcao.value;
        option.textContent = opcao.text;
        input.appendChild(option);
      });
    }
    
    else if (tipoProva === "Acertivas A-D") {
      input = document.createElement("select");
      input.className = "questao-input";
      
      ['', 'A', 'B', 'C', 'D'].forEach(opcao => {
        const option = document.createElement("option");
        option.value = opcao;
        option.textContent = opcao || 'Selecione';
        input.appendChild(option);
      });
    }
    else if (tipoProva === "Acertivas A-E") {
      input = document.createElement("select");
      input.className = "questao-input";
      
      ['', 'A', 'B', 'C', 'D', 'E'].forEach(opcao => {
        const option = document.createElement("option");
        option.value = opcao;
        option.textContent = opcao || 'Selecione';
        input.appendChild(option);
      });
    }
    else { // Discursivo
      input = document.createElement("textarea");
      input.className = "questao-input";
      input.placeholder = "Digite sua resposta...";
    }
    
    return input;
  }

  // Função para mostrar mensagem de sucesso
  function mostrarMensagemSucesso() {
    const mensagemExistente = document.querySelector('.mensagem-sucesso');
    if (mensagemExistente) mensagemExistente.remove();

    const mensagem = document.createElement('div');
    mensagem.className = 'mensagem-sucesso';
    mensagem.innerHTML = `
      <div class="alert-success">
        <span>✓</span> Simulado cadastrado com sucesso!
      </div>
    `;
    
    const container = document.querySelector('.simulado-aluno-container');
    container.insertBefore(mensagem, container.firstChild);
    
    setTimeout(() => {
      mensagem.style.opacity = '0';
      setTimeout(() => mensagem.remove(), 500);
    }, 5000);
  }

  async function enviarRespostas() {
    const simuladoId = simuladoSelect.value;
    const alunoId = obterIdAlunoLogado();
  
    if (!alunoId) {
      alert("Aluno não identificado. Faça login novamente.");
      return;
    }
  
    if (!simuladoId) {
      alert("Selecione um simulado antes de continuar");
      return;
    }
  
    const inputs = Array.from(document.querySelectorAll('.questao-input'));
    const respostas = [];
    let invalidas = false;
  
    inputs.forEach(input => {
      const questaoId = input.dataset.numeroQuestao;
      const resposta = input.value.trim();
      
      if (!resposta) {
        input.closest('.questao-item').classList.add('nao-respondida');
        invalidas = true;
        return;
      }

      respostas.push({
        numero_questao: parseInt(questaoId),
        resposta_aluno: resposta
      });
    });
  
    if (invalidas) {
      alert("Responda todas as questões antes de finalizar!");
      return;
    }
  
    try {
      finalizarBtn.disabled = true;
      finalizarBtn.textContent = "Salvando...";
  
      const response = await fetch(`${API_BASE_URL}/simulado-aluno/respostas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token") || ''
        },
        body: JSON.stringify({
          aluno_id: alunoId,
          simulado_id: parseInt(simuladoId),
          respostas: respostas
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Erro ao salvar respostas");
      }
  
      mostrarMensagemSucesso();
      exibirResultado(data.data);
  
    } catch (error) {
      console.error("Falha no envio:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      finalizarBtn.disabled = false;
      finalizarBtn.textContent = "Finalizar Simulado";
    }
  }
  
  function exibirResultado(resultado) {
    // Função auxiliar para formatar números
    const formatarPontos = (valor) => {
        const num = typeof valor === 'number' ? valor : parseFloat(valor) || 0;
        return num.toFixed(2).replace('.', ',');
    };

    resultadoContainer.style.display = "block";
    resultadoContainer.scrollIntoView({ behavior: 'smooth' });
    
    const erros = resultado.total_questoes - resultado.acertos;
    const totalPontos = resultado.total_pontos; // Total de pontos certo
    const percentual = resultado.percentual || 0; // Garantir que o percentual não seja undefined
    
    resultadoContainer.innerHTML = `
      <div class="resultado-card">
        <h3>Resultado do Simulado</h3>
        
        <div class="resumo-notas">
          <div class="nota-item acertos">
            <span class="nota-label">Acertos</span>
            <span class="nota-valor">${resultado.acertos}</span>
          </div>
          
          <div class="nota-item erros">
            <span class="nota-label">Erros</span>
            <span class="nota-valor">${erros}</span>
          </div>
          
          <div class="nota-item total">
            <span class="nota-label">Total</span>
            <span class="nota-valor">${resultado.total_questoes}</span>
          </div>
          
          <!-- Exibindo pontos certos e percentual juntos -->
          <div class="nota-item-pontos">
            <span class="nota-label">Pontuação</span>
            <span class="nota-valor">${formatarPontos(totalPontos)}pts (${percentual}%)</span>
          </div>
        </div>
        <div class="tipo-simulado-info">
          <strong>Tipo de Prova:</strong> ${resultado.tipo_simulado}
          ${resultado.tipo_simulado === "Certo ou Errado" ? 
            "(Certa: +peso da questão | Errada: -1 ponto)" : 
            "(Certa: +peso da questão | Errada: 0 pontos)"}
        </div>

          <!-- Nova seção de análise por disciplina -->
        <div class="analise-disciplinas">
          <h4>Análise por Disciplina</h4>
          ${resultado.melhor_disciplina ? `
          <div class="disciplina-destaque melhor">
              <span class="destaque-label">Melhor desempenho:</span>
              <span class="disciplina-nome">${resultado.melhor_disciplina.nome}</span>
              <span class="disciplina-percentual">${resultado.melhor_disciplina.percentual.toFixed(1)}%</span>
              <span class="disciplina-detalhes">(${resultado.melhor_disciplina.acertos}/${resultado.melhor_disciplina.total})</span>
          </div>` : ''}
          
          ${resultado.pior_disciplina ? `
          <div class="disciplina-destaque pior">
              <span class="destaque-label">Pior desempenho:</span>
              <span class="disciplina-nome">${resultado.pior_disciplina.nome}</span>
              <span class="disciplina-percentual">${resultado.pior_disciplina.percentual.toFixed(1)}%</span>
              <span class="disciplina-detalhes">(${resultado.pior_disciplina.acertos}/${resultado.pior_disciplina.total})</span>
          </div>` : ''}
          
        
        <h4 class="gabarito-titulo">Comparativo com Gabarito Oficial</h4>
        
        <div class="gabarito-grid">
          ${resultado.detalhes.map(item => `
            <div class="questao-row ${item.acertou ? 'acerto' : 'erro'}">
              <div>Questão: ${item.numero_questao}</div>
              <div>Disciplina: ${item.disciplina || '-'}</div>
              <div>Sua Resposta: ${item.resposta_aluno || '-'}</div>
              <div>Gabarito: ${item.gabarito}</div>
              <div>Pontuação: ${formatarPontos(item.nota)}/${formatarPontos(item.peso)}</div>
            </div>
          `).join('')}
        </div>

        <!-- Adicionando comentários das questões -->
        ${resultado.detalhes.some(item => item.comentario) ? `
        <div class="comentarios-section">
          <h4>Comentários das Questões</h4>
          ${resultado.detalhes.filter(item => item.comentario).map(item => `
            <div class="comentario-item">
              <strong>Questão ${item.numero_questao} (${item.disciplina || 'Geral'}):</strong>
              <p>${item.comentario}</p>
            </div>
          `).join('')}
        </div>` : ''}
        
      
          <div class="disciplinas-grid">
          <h4>Aproveitamento por disciplina</h4>
            ${resultado.disciplinas && resultado.disciplinas.length > 0 ? resultado.disciplinas.map(disciplina => `
              <div class="disciplina-item">
                  <span class="disciplina-nome">${disciplina.nome}</span>
                  <div class="disciplina-bar">
                      <div class="bar-fill" style="width: ${disciplina.percentual}%"></div>
                  </div>
                  <span class="disciplina-percentual">${disciplina.percentual.toFixed(1)}%</span>
              </div>
            `).join('') : '<p>Não há disciplinas disponíveis para exibição.</p>'}
          </div>
        </div>
      </div>
    `;
}


  // Função para obter o ID do aluno
  function obterIdAlunoLogado() {
    try {
      // 1. Tentar pelo localStorage
      const alunoId = localStorage.getItem('aluno_id') || 
                     localStorage.getItem('usuario_id');
      
      if (alunoId) {
        const id = Number(alunoId);
        return isNaN(id) ? null : id;
      }
      
      // 2. Tentar pelo token JWT (se existir)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.userId || payload.sub || payload.aluno_id;
        } catch (e) {
          console.error("Erro ao decodificar token:", e);
        }
      }
      
      return null;
    } catch (e) {
      console.error("Erro ao obter ID do aluno:", e);
      return null;
    }
  }

  // Função para carregar o dashboard de análise
  async function carregarDashboardAnalise() {
    try {
      // Obter ID do aluno de forma segura
      const alunoId = obterIdAlunoLogado();
      
      if (!alunoId) {
        throw new Error("Aluno não identificado. Faça login novamente.");
      }
  
      // Mostrar loading
      const container = document.getElementById('dashboard-container');
      container.innerHTML = '<div class="loading">Carregando análise de desempenho...</div>';
  
      // Chamada à API com o ID do aluno na URL
      const response = await fetch(`${API_BASE_URL}/simulado-aluno/aluno/${alunoId}/desempenho`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao carregar dados");
      }
      
      const { data } = await response.json();
  
      // Verificar se existem dados
      if (!data || !data.desempenhoGeral || data.desempenhoGeral.length === 0) {
        throw new Error("Nenhum dado de desempenho encontrado");
      }
  
      // Renderizar gráficos
      renderizarGraficos(data);
  
    } catch (error) {
      console.error("Erro no dashboard:", error);
      const container = document.getElementById('dashboard-container');
      container.innerHTML = `
        <div class="error-message">
          <p>${error.message}</p>
          <button onclick="carregarDashboardAnalise()">Tentar novamente</button>
        </div>
      `;
    }
  }

  function renderizarGraficos(data) {
    const container = document.getElementById('dashboard-container');
    
    container.innerHTML = `
      <h2 class="dashboard-title">Meu Desempenho</h2>
      <div class="graficos-grid">
      <div class="ajuste">
        <div class="grafico-card">
          <h3>Desempenho Geral</h3>
          <canvas id="graficoAcertosErros"></canvas>
        </div>
        <div class="grafico-card">
          <h3>Por Disciplina</h3>
          <canvas id="graficoDisciplinas"></canvas>
        </div>
      </div>
      <div class="ajuste">
        <div class="grafico-card full-width">
          <h3>Evolução Temporal</h3>
          <canvas id="graficoEvolucao"></canvas>
        </div>
        <div class="grafico-card full-width">
          <h3>Notas por Simulado</h3>
          <canvas id="graficoNotasFinais"></canvas>
        </div>
      </div>
    
      </div>
    `;

    // Inicializar gráficos
    criarGraficoAcertosErros(data);
    criarGraficoDisciplinas(data);
    criarGraficoEvolucao(data);
    criarGraficoNotasFinais(data);
  }

  // Funções para criar os gráficos
 function criarGraficoAcertosErros(data) {
    const ctx = document.getElementById('graficoAcertosErros');
    if (!ctx) return;

    // Converter valores para números e calcular totais
    const totalAcertos = data.desempenhoGeral.reduce((sum, item) => {
        return sum + (Number(item.acertos))|| 0;
    }, 0);
    
    const totalErros = data.desempenhoGeral.reduce((sum, item) => {
        return sum + (Number(item.erros))|| 0;
    }, 0);
    
    const totalQuestoes = totalAcertos + totalErros;
    
    // Calcular percentuais corretamente
    const percentualAcertos = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
    const percentualErros = totalQuestoes > 0 ? 100 - percentualAcertos : 0;

    // Formatar números para exibição
    const formatarNumero = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: [
              `Acertos (${percentualAcertos}%)`, 
              `Erros (${percentualErros}%)`
          ],
          datasets: [{
              data: [totalAcertos, totalErros],
              backgroundColor: ['#3CB371', '#B22222'],
              borderWidth: 0
          }]
      },
      options: {
          responsive: true,
          plugins: {
              legend: {
                  position: 'bottom',
                  labels: {
                      font: {
                          size: 14
                      },
                      color: '#DCDCDC'
                  }
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          const label = context.label.replace(/\(.*?\)/, '').trim();
                          const value = context.raw || 0;
                          return `${label}: ${formatarNumero(value)} questões`;
                      }
                  }
              }
          },
          // Controle da largura da rosca:
          cutout: '70%' // Experimente valores entre 50% e 90%
      }
  });
}

function criarGraficoDisciplinas(data) {
  const ctx = document.getElementById('graficoDisciplinas');
  if (!ctx || !data.desempenhoPorDisciplina) return;

  // Ordenar por percentual de acerto
  // Ordenar por percentual de acerto
const disciplinasOrdenadas = [...data.desempenhoPorDisciplina].sort((a, b) => b.percentual_acerto - a.percentual_acerto);

new Chart(document.getElementById('graficoDisciplinas').getContext('2d'), {
  type: 'radar',
  data: {
    labels: disciplinasOrdenadas.map(d => d.disciplina),
    datasets: [{
      label: 'Percentual de Acertos',
      data: disciplinasOrdenadas.map(d => d.percentual_acerto),
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      borderColor: '#4CAF50',
      borderWidth: 2,
      pointBackgroundColor: disciplinasOrdenadas.map(d => 
        d.percentual_acerto >= 70 ? '#4CAF50' : 
        d.percentual_acerto >= 50 ? '#FFC107' : '#F44336'),
      pointBorderColor: '#fff',
      pointHoverRadius: 6,
      pointRadius: 4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          color: '#FFF',
          backdropColor: 'transparent'
        },
        pointLabels: {
          color: '#FFF',
          font: {
            size: 7
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
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
        callbacks: {
          label: function(context) {
            const disciplina = disciplinasOrdenadas[context.dataIndex];
            return [
              `Percentual: ${context.raw}%`,
              `Acertos: ${disciplina.acertos}`,
              `Erros: ${disciplina.erros}`,
              `Total: ${disciplina.total}`
            ];
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.1 // Suaviza as linhas do radar
      }
    }
  }
});
}
function criarGraficoEvolucao(data) {
  const ctx = document.getElementById('graficoEvolucao');
  if (!ctx || !data.evolucaoTemporal) return;

  // Formatar datas no padrão dd/mm/aa
  const formatarData = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
  };

  const dataEvolucao = {
    labels: data.evolucaoTemporal.map(item => formatarData(item.data)),
    datasets: [
      {
        label: 'Nota Total',
        data: data.evolucaoTemporal.map(item => item.media_nota * item.total_questoes),
        borderColor: '#ffffff', // Linha branca
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Preenchimento levemente branco
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointStyle: 'circle',
        pointRadius: 4, // Tamanho menor
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff' // Cor branca do ponto
      }
    ]    
  };
  
  const configEvolucao = {
    type: 'line',
    data: dataEvolucao,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: false,
            text: 'Nota Total',
            color: '#ffffff' // Cor branca para o título do eixo Y
          },
          ticks: {
            color: '#ffffff' // Cor branca para os valores do eixo Y
          }
        },
        x: {
          title: {
            display: true,
            text: '',
            color: '#ffffff' // Cor branca para o título do eixo X
          },
          ticks: {
            color: '#ffffff' // Cor branca para os valores do eixo X
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: (ctx) => 'Evolução das Notas',
          color: '#ffffff', // Cor branca para o título do gráfico
          font: {
            size: 18
          }
        },
        legend: {
          labels: {
            color: '#ffffff' // Cor branca para a legenda
          }
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const item = data.evolucaoTemporal[context.dataIndex];
              return `Média: ${item.media_nota.toFixed(2)}\nQuestões: ${item.total_questoes}`;
            }
          }
        }
      }
    }
  }    
  
  const ctxEvolucao = document.getElementById('graficoEvolucao').getContext('2d');
  const graficoEvolucao = new Chart(ctxEvolucao, configEvolucao);
  
}
function criarGraficoNotasFinais(data) {
  const ctx = document.getElementById('graficoNotasFinais');
  if (!ctx || !data.notasFinais) return;

  // Ordenar por data de realização
  const simuladosOrdenados = [...data.notasFinais].sort((a, b) => 
      new Date(a.data_realizacao) - new Date(b.data_realizacao));

  new Chart(ctx, {
      type: 'bar',
      data: {
          labels: simuladosOrdenados.map(item => item.nome_simulado),
          datasets: [{
              label: 'Nota Final',
              data: simuladosOrdenados.map(item => item.nota_final),
              backgroundColor: simuladosOrdenados.map(item => 
                  item.nota_final >= 70 ? '#4CAF50' : 
                  item.nota_final >= 50 ? '#FFC107' : '#F44336'),
              borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'white' // cor dos valores do eixo Y
            },
            title: {
              display: false
            }
          },
          x: {
            ticks: {
              color: 'white' // cor dos valores do eixo X
            },
            title: {
              display: true
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'white' // cor do texto da legenda
            }
          },
          tooltip: {
            bodyColor: 'white', // cor do texto do tooltip
            callbacks: {
              afterLabel: function(context) {
                const simulado = simuladosOrdenados[context.dataIndex];
                return `Realizado em: ${new Date(simulado.data_realizacao).toLocaleDateString('pt-BR')}`;
              }
            }
          }
        }
      }
      
  });
}

  // Event listeners
  simuladoSelect.addEventListener("change", carregarQuestoes);
  finalizarBtn.addEventListener("click", enviarRespostas);
  
  // Inicialização
  carregarSimulados();
  
  // Carregar dashboard automaticamente se estiver na página correta
  if (window.location.pathname.includes('dashboard') || 
      document.getElementById('dashboard-container')) {
    carregarDashboardAnalise();
  }
});
