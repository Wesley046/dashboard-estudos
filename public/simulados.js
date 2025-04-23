const form = document.getElementById("simulado-form");
const gerarBtn = document.getElementById("gerar-gabarito");
const gabaritoContainer = document.getElementById("gabarito-container");

let tipoSelecionado = "";
let quantidadeQuestoes = 0;

// Gera os inputs do gabarito
gerarBtn.addEventListener("click", () => {
  gabaritoContainer.innerHTML = ""; // Limpa gabarito anterior
  tipoSelecionado = document.getElementById("tipo_simulado").value;
  quantidadeQuestoes = parseInt(document.getElementById("quantidade_questoes").value);

  if (!tipoSelecionado || isNaN(quantidadeQuestoes)) return;

  // Exibir o container de gabarito
  gabaritoContainer.classList.add("show");

  for (let i = 1; i <= quantidadeQuestoes; i++) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("simulado-gabarito-item");

    const label = document.createElement("label");
    label.textContent = `Q${i}: `;
    label.style.marginRight = "10px";

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

    wrapper.appendChild(label);
    wrapper.appendChild(inputResposta);
    wrapper.appendChild(pesoInput);

    gabaritoContainer.appendChild(wrapper);
  }
});

// Envia o formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    numero_simulado: parseInt(document.getElementById("numero_simulado").value),
    tipo_simulado: document.getElementById("tipo_simulado").value,
    prova: document.getElementById("prova").value,
  };

  // Monta o gabarito como array de objetos { numero, resposta, peso }
  const gabarito = [];
  for (let i = 1; i <= quantidadeQuestoes; i++) {
    const respostaInput = form.querySelector(`[name="resposta_q${i}"]`);
    const pesoInput = form.querySelector(`[name="peso_q${i}"]`);

    const resposta = respostaInput.value.trim();
    const peso = parseFloat(pesoInput.value);

    if (!resposta || isNaN(peso)) {
      alert(`Preencha corretamente a questão ${i}`);
      return;
    }

    gabarito.push({
      numero: i,
      resposta,
      peso
    });
  }

  dados.gabarito = gabarito;

  try {
    const response = await fetch("http://localhost:3000/api/simulados/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const resultText = await response.text();
    console.log("Resposta bruta da API:", resultText);

    const parsedResult = JSON.parse(resultText);

    if (response.ok) {
      alert("Simulado cadastrado com sucesso!");
      form.reset();
      gabaritoContainer.innerHTML = ""; // Limpa o gabarito após o envio
      gabaritoContainer.classList.remove("show"); // Esconde o container novamente
    } else {
      alert("Erro: " + parsedResult.error);
    }
  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com a API.");
  }
});
