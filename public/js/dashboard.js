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
            
            disciplinas.forEach(item => {
                const option = document.createElement("option");
                option.value = item.disciplina;
                option.textContent = item.disciplina;
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
            const response = await fetch(`https://dashboard-objetivo-policial.onrender.com/api/disciplinas/assuntos/${encodeURIComponent(disciplina)}`);
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
        const disciplina = disciplinaSelect.value.trim();
        const assunto = assuntoSelect.value.trim();
        const horasEstudadas = document.getElementById("horas").value;
        
        if (!horasEstudadas) {
            alert("❌ O campo Horas Estudadas é obrigatório!");
            return;
        }

        let dataEstudo = document.getElementById("data_estudo").value;
        if (!dataEstudo) {
            dataEstudo = new Date().toISOString().split("T")[0]; // Define a data atual no formato YYYY-MM-DD
            document.getElementById("data_estudo").value = dataEstudo;
        }

        const questoesErradas = document.getElementById("questoes_erradas").value.trim();
        const questoesCertas = document.getElementById("questoes_certas").value.trim();
        const tipoEstudo = document.getElementById("tipo_estudo").value;

        // Debug: Exibir os valores antes da validação
        console.log("📋 Valores antes da validação:", {
            usuario_id: usuarioId,
            disciplina,
            assunto,
            horasEstudadas,
            dataEstudo,
            questoesErradas,
            questoesCertas,
            tipoEstudo
        });

        if (!usuarioId || !disciplina || !assunto || !horasEstudadas || !dataEstudo || !questoesErradas || !questoesCertas || !tipoEstudo) {
            console.error("❌ ERRO: Algum campo está vazio!");
            alert("❌ Todos os campos são obrigatórios!");
            return;
        }

        const formData = {
            usuario_id: usuarioId,
            disciplina,
            assunto,
            horas_estudadas: horasEstudadas,
            data_estudo: dataEstudo,
            questoes_erradas: questoesErradas,
            questoes_certas: questoesCertas,
            tipo_estudo: tipoEstudo,
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

// Lógica para o menu lateral
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.querySelector(".toggle-btn");

    // Expandir e recolher menu ao clicar no botão
    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("expanded");
    });
});
