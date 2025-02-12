document.addEventListener("DOMContentLoaded", async () => {
    const disciplinaSelect = document.getElementById("disciplina");
    const assuntoSelect = document.getElementById("assunto");
    const openFormButton = document.getElementById("openForm");
    const closeFormButton = document.getElementById("closeForm");
    const formPopup = document.getElementById("formPopup");

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
            const response = await fetch('/api/disciplinas');
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
            const response = await fetch(`/api/assuntos/${encodeURIComponent(disciplina)}`);
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
});
