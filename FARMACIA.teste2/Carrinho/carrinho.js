let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para exibir o carrinho
window.onload = () => {
  renderizarCarrinho();
  document.getElementById("home-icon").onclick = () => window.location.href = "./../Tela/index.html";
  document.getElementById("btn-finalizar").onclick = finalizarCompra;
};

// Renderiza os itens do carrinho
function renderizarCarrinho() {
  const container = document.getElementById("lista-carrinho");
  container.innerHTML = "";

  carrinho.forEach((produto, index) => {
    const item = document.createElement("div");
    item.className = "item-carrinho";
     // Corrigir o caminho da imagem para garantir que todas sejam exibidas
    const imagemSrc = produto.imagem.startsWith('./../Img/') ? produto.imagem : `./../Img/${produto.imagem}`;
    
    item.innerHTML = `
      <img src="${imagemSrc}" class="item-img" onerror="this.
      src='./../Img/placeholder.png'" alt="${produto.nome}" />
      <div class="item-info">
        <span class="item-nome">${produto.nome}</span>
        <span class="item-preco">R$ ${produto.preco.toFixed(2)}</span>
      </div>
      <button class="remover-item" onclick="confirmarRemocao(${index})">X</button>
    `;
    container.appendChild(item);
  });

  atualizarTotais();
}

// Confirmação de remoção
function confirmarRemocao(index) {
  const confirmacao = confirm("Certeza que gostaria de retirar este produto do carrinho?");
  if (confirmacao) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert("Ok! Seu produto foi retirado com sucesso!");
    renderizarCarrinho();
  } else {
    alert("Ok! Seu produto ainda está no carrinho");
  }
}

// Atualiza totais
function atualizarTotais() {
  const subtotal = carrinho.reduce((soma, item) => soma + item.preco, 0);
  const frete = 3.00;
  const totalComFrete = subtotal + frete;

  document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
  document.getElementById("total").innerText = `Total com frete: R$ ${totalComFrete.toFixed(2)}`;
}

// Função para ler cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Finalização
function finalizarCompra() {
  // Verificar se o usuário está logado
  const userCookie = getCookie("usuario");
  
  if (!userCookie) {
    // Usuário não está logado - mostrar mensagem
    mostrarMensagemLogin();
    return;
  }

  // Exibe a seção de formas de pagamento
  document.getElementById("formas-pagamento").style.display = "block";

  // Oculta formulários específicos
  document.getElementById("dinheiro-form").style.display = "none";
  document.getElementById("cartao-form").style.display = "none";
  document.getElementById("qrcode-area").style.display = "none";
}

