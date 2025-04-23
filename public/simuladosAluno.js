document.addEventListener("DOMContentLoaded", () => {
    const simuladoSelect = document.getElementById("simulado");
    const provaSelect = document.getElementById("prova");
    const carregarQuestaoBtn = document.getElementById("carregarQuestoes");
    const finalizarSimuladoBtn = document.getElementById("finalizarSimulado");
    const questoesContainer = document.getElementById("questoes-container");

    let questoes = [];
    let numeroSimulado = "";
    let provaSelecionada = "";

    // Carregar as provas disponíveis ao carregar a página
    fetch("/api/simulado-aluno/provas")
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) { // Verificando se a resposta é um array
          data.forEach(prova => {
            const option = document.createElement("option");
            option.value = prova.id;
            option.textContent = prova.nome;
            provaSelect.appendChild(option);
          });
        } else {
          console.error('Esperado um array de provas, mas recebemos:', data);
        }
      })
      .catch(error => console.error("Erro ao carregar provas:", error));

    // Quando escolher uma prova, carregar os simulados disponíveis
    provaSelect.addEventListener("change", () => {
      provaSelecionada = provaSelect.value;
      simuladoSelect.innerHTML = '<option value="">Selecione</option>'; // Resetando a lista de simulados
      carregarQuestaoBtn.disabled = true;

      if (provaSelecionada) {
        // Carregar os simulados relacionados à prova selecionada
        fetch(`/api/provas/${provaSelecionada}/simulados`)
          .then(response => response.json())
          .then(data => {
            if (Array.isArray(data)) { // Verificando se a resposta é um array
              data.forEach(simulado => {
                const option = document.createElement("option");
                option.value = simulado.numero_simulado;
                option.textContent = `Simulado ${simulado.numero_simulado} - ${simulado.tipo_simulado}`;
                simuladoSelect.appendChild(option);
              });
              simuladoSelect.disabled = false; // Habilitar a seleção de simulados
            } else {
              console.error('Esperado um array de simulados, mas recebemos:', data);
            }
          })
          .catch(error => console.error("Erro ao carregar simulados:", error));
      } else {
        simuladoSelect.disabled = true; // Desabilitar a seleção de simulados caso não tenha prova selecionada
      }
    });

    // Quando escolher o simulado, habilitar o botão para carregar as questões
    simuladoSelect.addEventListener("change", () => {
      numeroSimulado = simuladoSelect.value;
      carregarQuestaoBtn.disabled = !numeroSimulado;
    });

    // Carregar questões
    carregarQuestaoBtn.addEventListener("click", () => {
      if (!numeroSimulado || !provaSelecionada) return;

      fetch(`/api/simulados/${numeroSimulado}/provas/${provaSelecionada}/questoes`)
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) { // Verificando se a resposta é um array
            questoes = data;
            renderizarQuestoes();
            finalizarSimuladoBtn.disabled = false;
          } else {
            console.error('Esperado um array de questões, mas recebemos:', data);
          }
        })
        .catch(error => console.error("Erro ao carregar questões:", error));
    });

    // Renderizar questões
    function renderizarQuestoes() {
      questoesContainer.innerHTML = "";
      questoes.forEach((questao, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("questao");

        const label = document.createElement("label");
        label.textContent = `Q${index + 1}: ${questao.enunciado || "Questão sem enunciado"}`;
        wrapper.appendChild(label);

        const respostaInput = document.createElement("input");
        respostaInput.type = "text";
        respostaInput.name = `resposta_${questao.id}`;
        respostaInput.placeholder = "Digite sua resposta aqui";
        wrapper.appendChild(respostaInput);

        questoesContainer.appendChild(wrapper);
      });
    }

    // Finalizar simulado
    finalizarSimuladoBtn.addEventListener("click", () => {
      let notaFinal = 0;

      questoes.forEach((questao) => {
        const respostaInput = document.querySelector(`[name="resposta_${questao.id}"]`);
        const respostaAluno = respostaInput.value.trim().toUpperCase();

        if (respostaAluno === questao.gabarito) {
          respostaInput.style.backgroundColor = "green";
          notaFinal += parseFloat(questao.peso);
        } else if (respostaAluno === "") {
          respostaInput.style.backgroundColor = "";
        } else {
          respostaInput.style.backgroundColor = "red";
          if (questao.tipo_simulado === "Certo ou Errado") {
            notaFinal -= parseFloat(questao.peso);
          }
        }
      });

      alert(`Sua nota final é: ${notaFinal}`);
    });
});
