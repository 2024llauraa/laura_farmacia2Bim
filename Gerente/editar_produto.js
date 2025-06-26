// JavaScript para editar produto
let produtoId = null;

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

// Função para obter ID do produto da URL
function getProdutoIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Função para carregar dados do produto
async function carregarProduto() {
  produtoId = getProdutoIdFromURL();
  
  if (!produtoId) {
    mostrarMensagem("ID do produto não encontrado", "error");
    setTimeout(() => {
      window.location.href = "./gerente_produto.html";
    }, 2000);
    return;
  }

  try {
    const response = await fetch(`/api/produtos/${produtoId}`);
    const data = await response.json();

    if (data.success) {
      const produto = data.produto;
      
      // Preencher formulário
      document.getElementById("nome").value = produto.nome;
      document.getElementById("preco").value = produto.preco;
      document.getElementById("categoria").value = produto.categoria;
      document.getElementById("quantidade").value = produto.quantidade;
      document.getElementById("descricao").value = produto.descricao || "";
      document.getElementById("caminho-imagem").value = produto.imagem;
      
      // Mostrar preview da imagem
      const previewImage = document.getElementById("preview-image");
      const previewContainer = document.getElementById("preview-container");
      previewImage.src = `./../Img/${produto.imagem}`;
      previewContainer.style.display = "block";
      
      previewImage.onerror = function() {
        this.src = "./../Img/placeholder.png";
      };
    } else {
      mostrarMensagem(data.message, "error");
      setTimeout(() => {
        window.location.href = "./gerente_produto.html";
      }, 2000);
    }
  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    mostrarMensagem("Erro ao carregar produto", "error");
  }
}

// Função para preview da imagem
function setupImagePreview() {
  const fileInput = document.getElementById("imagem");
  const pathInput = document.getElementById("caminho-imagem");
  const previewContainer = document.getElementById("preview-container");
  const previewImage = document.getElementById("preview-image");

  fileInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewContainer.style.display = "block";
      };
      reader.readAsDataURL(file);
      pathInput.value = file.name;
    }
  });

  pathInput.addEventListener("input", function(e) {
    const imagePath = e.target.value;
    if (imagePath) {
      previewImage.src = `./../Img/${imagePath}`;
      previewContainer.style.display = "block";
      
      // Verificar se a imagem existe
      previewImage.onerror = function() {
        previewImage.src = "./../Img/placeholder.png";
      };
    } else {
      previewContainer.style.display = "none";
    }
  });
}

// Função para salvar alterações
async function salvarProduto(formData) {
  try {
    const response = await fetch(`/api/produtos/${produtoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensagem("Produto alterado com sucesso!");
      setTimeout(() => {
        window.location.href = "./gerente_produto.html";
      }, 2000);
    } else {
      mostrarMensagem(data.message, "error");
    }
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    mostrarMensagem("Erro ao salvar produto", "error");
  }
}

// Função para confirmar exclusão
function confirmarExclusao() {
  document.getElementById("delete-modal").style.display = "block";
}

// Função para excluir produto
async function excluirProduto() {
  try {
    const response = await fetch(`/api/produtos/${produtoId}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensagem("Produto excluído com sucesso!");
      setTimeout(() => {
        window.location.href = "./gerente_produto.html";
      }, 2000);
    } else {
      mostrarMensagem(data.message, "error");
    }
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    mostrarMensagem("Erro ao excluir produto", "error");
  }

  document.getElementById("delete-modal").style.display = "none";
}

// Função para voltar para a lista
function voltarParaLista() {
  window.location.href = "./gerente_produto.html";
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

  await carregarProduto();
  setupImagePreview();

  // Event listeners
  document.getElementById("logout-button").addEventListener("click", logout);
  document.getElementById("home-icon").addEventListener("click", () => {
    window.location.href = "./gerente_produto.html";
  });
  document.getElementById("users-icon").addEventListener("click", () => {
    window.location.href = "./gerenciar_usuarios.html";
  });

  // Modal event listeners
  document.getElementById("confirm-delete").addEventListener("click", excluirProduto);
  document.getElementById("cancel-delete").addEventListener("click", () => {
    document.getElementById("delete-modal").style.display = "none";
  });

  // Fechar modal clicando fora
  document.getElementById("delete-modal").addEventListener("click", (e) => {
    if (e.target.id === "delete-modal") {
      document.getElementById("delete-modal").style.display = "none";
    }
  });

  // Form submit
  document.getElementById("produto-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = {
      nome: document.getElementById("nome").value,
      preco: parseFloat(document.getElementById("preco").value),
      categoria: document.getElementById("categoria").value,
      quantidade: parseInt(document.getElementById("quantidade").value),
      descricao: document.getElementById("descricao").value,
      imagem: document.getElementById("caminho-imagem").value || "placeholder.png"
    };

    await salvarProduto(formData);
  });
};

