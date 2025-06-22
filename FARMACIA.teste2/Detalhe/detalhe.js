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
      { id: 1, nome: "Paracetamol 500mg", preco: 12.99, imagem: "paracetamol.png" },
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

// recupera o carrinho salvo (se existir); se não, cria um carrinho vazio para começar
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Função para carregar e exibir detalhes do produto
async function carregarDetalheProduto() {
  const produtoId = parseInt(localStorage.getItem("produtoDetalhe"));
  const produtos = await carregarProdutos();
  const produto = produtos.find(p => p.id === produtoId);
  
  if (produto) {
    // Preenche a tela com o produto
    document.getElementById("detalhe-imagem").src = `./../Img/${produto.imagem}`;
    document.getElementById("detalhe-nome").innerText = produto.nome;
    document.getElementById("detalhe-preco").innerText = `R$ ${produto.preco.toFixed(2)}`;
    
    // Clique em adicionar
    document.getElementById("btn-adicionar").onclick = () => {
      carrinho.push(produto);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));

      mostrarMensagem("Adicionado ao carrinho com sucesso!");
    };
  } else {
    // Produto não encontrado, redirecionar para página principal
    window.location.href = "./../Tela/index.html";
  }
}

// Inicializar página
window.onload = () => {
  carregarDetalheProduto();
};
  
  // Navegação
  document.getElementById("home-icon").onclick = () => {
    window.location.href = "./../Tela/index.html";
  };
  
  document.getElementById("cart-icon").onclick = () => {
    window.location.href = "./../Carrinho/carrinho.html";
  };
  
  // Mensagem
  function mostrarMensagem(texto) {
    const msg = document.getElementById("mensagem-popup");
    const textoMsg = document.getElementById("mensagem-texto");
    textoMsg.innerText = texto;
    msg.style.display = "block";
  }
  
  function fecharMensagem() {
    document.getElementById("mensagem-popup").style.display = "none";
  }
  