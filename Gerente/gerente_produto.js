// JavaScript para a página do gerente - produtos
let produtos = [];
let produtoParaExcluir = null;

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
      window.location.href = "./../Tela/principal.html";
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

// Função para carregar produtos
async function carregarProdutos() {
  try {
    const response = await fetch("/api/produtos");
    const data = await response.json();
    produtos = data;
    renderizarProdutos(produtos);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    mostrarMensagem("Erro ao carregar produtos", "error");
  }
}

// Função para renderizar produtos na tela
function renderizarProdutos(produtosParaRenderizar) {
  const container = document.getElementById("produtos-container");
  container.innerHTML = "";

  produtosParaRenderizar.forEach(produto => {
    const div = document.createElement("div");
    div.className = "produto";
    div.onclick = () => editarProduto(produto.id);

    div.innerHTML = `
      <button class="botao-excluir" onclick="confirmarExclusao(event, ${produto.id})">×</button>
      <img src="./../Img/${produto.imagem}" alt="${produto.nome}" class="produto-imagem" onerror="this.src='./../Img/placeholder.png'"/>
      <span class="nome-produto">${produto.nome}</span>
      <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
      <span class="categoria">${produto.categoria}</span>
    `;

    container.appendChild(div);
  });
}

// Função para pesquisar produtos
function pesquisarProdutos() {
  const termo = document.getElementById("search-input").value.toLowerCase();
  
  if (termo === "") {
    renderizarProdutos(produtos);
    ocultarMensagemProdutoNaoEncontrado();
    return;
  }

  const produtosFiltrados = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(termo) ||
    produto.categoria.toLowerCase().includes(termo) ||
    produto.descricao.toLowerCase().includes(termo)
  );

  if (produtosFiltrados.length === 0) {
    mostrarMensagemProdutoNaoEncontrado();
  } else {
    ocultarMensagemProdutoNaoEncontrado();
  }

  renderizarProdutos(produtosFiltrados);
}

// Função para mostrar mensagem de produto não encontrado
function mostrarMensagemProdutoNaoEncontrado() {
  const container = document.getElementById("produtos-container");
  container.innerHTML = `
    <div class="produto-nao-encontrado">
      <h3>Não existe este produto no sistema.</h3>
      <p>Gostaria de adicionar?</p>
      <button class="btn-adicionar-produto" onclick="adicionarProduto()">Adicionar Produto</button>
    </div>
  `;
}

// Função para ocultar mensagem de produto não encontrado
function ocultarMensagemProdutoNaoEncontrado() {
  // Esta função é chamada quando há produtos para mostrar
  // A renderização normal dos produtos já substitui o conteúdo
}

// Função para confirmar exclusão
function confirmarExclusao(event, produtoId) {
  event.stopPropagation();
  produtoParaExcluir = produtoId;
  document.getElementById("delete-modal").style.display = "block";
}

// Função para excluir produto
async function excluirProduto() {
  if (!produtoParaExcluir) return;

  try {
    const response = await fetch(`/api/produtos/${produtoParaExcluir}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensagem("Produto excluído com sucesso!");
      carregarProdutos(); // Recarregar lista
    } else {
      mostrarMensagem(data.message, "error");
    }
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    mostrarMensagem("Erro ao excluir produto", "error");
  }

  document.getElementById("delete-modal").style.display = "none";
  produtoParaExcluir = null;
}

// Função para editar produto
function editarProduto(produtoId) {
  window.location.href = `./../Gerente/editar_produto.html?id=${produtoId}`;
}

// Função para adicionar produto
function adicionarProduto() {
  window.location.href = "./../Gerente/adicionar_produto.html";
}

// Função para ir para gerenciamento de usuários
function gerenciarUsuarios() {
  window.location.href = "./../Gerente/gerenciar_usuarios.html";
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

  await carregarProdutos();

  // Event listeners
  document.getElementById("search-input").addEventListener("input", pesquisarProdutos);
  document.getElementById("search-button").addEventListener("click", pesquisarProdutos);
  document.getElementById("add-product-button").addEventListener("click", adicionarProduto);
  document.getElementById("logout-button").addEventListener("click", logout);
  document.getElementById("users-icon").addEventListener("click", gerenciarUsuarios);
  document.getElementById("home-icon").addEventListener("click", () => {
    window.location.href = "./../Gerente/gerente_produto.html";
  });
  
  // Adicionar event listener para o botão de visão do cliente
  document.getElementById("client-view-icon").addEventListener("click", () => {
    window.location.href = "./../Tela/index.html";
  });

  // Modal event listeners
  document.getElementById("confirm-delete").addEventListener("click", excluirProduto);
  document.getElementById("cancel-delete").addEventListener("click", () => {
    document.getElementById("delete-modal").style.display = "none";
    produtoParaExcluir = null;
  });

  // Fechar modal clicando fora
  document.getElementById("delete-modal").addEventListener("click", (e) => {
    if (e.target.id === "delete-modal") {
      document.getElementById("delete-modal").style.display = "none";
      produtoParaExcluir = null;
    }
  });
};

