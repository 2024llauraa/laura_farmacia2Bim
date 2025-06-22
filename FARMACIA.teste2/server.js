// server.js - Servidor para aplicação da farmácia
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "Img"));
  },
  filename: function (req, file, cb) {
    // Manter o nome original ou gerar um nome único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Arquivos de dados
const USERS_FILE = path.join(__dirname, "data", "usuarios.csv");
const PRODUCTS_FILE = path.join(__dirname, "data", "produtos.json");
const ORDERS_FILE = path.join(__dirname, "data", "pedidos.json");

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos de subpastas
app.use(express.static(path.join(__dirname, "Cadastro")));
app.use(express.static(path.join(__dirname, "Carrinho")));
app.use(express.static(path.join(__dirname, "Detalhe")));
app.use(express.static(path.join(__dirname, "Gerente")));
app.use(express.static(path.join(__dirname, "Img")));
app.use(express.static(path.join(__dirname, "Login")));
app.use(express.static(path.join(__dirname, "Tela")));

// Servir arquivos estáticos do diretório raiz (para arquivos como server.js, package.json, etc.)
app.use(express.static(__dirname));

// Criar diretório de dados se não existir
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Helper para ler CSV como array de objetos
function lerUsuariosCSV() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const linhas = fs.readFileSync(USERS_FILE, "utf-8").split("\n").filter(Boolean);
  return linhas.map((l, index) => {
    const [nome, email, senha, role = "cliente"] = l.split(",");
    return { id: index + 1, nome, email, senha, role };
  });
}

function salvarUsuario(usuario) {
  const linha = `\n${usuario.nome},${usuario.email},${usuario.senha},${usuario.role || "cliente"}`;
  fs.appendFileSync(USERS_FILE, linha);
}

function salvarTodosUsuarios(usuarios) {
  const linhas = usuarios.map(u => `${u.nome},${u.email},${u.senha},${u.role || "cliente"}`);
  fs.writeFileSync(USERS_FILE, linhas.join("\n"));
}

// Helper para produtos
function lerProdutos() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const produtosPadrao = [
      { id: 1, nome: "Paracetamol", preco: 8.50, categoria: "Analgésico", imagem: "paracetamol.png", descricao: "Analgésico e antitérmico" },
      { id: 2, nome: "Ibuprofeno", preco: 12.30, categoria: "Anti-inflamatório", imagem: "ibuprofeno.png", descricao: "Anti-inflamatório não esteroidal" },
      { id: 3, nome: "Dipirona", preco: 6.80, categoria: "Analgésico", imagem: "dipirona.png", descricao: "Analgésico e antitérmico" },
      { id: 4, nome: "Aspirina", preco: 9.90, categoria: "Analgésico", imagem: "aspirina.png", descricao: "Ácido acetilsalicílico" },
      { id: 5, nome: "Omeprazol", preco: 15.60, categoria: "Protetor gástrico", imagem: "omeprazol.png", descricao: "Inibidor da bomba de prótons" },
      { id: 6, nome: "Losartana", preco: 18.40, categoria: "Anti-hipertensivo", imagem: "losartana.png", descricao: "Bloqueador dos receptores da angiotensina" },
      { id: 7, nome: "Enalapril", preco: 14.20, categoria: "Anti-hipertensivo", imagem: "enalapril.png", descricao: "Inibidor da ECA" },
      { id: 8, nome: "Sinvastatina", preco: 22.70, categoria: "Hipolipemiante", imagem: "sinvastatina.png", descricao: "Redutor de colesterol" },
      { id: 9, nome: "Loratadina", preco: 11.50, categoria: "Antialérgico", imagem: "loratadina.png", descricao: "Anti-histamínico" },
      { id: 10, nome: "Amoxicilina", preco: 25.80, categoria: "Antibiótico", imagem: "amoxicilina.png", descricao: "Antibiótico de amplo espectro" },
      { id: 11, nome: "Azitromicina", preco: 32.40, categoria: "Antibiótico", imagem: "azitromicina.png", descricao: "Antibiótico macrolídeo" },
      { id: 12, nome: "Clonazepam", preco: 28.90, categoria: "Ansiolítico", imagem: "clonazepam.png", descricao: "Benzodiazepínico" }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(produtosPadrao, null, 2));
    return produtosPadrao;
  }
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
}

function salvarProdutos(produtos) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(produtos, null, 2));
}

