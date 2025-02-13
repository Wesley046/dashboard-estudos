document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();
        const mensagemErro = document.getElementById("mensagemErro");

        mensagemErro.textContent = "";

        if (!email || !senha) {
            mensagemErro.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        console.log("📤 Enviando dados para login:", { email, senha });

        try {
            const resposta = await fetch("https://dashboard-objetivo-policial.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            });

            console.log("📥 Resposta da API:", resposta);

            const data = await resposta.json();
            console.log("📥 Dados recebidos:", data);

            if (resposta.ok) {
                localStorage.setItem("usuario_id", data.usuario_id);
                localStorage.setItem("nome", data.nome);
                window.location.href = "/dashboard";
            } else {
                mensagemErro.textContent = data.error || "Erro ao fazer login!";
            }
        } catch (erro) {
            console.error("❌ Erro na requisição:", erro);
            mensagemErro.textContent = "Erro no servidor. Tente novamente mais tarde.";
        }
    });
});