// Função para mostrar mensagem de login obrigatório
function mostrarMensagemLogin() {
  const mensagemDiv = document.createElement('div');
  mensagemDiv.className = 'mensagem-login-popup';
  mensagemDiv.innerHTML = `
    <div class="mensagem-login-content">
      <h3>Você ainda não está logado em nosso site!</h3>
      <p>É super fácil e rápido!</p>
      <div class="botoes-login">
        <button onclick="irParaLogin()" class="btn-login">Login</button>
        <button onclick="fecharMensagemLogin()" class="btn-cancelar-login">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(mensagemDiv);
}

// Função para ir para a página de login
function irParaLogin() {
  window.location.href = "./../Login/login.html";
}

// Função para fechar a mensagem de login
function fecharMensagemLogin() {
  const mensagem = document.querySelector('.mensagem-login-popup');
  if (mensagem) {
    mensagem.remove();
  }
}

// Função de validação da forma de pagamento
function validarFormaPagamento() {
  const formaPagamentoSelecionada = document.querySelector('input[name="pagamento"]:checked');
  const erroPagamento = document.getElementById("erroPagamento");

  if (!formaPagamentoSelecionada) {
    erroPagamento.style.display = "block";  // Exibe a mensagem de erro
    return false;
  }

  erroPagamento.style.display = "none";  // Esconde a mensagem de erro caso uma forma de pagamento tenha sido selecionada
  return true;
}

// Dinheiro
function selecionarDinheiro() {
  esconderFormas();
  document.getElementById("dinheiro-form").style.display = "block";
}

function perguntaTroco(resposta) {
  const div = document.getElementById("resposta-troco");
  div.innerHTML = "";
  if (resposta === 'sim') {
    div.innerHTML = `
      <br>
      <label>Troco para quanto?</label>
      <input type="number" id="valor-troco" />
      <button onclick="confirmarTroco()">Pronto</button>
      <button onclick="cancelarTroco()">Cancelar</button>
    `;
  } else {
    alert("Ok! Agora só finalizar sua compra");
    alert("Pronto, sua compra foi finalizada com sucesso!");
    carrinho = []; //limpa o carrinho e volta para pagina inicial
    localStorage.setItem('carrinho', JSON.stringify([]));
    window.location.href = "./../Tela/principal.html";
  }
}

function confirmarTroco() {
  const valorTroco = parseFloat(document.getElementById("valor-troco").value);
  const totalComFrete = carrinho.reduce((soma, item) => soma + item.preco, 0) + 3.00;

  if (isNaN(valorTroco)) {
    alert("Digite um valor válido!");
    return;
  }

  if (valorTroco >= totalComFrete) {
    const troco = valorTroco - totalComFrete;
    alert(`Ok! O entregador levará seu troco de R$ ${troco.toFixed(2)}`);
    alert("Pronto, sua compra foi finalizada com sucesso!");
    carrinho = []; //limpa o carrinho e volta para pagina inicial
    localStorage.setItem('carrinho', JSON.stringify([]));
    window.location.href = "./../Tela/index.html";
  } else {
    alert("Essa quantidade de dinheiro não paga sua compra!");
  }
}

function cancelarTroco() {
  document.getElementById("resposta-troco").innerHTML = "";
  document.getElementById("formas-pagamento").style.display = "block";
  document.getElementById("dinheiro-form").style.display = "none";
}

// Cartão
function selecionarCartao() {
  esconderFormas();
  document.getElementById("cartao-form").style.display = "block";
  gerarOpcoesParcelamento();
}

function validarCartao() {
  const nome = document.getElementById("nome-cartao").value.trim();
  const nascimento = document.getElementById("data-nascimento").value;
  const numero = document.getElementById("numero-cartao").value.trim();

  if (!/^[A-Za-z\s]+$/.test(nome)) return alert("Algo está errado no nome!");
  if (!nascimento) return alert("Algo está errado na data de nascimento!");
  if (!/^\d{16}$/.test(numero)) return alert("Algo está errado no número do cartão!");

  alert("Pronto, sua compra foi finalizada com sucesso!");
  carrinho = [];
  localStorage.setItem('carrinho', JSON.stringify([]));
  window.location.href = "./../Tela/index.html";
}

function gerarOpcoesParcelamento() {
  const select = document.getElementById("parcelas");
  select.innerHTML = "";
  const total = carrinho.reduce((soma, item) => soma + item.preco, 0) + 3.00;

  if (total >= 50) select.innerHTML += "<option>2x</option>";
  if (total >= 120) select.innerHTML += "<option>3x</option>";
  if (total >= 140) select.innerHTML += "<option>4x</option>";
  if (total >= 160) select.innerHTML += "<option>5x</option>";
  if (select.innerHTML === "") select.innerHTML = "<option>Não atingiu o valor necessário para parcelar</option>";
}

function cancelarCartao() {
  document.getElementById("cartao-form").style.display = "none";
  document.getElementById("formas-pagamento").style.display = "block";
}

// ✅ Função adicionada para corrigir o funcionamento do QR Code Pix
function calcularValores() {
  const subtotal = carrinho.reduce((soma, item) => soma + item.preco, 0);
  const frete = 3.00;
  window.valorFinalCalculado = subtotal + frete;
}
//Pix
function selecionarPix() {
  esconderFormas();
  document.getElementById("qrcode-area").style.display = "block";
  calcularValores(); // Garante que o valor final esteja atualizado

  const valor = window.valorFinalCalculado.toFixed(2); // Valor em string com 2 casas
  const chavePix = '+5544999585963'; // ✅ Chave Pix com número de telefone no formato internacional
  const nomeRecebedor = 'Laura V. de Souza'; // Nome do recebedor
  const cidade = 'SAO PAULO'; // Cidade do recebedor
  const descricao = 'Pagamento Farmacia Pink Delfins'; // Descrição da transação

  function formatField(id, value) {
    const length = value.length.toString().padStart(2, '0');
    return id + length + value;
  }

  // Monta o payload do Pix Copia e Cola
  let payloadSemCRC =
    formatField("00", "01") +
    formatField("26",
      formatField("00", "BR.GOV.BCB.PIX") +
      formatField("01", chavePix) + // Chave tipo telefone
      formatField("02", descricao)
    ) +
    formatField("52", "0000") +
    formatField("53", "986") +
    formatField("54", valor) +
    formatField("58", "BR") +
    formatField("59", nomeRecebedor) +
    formatField("60", cidade) +
    formatField("62", formatField("05", "***")) +
    "6304";

  // Gera o CRC16 para finalizar o payload
  function crc16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  const crc = crc16(payloadSemCRC);
  const payloadFinal = payloadSemCRC + crc;

  const qrCodeDiv = document.getElementById('qrcode');
  qrCodeDiv.innerHTML = '';
  document.getElementById('qrcode-area').style.display = 'block';

  new QRCode(qrCodeDiv, {
    text: payloadFinal,
    width: 250,
    height: 250,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  const info = document.createElement('div');
  info.className = 'nome-valor';
  info.innerHTML = `
    <p><strong>Nome:</strong> ${nomeRecebedor}</p>
    <p><strong>Telefone (Pix):</strong> ${chavePix}</p>
    <p><strong>Valor:</strong> R$ ${valor}</p>
  `;
  qrCodeDiv.appendChild(info);
}


// Função para finalizar o pagamento via Pix
function confirmarPix() {
  alert("Pronto, sua compra foi finalizada com sucesso!");
  carrinho = []; //limpa o carrinho
  localStorage.setItem('carrinho', JSON.stringify([]));
  window.location.href = "./../Tela/index.html";
}

// Função para esconder formulários
function esconderFormas() {
  document.getElementById("formas-pagamento").style.display = "none";
  document.getElementById("dinheiro-form").style.display = "none";
  document.getElementById("cartao-form").style.display = "none";
  document.getElementById("qrcode-area").style.display = "none";
}