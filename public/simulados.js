const form = document.getElementById("simulado-form");
const gerarBtn = document.getElementById("gerar-gabarito");
const gabaritoContainer = document.getElementById("gabarito-container");

let tipoSelecionado = "";
let quantidadeQuestoes = 0;

// Gera os inputs do gabarito com disciplina
gerarBtn.addEventListener("click", () => {
  gabaritoContainer.innerHTML = "";
  tipoSelecionado = document.getElementById("tipo_simulado").value;
  quantidadeQuestoes = parseInt(document.getElementById("quantidade_questoes").value);

  if (!tipoSelecionado || isNaN(quantidadeQuestoes)) return;

  gabaritoContainer.classList.add("show"); // Torna o gabarito visível

  // Lista de disciplinas pré-definidas
  const disciplinas = [
    "DIREITO ADMINISTRATIVO",
    "LEGISLAÇÃO EXTRAVAGANTE",
    "NOÇÕES DE CRIMINOLOGIA",
    "SEGURANÇA PÚBLICA",
    "HISTÓRIA E GEOGRAFIA DE SERGIPE",
    "PORTUGUÊS",
    "MATEMÁTICA",
    "RACIOCÍNIO LÓGICO MATEMÁTICO",
    "INFORMÁTICA",
    "HISTÓRIA",
    "GEOGRAFIA",
    "CONTABILIDADE",
    "DIREITO CONSTITUCIONAL"
  ];

  for (let i = 1; i <= quantidadeQuestoes; i++) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("simulado-gabarito-item");

    const label = document.createElement("label");
    label.textContent = `Q${i}: `;
    label.style.marginRight = "10px";

    // Campo de disciplina (select)
    const disciplinaSelect = document.createElement("select");
    disciplinaSelect.name = `disciplina_q${i}`;
    disciplinaSelect.required = true;
    disciplinaSelect.style.marginRight = "10px";
    
    // Adiciona opções de disciplina
    disciplinas.forEach(disciplina => {
      const option = document.createElement("option");
      option.value = disciplina;
      option.textContent = disciplina;
      disciplinaSelect.appendChild(option);
    });

    // Campo de resposta (gabarito)
    let inputResposta;
    if (tipoSelecionado === "Discursivo") {
      inputResposta = document.createElement("input");
      inputResposta.type = "text";
    } else {
      inputResposta = document.createElement("select");
      let opcoes = [];
      if (tipoSelecionado === "Certo ou Errado") {
        opcoes = ["", "C", "E"];
      } else if (tipoSelecionado === "Acertivas A-E") {
        opcoes = ["", "A", "B", "C", "D", "E"];
      } else {
        opcoes = ["", "A", "B", "C", "D"];
      }

      opcoes.forEach((val) => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        inputResposta.appendChild(opt);
      });
    }
    
    inputResposta.name = `resposta_q${i}`;
    inputResposta.required = true;
    inputResposta.style.marginRight = "10px";

    // Campo de peso
    const pesoInput = document.createElement("input");
    pesoInput.type = "number";
    pesoInput.step = "0.1";
    pesoInput.min = "0";
    pesoInput.placeholder = "Peso";
    pesoInput.name = `peso_q${i}`;
    pesoInput.required = true;

    // Campo de comentário
    const comentarioInput = document.createElement("textarea");
    comentarioInput.placeholder = "Comentário sobre a questão";
    comentarioInput.name = `comentario_q${i}`;
    comentarioInput.rows = "3";
    comentarioInput.cols = "30";

    // Adiciona todos os campos ao wrapper
    wrapper.appendChild(label);
    wrapper.appendChild(disciplinaSelect);
    wrapper.appendChild(inputResposta);
    wrapper.appendChild(pesoInput);
    wrapper.appendChild(comentarioInput);

    gabaritoContainer.appendChild(wrapper);
  }
});


// Envia o formulário (atualizado)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    numero_simulado: parseInt(document.getElementById("numero_simulado").value),
    tipo_simulado: document.getElementById("tipo_simulado").value,
    prova: document.getElementById("prova").value,
    quantidade_questoes: quantidadeQuestoes
  };

  const questoes = [];
  for (let i = 1; i <= quantidadeQuestoes; i++) {
    const respostaInput = form.querySelector(`[name="resposta_q${i}"]`);
    const pesoInput = form.querySelector(`[name="peso_q${i}"]`);
    const comentarioInput = form.querySelector(`[name="comentario_q${i}"]`);
    const disciplinaInput = form.querySelector(`[name="disciplina_q${i}"]`);

    const resposta = respostaInput.value.trim();
    const peso = parseFloat(pesoInput.value);
    const comentario = comentarioInput.value.trim();
    const disciplina = disciplinaInput.value;

    if (!resposta || isNaN(peso) || !disciplina) {
      alert(`Preencha corretamente a questão ${i}`);
      return;
    }

    questoes.push({
      numero_questao: i,
      gabarito: resposta,
      peso,
      comentario,
      disciplina
    });
  }

  dados.questoes = questoes;

  try {
    const response = await fetch("http://localhost:3000/api/simulados/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      alert("Simulado cadastrado com sucesso!");
      form.reset();
      gabaritoContainer.innerHTML = "";
      gabaritoContainer.classList.remove("show");
    } else {
      const errorData = await response.json();
      alert("Erro: " + (errorData.error || "Erro desconhecido"));
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com a API.");
  }
});
