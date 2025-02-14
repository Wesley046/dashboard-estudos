document.addEventListener("DOMContentLoaded", async () => {
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
            // Processamento e criação do gráfico...
            document.getElementById("totalDias").textContent = dados.totalDias;
        } catch (error) {
            console.error("❌ Erro ao carregar dados para os gráficos:", error);
        }
    }

    carregarDadosGraficos();

    // Lógica do menu lateral e formulário...
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector("#toggleSidebar");

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
    });

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
                option.value = assunto.assunto;
                option.textContent = assunto.assunto;
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

    // Event listener para o envio do formulário
    document.getElementById("studyForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Formulário enviado!");

        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
            console.error("❌ Usuário não autenticado.");
            return;
        }

        const formData = {
            usuario_id: usuarioId,
            disciplina: document.getElementById("disciplina").value,
            assunto: document.getElementById("assunto").value,
            horas_estudadas: document.getElementById("horas").value,
            data_estudo: new Date().toISOString().split("T")[0],
            questoes_erradas: document.getElementById("questoes_erradas").value || 0,
            questoes_certas: document.getElementById("questoes_certas").value || 0,
            tipo_estudo: document.getElementById("tipo_estudo").value
        };

        try {
            const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/estudos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error("Erro ao enviar os dados!");
            document.getElementById("studyForm").reset();
            formPopup.style.display = "none";
            carregarDadosGraficos();
        } catch (error) {
            console.error("❌ Erro ao enviar os dados:", error);
        }
    });
});
