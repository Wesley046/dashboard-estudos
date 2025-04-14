document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const mensagemEl = document.getElementById("mensagemErro");
  
    try {
      const response = await fetch("https://dashboard-objetivo-policial.onrender.com/api/usuarios/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
      });
  
      const data = await response.json();
  
      if (data.error) {
        mensagemEl.textContent = `Erro: ${data.error}`;
        mensagemEl.style.color = "red";
      } else {
        mensagemEl.textContent = `✅ Usuário cadastrado com sucesso!`;
        mensagemEl.style.color = "green";
  
        // Limpar o formulário após sucesso
        document.getElementById("registerForm").reset();
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      mensagemEl.textContent = "Erro ao tentar se cadastrar. Tente novamente.";
      mensagemEl.style.color = "red";
    }
  });
  