// Helper para pedidos
function lerPedidos() {
  if (!fs.existsSync(ORDERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
}

function salvarPedido(pedido) {
  const pedidos = lerPedidos();
  pedido.id = pedidos.length + 1;
  pedido.data = new Date().toISOString();
  pedidos.push(pedido);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(pedidos, null, 2));
  return pedido;
}

// Rotas de autenticação
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;
  const usuarios = lerUsuariosCSV();
  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) {
    return res.status(401).json({ success: false, message: "Você não está cadastrado" });
  }

  if (usuario.senha !== senha) {
    return res.status(401).json({ success: false, message: "Algum dado está incorreto" });
  }

  res.cookie("usuario", JSON.stringify({ nome: usuario.nome, email: usuario.email, role: usuario.role }), { 
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: false 
  });

  res.json({ success: true, message: "Login efetuado com sucesso", usuario: { nome: usuario.nome, email: usuario.email, role: usuario.role } });
});

app.post("/api/cadastro", (req, res) => {
  const { nome, email, senha, confirmar } = req.body;
  
  if (senha !== confirmar) {
    return res.status(400).json({ success: false, message: "As senhas não coincidem" });
  }

  const usuarios = lerUsuariosCSV();
  const existe = usuarios.find(u => u.email === email);
  
  if (existe) {
    return res.status(400).json({ success: false, message: "Este email já está cadastrado" });
  }

  salvarUsuario({ nome, email, senha, role: "cliente" }); // Novo usuário é sempre 'cliente'
  res.json({ success: true, message: "Cadastro realizado com sucesso!" });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("usuario");
  res.json({ success: true, message: "Logout realizado com sucesso" });
});

// Rotas de produtos
app.get("/api/produtos", (req, res) => {
  const produtos = lerProdutos();
  res.json(produtos);
});

// Corrigir a API de obter produto individual
app.get("/api/produtos/:id", (req, res) => {
  const produtos = lerProdutos();
  const produto = produtos.find(p => p.id === parseInt(req.params.id));
  
  if (!produto) {
    return res.status(404).json({ success: false, message: "Produto não encontrado" });
  }
  
  res.json({ success: true, produto });
});

app.get("/api/produtos/categoria/:categoria", (req, res) => {
  const produtos = lerProdutos();
  const produtosFiltrados = produtos.filter(p => 
    p.categoria.toLowerCase().includes(req.params.categoria.toLowerCase())
  );
  res.json(produtosFiltrados);
});

app.get("/api/buscar/:termo", (req, res) => {
  const produtos = lerProdutos();
  const termo = req.params.termo.toLowerCase();
  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termo) || 
    p.categoria.toLowerCase().includes(termo) ||
    p.descricao.toLowerCase().includes(termo)
  );
  res.json(produtosFiltrados);
});

// Rotas de gerenciamento de produtos (apenas para gerentes)
function verificarGerente(req, res, next) {
  const usuario = req.cookies.usuario;
  if (!usuario) {
    return res.status(401).json({ success: false, message: "Usuário não autenticado" });
  }
  
  try {
    const user = JSON.parse(usuario);
    if (user.role !== "gerente") {
      return res.status(403).json({ success: false, message: "Acesso negado. Apenas gerentes podem realizar esta ação." });
    }
    req.usuario = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
}

// Rota para upload de imagem
app.post("/api/upload-imagem", verificarGerente, upload.single('imagem'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Nenhuma imagem foi enviada" });
    }

    const nomeArquivo = req.file.filename;
    res.json({ 
      success: true, 
      message: "Imagem enviada com sucesso!", 
      nomeArquivo: nomeArquivo,
      caminho: `/Img/${nomeArquivo}`
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ success: false, message: "Erro ao fazer upload da imagem" });
  }
});

// Adicionar produto
app.post("/api/produtos", verificarGerente, (req, res) => {
  const { nome, preco, categoria, imagem, descricao, estoque } = req.body;
  
  if (!nome || !preco || !categoria) {
    return res.status(400).json({ success: false, message: "Nome, preço e categoria são obrigatórios" });
  }

  const produtos = lerProdutos();
  const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
  
  const novoProduto = {
    id: novoId,
    nome,
    preco: parseFloat(preco),
    categoria,
    imagem: imagem || "placeholder.png",
    descricao: descricao || "",
    estoque: parseInt(estoque) || 0
  };

  produtos.push(novoProduto);
  salvarProdutos(produtos);

  res.json({ success: true, message: "Produto adicionado com sucesso!", produto: novoProduto });
});

// Editar produto
app.put("/api/produtos/:id", verificarGerente, (req, res) => {
  const { nome, preco, categoria, imagem, descricao, estoque } = req.body;
  const produtoId = parseInt(req.params.id);
  
  const produtos = lerProdutos();
  const produtoIndex = produtos.findIndex(p => p.id === produtoId);
  
  if (produtoIndex === -1) {
    return res.status(404).json({ success: false, message: "Produto não encontrado" });
  }

  // Atualizar apenas os campos fornecidos
  if (nome !== undefined) produtos[produtoIndex].nome = nome;
  if (preco !== undefined) produtos[produtoIndex].preco = parseFloat(preco);
  if (categoria !== undefined) produtos[produtoIndex].categoria = categoria;
  if (imagem !== undefined) produtos[produtoIndex].imagem = imagem;
  if (descricao !== undefined) produtos[produtoIndex].descricao = descricao;
  if (estoque !== undefined) produtos[produtoIndex].estoque = parseInt(estoque);

  salvarProdutos(produtos);

  res.json({ success: true, message: "Produto alterado com sucesso!", produto: produtos[produtoIndex] });
});

