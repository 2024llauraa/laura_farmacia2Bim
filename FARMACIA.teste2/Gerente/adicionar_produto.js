// JavaScript para adicionar produto
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

// Função para preview da imagem e upload
function setupImagePreview() {
  const fileInput = document.getElementById("imagem");
  const pathInput = document.getElementById("caminho-imagem");
  const previewContainer = document.getElementById("preview-container");
  const previewImage = document.getElementById("preview-image");

  fileInput.addEventListener("change", async function(e) {
    const file = e.target.files[0];
    if (file) {
      // Mostrar preview local
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewContainer.style.display = "block";
      };
      reader.readAsDataURL(file);

      // Fazer upload da imagem
      const formData = new FormData();
      formData.append('imagem', file);

      try {
        mostrarMensagem("Fazendo upload da imagem...", "info");
        
        const response = await fetch("/api/upload-imagem", {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          pathInput.value = data.nomeArquivo;
          mostrarMensagem("Imagem enviada com sucesso!");
        } else {
          mostrarMensagem(data.message, "error");
          fileInput.value = "";
          previewContainer.style.display = "none";
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        mostrarMensagem("Erro ao fazer upload da imagem", "error");
        fileInput.value = "";
        previewContainer.style.display = "none";
      }
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

// Função para adicionar produto
async function adicionarProduto(formData) {
  try {
    const response = await fetch("/api/produtos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensagem("Produto adicionado com sucesso!");
      setTimeout(() => {
        window.location.href = "./gerente_produto.html";
      }, 2000);
    } else {
      mostrarMensagem(data.message, "error");
    }
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    mostrarMensagem("Erro ao adicionar produto", "error");
  }
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

  setupImagePreview();

  // Event listeners
  document.getElementById("logout-button").addEventListener("click", logout);
  document.getElementById("home-icon").addEventListener("click", () => {
    window.location.href = "./gerente_produto.html";
  });
  document.getElementById("users-icon").addEventListener("click", () => {
    window.location.href = "./gerenciar_usuarios.html";
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

    await adicionarProduto(formData);
  });
};

