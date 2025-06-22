// JavaScript para gerenciamento de usuários
let usuarios = [];
let usuarioParaExcluir = null;

// Função para ler cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Função para verificar autenticação e papel do usuário
async function checkAuth() {
  const userCookie = getCookie("usuario");
  
  if (!userCookie) {
    window.location.href = "./../Login/login.html";
    return false;
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    
    if (user.role !== "gerente") {
      window.location.href = "./../Tela/index.html";
      return false;
    }

    document.getElementById("username-display").textContent = `Olá, ${user.nome}!`;
    return true;
  } catch (e) {
    console.error("Erro ao parsear cookie de usuário:", e);
    window.location.href = "./../Login/login.html";
    return false;
  }
}

// Função para carregar usuários
async function carregarUsuarios() {
  try {
    const response = await fetch("/api/usuarios");
    const data = await response.json();
    
    if (data.success) {
      usuarios = data.usuarios;
      renderizarUsuarios();
    } else {
      mostrarMensagem(data.message, "error");
    }
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    mostrarMensagem("Erro ao carregar usuários", "error");
  }
}

// Função para renderizar usuários na tabela
function renderizarUsuarios() {
  const tbody = document.getElementById("usuarios-tbody");
  tbody.innerHTML = "";

  if (usuarios.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          <h3>Nenhum usuário encontrado</h3>
          <p>Não há usuários cadastrados no sistema.</p>
        </td>
      </tr>
    `;
    return;
  }

  usuarios.forEach(usuario => {
    const tr = document.createElement("tr");
    
    tr.innerHTML = `
      <td>${usuario.nome}</td>
      <td>${usuario.email}</td>
      <td>
        <select class="role-select ${usuario.role}" onchange="alterarRole(${usuario.id}, this.value)">
          <option value="cliente" ${usuario.role === 'cliente' ? 'selected' : ''}>Cliente</option>
          <option value="gerente" ${usuario.role === 'gerente' ? 'selected' : ''}>Gerente</option>
        </select>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-excluir" onclick="confirmarExclusao(${usuario.id})">Excluir</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Função para alterar role do usuário
async function alterarRole(usuarioId, novaRole) {
  try {
    const response = await fetch(`/api/usuarios/${usuarioId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: novaRole })
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensagem("Função do usuário alterada com sucesso!");
      
      // Atualizar localmente
      const usuario = usuarios.find(u => u.id === usuarioId);
      if (usuario) {
        usuario.role = novaRole;
      }
      
      // Re-renderizar para atualizar as classes CSS
      renderizarUsuarios();
    } else {
      mostrarMensagem(data.message, "error");
      // Recarregar para reverter a mudança visual
      carregarUsuarios();
    }
  } catch (error) {
    console.error("Erro ao alterar função do usuário:", error);
    mostrarMensagem("Erro ao alterar função do usuário", "error");
    carregarUsuarios();
  }
}

// Função para adicionar usuário
async function adicionarUsuario() {
  const form = document.getElementById("add-user-form");
  const formData = new FormData(form);
  
  const userData = {
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    confirmar: formData.get("confirmar"),
    role: formData.get("role")
  };

  // Validações básicas
  if (!userData.nome || !userData.email || !userData.senha || !userData.confirmar) {
    mostrarMensagem("Todos os campos são obrigatórios", "error");
    return;
  }

  if (userData.senha !== userData.confirmar) {
    mostrarMensagem("As senhas não coincidem", "error");
    return;
  }

  if (userData.senha.length < 6) {
    mostrarMensagem("A senha deve ter pelo menos 6 caracteres", "error");
    return;
  }

  try {
    const response = await fetch("/api/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensagem("Usuário adicionado com sucesso!");
      document.getElementById("add-user-modal").style.display = "none";
      form.reset();
      carregarUsuarios(); // Recarregar lista
    } else {
      mostrarMensagem(data.message, "error");
    }
  } catch (error) {
    console.error("Erro ao adicionar usuário:", error);
    mostrarMensagem("Erro ao adicionar usuário", "error");
  }
}

// Função para abrir modal de adicionar usuário
function abrirModalAdicionarUsuario() {
  document.getElementById("add-user-modal").style.display = "block";
}

// Função para fechar modal de adicionar usuário
function fecharModalAdicionarUsuario() {
  document.getElementById("add-user-modal").style.display = "none";
  document.getElementById("add-user-form").reset();
}

// Função para confirmar exclusão
function confirmarExclusao(usuarioId) {
  usuarioParaExcluir = usuarioId;
  document.getElementById("delete-modal").style.display = "block";
}

// Função para excluir usuário
async function excluirUsuario() {
  if (!usuarioParaExcluir) return;

  try {
    const response = await fetch(`/api/usuarios/${usuarioParaExcluir}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensagem("Usuário excluído com sucesso!");
      carregarUsuarios(); // Recarregar lista
    } else {
      mostrarMensagem(data.message, "error");
    }
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    mostrarMensagem("Erro ao excluir usuário", "error");
  }

  document.getElementById("delete-modal").style.display = "none";
  usuarioParaExcluir = null;
}

// Função de logout
async function logout() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST"
    });
    const data = await response.json();
    if (data.success) {
      window.location.href = "./../Tela/index.html";
    } else {
      console.error("Erro ao fazer logout:", data.message);
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor para logout:", error);
  }
}

// Função para mostrar mensagem
function mostrarMensagem(texto, tipo = "success") {
  const msg = document.getElementById("mensagem-popup");
  const textoMsg = document.getElementById("mensagem-texto");
  
  textoMsg.textContent = texto;
  msg.className = `mensagem-popup ${tipo}`;
  msg.style.display = "block";

  // Auto-fechar após 3 segundos
  setTimeout(() => {
    msg.style.display = "none";
  }, 3000);
}

// Função para fechar mensagem
function fecharMensagem() {
  document.getElementById("mensagem-popup").style.display = "none";
}

// Inicialização da página
window.onload = async () => {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return;

  await carregarUsuarios();

  // Event listeners
  document.getElementById("logout-button").addEventListener("click", logout);
  document.getElementById("home-icon").addEventListener("click", () => {
    window.location.href = "./gerente_produto.html";
  });
  
  // Adicionar event listener para o botão de visão do cliente
  document.getElementById("client-view-icon").addEventListener("click", () => {
    window.location.href = "./../Tela/index.html";
  });

  // Event listener para o botão de adicionar usuário
  document.getElementById("add-user-button").addEventListener("click", abrirModalAdicionarUsuario);
  
  // Event listener para o formulário de adicionar usuário
  document.getElementById("add-user-form").addEventListener("submit", (e) => {
    e.preventDefault();
    adicionarUsuario();
  });
  
  // Event listener para cancelar adição de usuário
  document.getElementById("cancel-add-user").addEventListener("click", fecharModalAdicionarUsuario);

  // Modal event listeners
  document.getElementById("confirm-delete").addEventListener("click", excluirUsuario);
  document.getElementById("cancel-delete").addEventListener("click", () => {
    document.getElementById("delete-modal").style.display = "none";
    usuarioParaExcluir = null;
  });

  // Fechar modal clicando fora
  document.getElementById("delete-modal").addEventListener("click", (e) => {
    if (e.target.id === "delete-modal") {
      document.getElementById("delete-modal").style.display = "none";
      usuarioParaExcluir = null;
    }
  });

  // Fechar modal de adicionar usuário clicando fora
  document.getElementById("add-user-modal").addEventListener("click", (e) => {
    if (e.target.id === "add-user-modal") {
      fecharModalAdicionarUsuario();
    }
  });
};