// Excluir produto
app.delete("/api/produtos/:id", verificarGerente, (req, res) => {
  const produtoId = parseInt(req.params.id);
  
  const produtos = lerProdutos();
  const produtoIndex = produtos.findIndex(p => p.id === produtoId);
  
  if (produtoIndex === -1) {
    return res.status(404).json({ success: false, message: "Produto não encontrado" });
  }

  const produtoExcluido = produtos.splice(produtoIndex, 1)[0];
  salvarProdutos(produtos);

  res.json({ success: true, message: "Produto excluído com sucesso!", produto: produtoExcluido });
});

// Rotas para gerenciamento de usuários (apenas para gerentes)
app.get("/api/usuarios", verificarGerente, (req, res) => {
  const usuarios = lerUsuariosCSV();
  res.json({ success: true, usuarios });
});

app.put("/api/usuarios/:id/role", verificarGerente, (req, res) => {
  const { role } = req.body;
  const usuarioId = parseInt(req.params.id);
  
  if (!["cliente", "gerente"].includes(role)) {
    return res.status(400).json({ success: false, message: "Função inválida" });
  }
  
  const usuarios = lerUsuariosCSV();
  const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
  
  if (usuarioIndex === -1) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado" });
  }

  usuarios[usuarioIndex].role = role;
  salvarTodosUsuarios(usuarios);

  res.json({ success: true, message: "Função do usuário alterada com sucesso!" });
});

app.delete("/api/usuarios/:id", verificarGerente, (req, res) => {
  const usuarioId = parseInt(req.params.id);
  
  const usuarios = lerUsuariosCSV();
  const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
  
  if (usuarioIndex === -1) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado" });
  }

  const usuarioExcluido = usuarios.splice(usuarioIndex, 1)[0];
  salvarTodosUsuarios(usuarios);

  res.json({ success: true, message: "Usuário excluído com sucesso!", usuario: usuarioExcluido });
});

// Rotas de carrinho e pedidos
app.post("/api/pedido", (req, res) => {
  const { itens, total, usuario } = req.body;
  
  if (!itens || itens.length === 0) {
    return res.status(400).json({ success: false, message: "Carrinho vazio" });
  }

  const pedido = salvarPedido({
    itens,
    total,
    usuario,
    status: "pendente"
  });

  res.json({ success: true, message: "Pedido realizado com sucesso!", pedido });
});

app.get("/api/pedidos/:email", (req, res) => {
  const pedidos = lerPedidos();
  const pedidosUsuario = pedidos.filter(p => p.usuario.email === req.params.email);
  res.json(pedidosUsuario);
});

// Middleware para verificar autenticação
function verificarAuth(req, res, next) {
  const usuario = req.cookies.usuario;
  if (!usuario) {
    return res.status(401).json({ success: false, message: "Usuário não autenticado" });
  }
  req.usuario = JSON.parse(usuario);
  next();
}

// Rota protegida para área do usuário
app.get("/api/usuario", verificarAuth, (req, res) => {
  res.json({ success: true, usuario: req.usuario });
});

// Rotas para servir páginas HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Tela", "principal.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "Login", "login.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "Cadastro", "cadastro.html"));
});

app.get("/carrinho", (req, res) => {
  res.sendFile(path.join(__dirname, "Carrinho", "carrinho.html"));
});

app.get("/produto/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "Detalhe", "detalhe.html"));
});

app.get("/gerente", (req, res) => {
  res.sendFile(path.join(__dirname, "Gerente", "gerente_produto.html"));
});

app.get("/gerente/produtos", (req, res) => {
  res.sendFile(path.join(__dirname, "Gerente", "gerente_produto.html"));
});

app.get("/gerente/usuarios", (req, res) => {
  res.sendFile(path.join(__dirname, "Gerente", "gerenciar_usuarios.html"));
});

app.get("/gerente/adicionar", (req, res) => {
  res.sendFile(path.join(__dirname, "Gerente", "adicionar_produto.html"));
});

app.get("/gerente/editar", (req, res) => {
  res.sendFile(path.join(__dirname, "Gerente", "editar_produto.html"));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Erro interno do servidor" });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Página não encontrada" });
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor da farmácia rodando em http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
