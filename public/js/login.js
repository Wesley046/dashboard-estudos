document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const mensagemErro = document.getElementById("mensagemErro");

        // Limpa mensagens de erro anteriores
        mensagemErro.textContent = "";

        // Validação básica dos campos
        if (!email || !senha) {
            mensagemErro.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        try {
            const resposta = await fetch("https://dashboard-objetivo-policial.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await resposta.json();

            if (resposta.ok) {
                // Armazena o usuário logado corretamente
                localStorage.setItem("usuario_id", data.usuario_id);
                localStorage.setItem("nome", data.nome);
                window.location.href = "/dashboard"; // Redireciona para o dashboard
            } else {
                // Exibe mensagem de erro retornada pelo servidor
                mensagemErro.textContent = data.error || "Erro ao fazer login!";
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            mensagemErro.textContent = "Erro no servidor. Tente novamente mais tarde.";
        }
    });
});
