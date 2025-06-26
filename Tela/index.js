// Função para carregar produtos da API
async function carregarProdutos() {
  try {
    const response = await fetch("/api/produtos");
    const produtos = await response.json();
    return produtos;
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    // Fallback para produtos estáticos em caso de erro
    return [
      { id: 1, nome: "Paracetamol 750mg", preco: 12.99, imagem: "paracetamol.png" },
      { id: 2, nome: "Dipirona 500g", preco: 10.50, imagem: "dipirona.png" },
      { id: 3, nome: "Ibuprofeno 400mg", preco: 18.00, imagem: "ibuprofeno.png" },
      { id: 4, nome: "Aspirina 500mg", preco: 15.20, imagem: "aspirina.png" },
      { id: 5, nome: "Amoxicilina 500mg", preco: 25.00, imagem: "amoxicilina.png" },
      { id: 6, nome: "Azitromicina", preco: 22.00, imagem: "azitromicina.png" },
      { id: 7, nome: "Loratadina", preco: 9.90, imagem: "loratadina.png" },
      { id: 8, nome: "Omeprazol", preco: 11.50, imagem: "omeprazol.png" },
      { id: 9, nome: "Enalapril", preco: 8.99, imagem: "enalapril.png" },
      { id: 10, nome: "Losartana", preco: 13.49, imagem: "losartana.png" },
      { id: 11, nome: "Sinvastatina", preco: 16.99, imagem: "sinvastatina.png" },
      { id: 12, nome: "Clonazepam", preco: 19.99, imagem: "clonazepam.png" }
    ];
  }
}

// Função para renderizar produtos na tela
async function renderizarProdutos() {
  const container = document.querySelector(".produtos-container");
  container.innerHTML = "";

  const produtos = await carregarProdutos();

  produtos.forEach((produto) => {
    const div = document.createElement("div");
    div.className = "produto";
    div.onclick = () => irParaDetalhe(produto.id);

    div.innerHTML = `
      <span class="preco">R$ ${produto.preco.toFixed(2)}</span>
      <img src="./../Img/${produto.imagem}" alt="${produto.nome}" class="produto-imagem"/>
      <span class="nome-produto">${produto.nome}</span>
      <div class="botao-adicionar" onclick="adicionarAoCarrinho(event, ${produto.id})">
        <span>+</span>
      </div>
    `;

    container.appendChild(div);
  });
}
  
  // Simula um carrinho salvo no localStorage
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  
  // Função para ler cookies
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  // Função para verificar o status de login e atualizar a UI
  async function checkLoginStatus() {
    const loginButton = document.getElementById("login-button");
    const usernameDisplay = document.getElementById("username-display");
    const logoutButton = document.getElementById("logout-button");
    const managerViewIcon = document.getElementById("manager-view-icon");

    const userCookie = getCookie("usuario");

    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie));
        usernameDisplay.textContent = `Olá, ${user.nome}!`;
        usernameDisplay.style.display = "inline";
        loginButton.style.display = "none";
        logoutButton.style.display = "inline";
        
        // Mostrar botão de voltar para gerente apenas se o usuário for gerente
        if (user.role === "gerente") {
          managerViewIcon.style.display = "inline";
        } else {
          managerViewIcon.style.display = "none";
        }
      } catch (e) {
        console.error("Erro ao parsear cookie de usuário:", e);
        // Se o cookie estiver corrompido, tratar como não logado
        loginButton.style.display = "inline";
        usernameDisplay.style.display = "none";
        logoutButton.style.display = "none";
        managerViewIcon.style.display = "none";
      }
    } else {
      loginButton.style.display = "inline";
      usernameDisplay.style.display = "none";
      logoutButton.style.display = "none";
      managerViewIcon.style.display = "none";
    }
  }

  // Função de logout
  async function logout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = "./../Tela/index.html"; // Redirecionar para a página de login
      } else {
        console.error("Erro ao fazer logout:", data.message);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor para logout:", error);
    }
  }

  // Preenche os produtos automaticamente e verifica o status de login
  window.onload = async () => {
    await renderizarProdutos();
  
    // Clique na casinha
    document.getElementById("home-icon").onclick = () => {
      window.location.href = "./../Tela/index.html";
    };
  
    // Clique no carrinho
    document.getElementById("cart-icon").onclick = () => {
      window.location.href = "./../Carrinho/carrinho.html";
    };

    // Clique no botão de voltar para gerente
    const managerViewIcon = document.getElementById("manager-view-icon");
    if (managerViewIcon) {
      managerViewIcon.onclick = () => {
        window.location.href = "./../Gerente/gerente_produto.html";
      };
    }

    // Adicionar evento de clique para o botão de logout
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", logout);
    }

    checkLoginStatus(); // Verifica o status de login ao carregar a página
  };
  
  // Adiciona ao carrinho
  async function adicionarAoCarrinho(event, produtoId) {
    event.stopPropagation(); // impedir que vá pra tela de detalhe
  
    try {
      const produtos = await carregarProdutos();
      const produto = produtos.find(p => p.id === produtoId);
      
      if (produto) {
        carrinho.push(produto);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        mostrarMensagem("Adicionado ao carrinho com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      mostrarMensagem("Erro ao adicionar produto ao carrinho");
    }
  }
  
  // Ir para a segunda página com o ID do produto
  function irParaDetalhe(produtoId) {
    localStorage.setItem("produtoDetalhe", produtoId);
    window.location.href = "./../Detalhe/detalhe.html";
  }
  
  // Exibe mensagem temporária
  function mostrarMensagem(texto) {
    const msg = document.getElementById("mensagem-popup");
    const textoMsg = document.getElementById("mensagem-texto");
    textoMsg.innerText = texto;
    msg.style.display = "block";
  }
  
  // Fecha popup
  function fecharMensagem() {
    document.getElementById("mensagem-popup").style.display = "none";
  }
  
