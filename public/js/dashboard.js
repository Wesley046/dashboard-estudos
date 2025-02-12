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
            
            disciplinas.forEach(disciplina => {
                const option = document.createElement("option");
                option.value = disciplina.disciplina;
                option.textContent = disciplina.disciplina;
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
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/assuntos/${encodeURIComponent(disciplina)}`);
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
        if (!usuarioId) {
            alert("Erro: Usuário não autenticado. Faça login novamente.");
            return;
        }

        const formData = {
            usuario_id: usuarioId,
            disciplina: disciplinaSelect.value,
            assunto: assuntoSelect.value,
            horas_estudadas: document.getElementById("horas").value,
            data_estudo: document.getElementById("data_estudo").value,
            questoes_erradas: document.getElementById("questoes_erradas").value,
            questoes_certas: document.getElementById("questoes_certas").value,
            tipo_estudo: document.getElementById("tipo_estudo").value,
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
            } else {
                alert("❌ Erro ao registrar estudo: " + result.error);
            }
        } catch (error) {
            console.error("❌ Erro ao enviar os dados:", error);
            alert("Erro ao conectar com o servidor.");
        }
    });
});