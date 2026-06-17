import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Categoria =
  | 'todos'
  | 'dia'
  | 'tradicionais'
  | 'pratos'
  | 'lanches'
  | 'bebidas'
  | 'sobremesas'
  | 'combos';

type Pagamento = 'Pix' | 'Crédito' | 'Débito' | 'Dinheiro';
type Entrega = 'Entrega' | 'Retirada no Local';

interface Prato {
  id: number;
  nome: string;
  desc: string;
  preco: number;
  antigo?: number;
  categoria: Categoria;
  badge?: string;
  img: string;
}

interface ItemCarrinho {
  prato: Prato;
  quantidade: number;
}

interface Usuario {
  nome: string;
  email: string;
  pedidos: number;
  foto: string;
  cartao: string;
}

@Component({
  selector: 'app-cardapio-angular',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cardapio-angular.component.html',
  styleUrls: ['./cardapio-angular.component.css']
})
export class CardapioAngularComponent {
  private readonly WHATSAPP_RESTAURANTE = '5521999999999';

  busca = '';
  categoriaAtual: Categoria = 'todos';

  carrinhoAberto = false;
  checkoutAberto = false;
  perfilAberto = false;
  carregandoCEP = false;
  erroCEP = '';

  emailLogado = localStorage.getItem('usuarioLogado') || '';

  usuario: Usuario = {
    nome: 'Cliente',
    email: this.emailLogado || 'cliente',
    pedidos: 0,
    foto: '',
    cartao: ''
  };

  carrinho: ItemCarrinho[] = [];

  entregaTipo: Entrega = 'Entrega';
  pagamento: Pagamento = 'Pix';

  dados = {
    nome: '',
    telefone: '',
    observacao: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: '',
    nomeCartao: '',
    numeroCartao: '',
    validadeCartao: '',
    cvvCartao: '',
    precisaTroco: 'Não',
    trocoPara: ''
  };

  categorias: { id: Categoria; nome: string }[] = [
    { id: 'todos', nome: 'Todos' },
    { id: 'dia', nome: '⭐ Prato do Dia' },
    { id: 'tradicionais', nome: '🍲 Tradicionais' },
    { id: 'pratos', nome: '🍛 Pratos' },
    { id: 'lanches', nome: '🍔 Lanches' },
    { id: 'bebidas', nome: '🥤 Bebidas' },
    { id: 'sobremesas', nome: '🍰 Sobremesas' },
    { id: 'combos', nome: '🎁 Combos' }
  ];

  pratos: Prato[] = [
  {
    id: 1,
    nome: 'Arroz Carreteiro',
    desc: 'Arroz com carne seca, calabresa, temperos da roça e cheiro-verde.',
    preco: 32.9,
    antigo: 38.9,
    categoria: 'dia',
    badge: 'Prato do Dia',
    img: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    nome: 'Parmegiana',
    desc: 'Arroz branco, fritas, bife empanado, molho vermelho e queijo.',
    preco: 32.9,
    antigo: 38.9,
    categoria: 'dia',
    badge: 'Prato do Dia',
    img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    nome: 'Feijoada Completa',
    desc: 'Feijoada com arroz, couve, farofa, laranja e torresmo.',
    preco: 39.9,
    antigo: 46.9,
    categoria: 'tradicionais',
    badge: 'Mais pedido',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    nome: 'Frango Grelhado',
    desc: 'Frango grelhado com arroz, feijão, salada e batata frita.',
    preco: 29.9,
    antigo: 34.9,
    categoria: 'pratos',
    badge: 'Leve',
    img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    nome: 'X-Burger Artesanal',
    desc: 'Hambúrguer artesanal, queijo, salada e molho especial.',
    preco: 24.9,
    antigo: 29.9,
    categoria: 'lanches',
    badge: 'Top',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    nome: 'Refrigerante Lata',
    desc: 'Refrigerante gelado lata 350ml.',
    preco: 6.9,
    categoria: 'bebidas',
    badge: 'Gelado',
    img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80'
  },
  
  {
  id: 7,
  nome: 'Pudim Caseiro',
  desc: 'Pudim de leite condensado com calda de caramelo.',
  preco: 9.9,
  antigo: 12.9,
  categoria: 'sobremesas',
  badge: 'Doce',
  img: 'https://s01.video.glbimg.com/x720/1269796.jpg'
},
  {
    id: 8,
    nome: 'Combo Executivo',
    desc: '1 prato do dia, 1 bebida e 1 sobremesa simples.',
    preco: 42.9,
    antigo: 52.9,
    categoria: 'combos',
    badge: 'Almoço',
    img: 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 9,
    nome: 'Moqueca Baiana',
    desc: 'Moqueca de peixe com dendê, leite de coco, pimentões e pirão.',
    preco: 45.9,
    antigo: 54.9,
    categoria: 'tradicionais',
    badge: 'Especialidade',
    img: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 10,
    nome: 'Picanha na Chapa',
    desc: 'Picanha grelhada, arroz, feijão, farofa, fritas e vinagrete.',
    preco: 52.9,
    antigo: 62.9,
    categoria: 'tradicionais',
    badge: 'Premium',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 11,
    nome: 'Brigadeiro Gourmet',
    desc: 'Brigadeiro cremoso com chocolate e granulado especial.',
    preco: 8.9,
    categoria: 'sobremesas',
    badge: 'Clássico',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 12,
    nome: 'Pavê de Chocolate',
    desc: 'Pavê com creme, biscoito e cobertura de chocolate.',
    preco: 12.9,
    antigo: 15.9,
    categoria: 'sobremesas',
    badge: 'Doce',
    img: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 13,
    nome: 'Mousse de Maracujá',
    desc: 'Mousse leve de maracujá com calda da fruta.',
    preco: 13.9,
    categoria: 'sobremesas',
    badge: 'Leve',
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 14,
    nome: 'Tiramisu',
    desc: 'Sobremesa italiana com mascarpone, café e chocolate.',
    preco: 14.9,
    categoria: 'sobremesas',
    badge: 'Premium',
    img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 15,
    nome: 'Brownie Quente',
    desc: 'Brownie de chocolate servido com calda cremosa.',
    preco: 11.9,
    categoria: 'sobremesas',
    badge: 'Quentinho',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 16,
    nome: 'Caipirinha de Morango',
    desc: 'Caipirinha feita com morangos frescos, cachaça e limão.',
    preco: 16.9,
    categoria: 'bebidas',
    badge: 'Refrescante',
    img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80'
  },
 {
  id: 17,
  nome: 'Caipirinha Clássica',
  desc: 'Caipirinha tradicional com cachaça, limão e açúcar.',
  preco: 15.9,
  categoria: 'bebidas',
  badge: 'Clássico',
  img: 'https://blog.guiacomercialbrasil.com.br/wp-content/uploads/2022/03/caipirinha.png'
},
  {
    id: 18,
    nome: 'Vinho Tinto Reserva',
    desc: 'Vinho tinto encorpado com notas de frutas vermelhas.',
    preco: 35.9,
    categoria: 'bebidas',
    badge: 'Premium',
    img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 19,
    nome: 'Coquetel Margarita',
    desc: 'Margarita clássica com tequila, licor de laranja e limão.',
    preco: 18.9,
    categoria: 'bebidas',
    badge: 'Tropical',
    img: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 20,
    nome: 'Suco Natural Detox',
    desc: 'Suco natural com frutas, vegetais, limão, hortelã e gengibre.',
    preco: 9.9,
    categoria: 'bebidas',
    badge: 'Saudável',
    img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 21,
    nome: 'Cerveja Artesanal IPA',
    desc: 'Cerveja artesanal com aroma frutado e lúpulo marcante.',
    preco: 14.9,
    categoria: 'bebidas',
    badge: 'Artesanal',
    img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 22,
    nome: 'Panna Cotta',
    desc: 'Panna cotta cremosa com calda de frutas vermelhas.',
    preco: 13.9,
    categoria: 'sobremesas',
    badge: 'Italiano',
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80'
  },

  // NOVOS
  {
  id: 23,
  nome: 'Strogonoff de Frango',
  desc: 'Strogonoff cremoso com arroz branco e batata palha.',
  preco: 31.9,
  antigo: 36.9,
  categoria: 'pratos',
  badge: 'Cremoso',
  img: 'https://conteudo.imguol.com.br/c/entretenimento/68/2020/08/10/strogonoff-de-frango-1597071542342_v2_300x400.jpg'
},
  {
    id: 24,
    nome: 'Lasanha Bolonhesa',
    desc: 'Lasanha com molho bolonhesa, queijo e massa gratinada.',
    preco: 34.9,
    antigo: 42.9,
    categoria: 'pratos',
    badge: 'Forno',
    img: 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 25,
    nome: 'Macarrão à Carbonara',
    desc: 'Massa cremosa com bacon, queijo e toque de pimenta.',
    preco: 33.9,
    categoria: 'pratos',
    badge: 'Italiano',
    img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 26,
    nome: 'Escondidinho de Carne Seca',
    desc: 'Purê cremoso com carne seca desfiada e queijo gratinado.',
    preco: 36.9,
    antigo: 44.9,
    categoria: 'tradicionais',
    badge: 'Caseiro',
    img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80'
  },

    {
  id: 0,
  nome: 'Pastel de Carne',
  desc: 'Pastel crocante recheado com carne moída temperada.',
  preco: 12.9,
  antigo: 15.9,
  categoria: 'lanches',
  badge: 'Salgado',
  img: 'assets/img/pastel-carne.jpg'
},
  {
    id: 28,
    nome: 'Batata Frita com Cheddar',
    desc: 'Porção de batata frita com cheddar cremoso e bacon.',
    preco: 22.9,
    antigo: 27.9,
    categoria: 'lanches',
    badge: 'Porção',
    img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 29,
    nome: 'Combo Família',
    desc: '2 pratos principais, 2 bebidas e 1 sobremesa grande.',
    preco: 89.9,
    antigo: 109.9,
    categoria: 'combos',
    badge: 'Família',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 30,
    nome: 'Combo Burger',
    desc: '1 X-Burger artesanal, batata frita e refrigerante lata.',
    preco: 38.9,
    antigo: 45.9,
    categoria: 'combos',
    badge: 'Lanche',
    img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 31,
    nome: 'Água Mineral',
    desc: 'Água mineral sem gás 500ml.',
    preco: 4.9,
    categoria: 'bebidas',
    badge: 'Leve',
    img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 32,
    nome: 'Petit Gateau',
    desc: 'Bolinho de chocolate com recheio cremoso e sorvete.',
    preco: 17.9,
    antigo: 22.9,
    categoria: 'sobremesas',
    badge: 'Especial',
    img: 'https://images.unsplash.com/photo-1617305855058-336d24456869?auto=format&fit=crop&w=900&q=80'
  }
];

  constructor(private location: Location) {
    this.carregarUsuario();

    if (this.usuario.nome !== 'Cliente') {
      this.dados.nome = this.usuario.nome;
    }
  }

  get pratosFiltrados(): Prato[] {
    const texto = this.busca.toLowerCase().trim();

    return this.pratos.filter((item) => {
      const categoriaOk =
        this.categoriaAtual === 'todos' || item.categoria === this.categoriaAtual;

      const buscaOk =
        item.nome.toLowerCase().includes(texto) ||
        item.desc.toLowerCase().includes(texto);

      return categoriaOk && buscaOk;
    });
  }

  get fotoUsuario(): string {
    return this.usuario.foto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  }

  get textoDesconto(): string {
    const pedidos = this.usuario.pedidos || 0;

    if (pedidos >= 10) {
      return '🎁 Cupom 15% OFF disponível';
    }

    return `Faltam ${10 - pedidos} pedidos para ganhar 15% OFF`;
  }

  voltar(): void {
    this.location.back();
  }

  selecionarCategoria(categoria: Categoria): void {
    this.categoriaAtual = categoria;
  }

  adicionarCarrinho(prato: Prato): void {
    const item = this.carrinho.find((produto) => produto.prato.id === prato.id);

    if (item) {
      item.quantidade++;
    } else {
      this.carrinho.push({
        prato,
        quantidade: 1
      });
    }
  }

  aumentar(item: ItemCarrinho): void {
    item.quantidade++;
  }

  diminuir(item: ItemCarrinho): void {
    if (item.quantidade > 1) {
      item.quantidade--;
      return;
    }

    this.removerItem(item.prato.id);
  }

  removerItem(id: number): void {
    this.carrinho = this.carrinho.filter((item) => item.prato.id !== id);
  }

  abrirCarrinho(): void {
    this.carrinhoAberto = true;
  }

  fecharCarrinho(): void {
    this.carrinhoAberto = false;
  }

  abrirCheckout(): void {
    if (this.carrinho.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    this.carrinhoAberto = false;
    this.checkoutAberto = true;
  }

  fecharCheckout(): void {
    this.checkoutAberto = false;
  }

  abrirPerfil(): void {
    this.perfilAberto = true;
  }

  fecharPerfil(): void {
    this.perfilAberto = false;
  }

  salvarPerfil(): void {
    this.usuario.cartao = this.usuario.cartao || '';
    this.salvarUsuarios();
    alert('Perfil salvo com sucesso!');
    this.fecharPerfil();
  }

  onFotoSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) {
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      this.usuario.foto = String(leitor.result || '');
      this.salvarUsuarios();
    };

    leitor.readAsDataURL(arquivo);
  }

  subtotal(): number {
    return this.carrinho.reduce(
      (total, item) => total + item.prato.preco * item.quantidade,
      0
    );
  }

  taxaEntrega(): number {
    return this.entregaTipo === 'Entrega' ? 5 : 0;
  }

  totalPedido(): number {
    return this.subtotal() + this.taxaEntrega();
  }

  totalItens(): number {
    return this.carrinho.reduce((total, item) => total + item.quantidade, 0);
  }

  moeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  finalizarPedido(): void {
    if (!this.dados.nome.trim()) {
      alert('Digite o nome do cliente.');
      return;
    }

    if (!this.dados.telefone.trim()) {
      alert('Digite o telefone do cliente.');
      return;
    }

    if (this.entregaTipo === 'Entrega') {
      if (!this.dados.rua.trim() || !this.dados.numero.trim() || !this.dados.bairro.trim()) {
        alert('Preencha o endereço de entrega.');
        return;
      }
    }

    const codigo = 'PED' + Date.now();

    const pedidoCozinha = {
      id: Date.now(),
      codigo,
      cliente: this.dados.nome,
      tipoEntrega: this.entregaTipo === 'Entrega' ? 'Delivery' : 'Retirada',
      valor: this.totalPedido(),
      status: 'aguardando',
      itens: this.carrinho.map((item) => ({
        quantidade: item.quantidade,
        nome: item.prato.nome
      })),
      observacao: this.dados.observacao,
      criadoEm: Date.now(),
      estoqueBaixado: false
    };

    const pedidosCozinha = this.lerStorage<any[]>('pedidosCozinha', []);
    pedidosCozinha.unshift(pedidoCozinha);
    localStorage.setItem('pedidosCozinha', JSON.stringify(pedidosCozinha));

    this.usuario.nome = this.dados.nome;
    this.usuario.pedidos = (this.usuario.pedidos || 0) + 1;
    this.salvarUsuarios();

    const mensagem = this.montarMensagemWhatsApp(codigo);
    const url = `https://wa.me/${this.WHATSAPP_RESTAURANTE}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');

    alert('Pedido confirmado e enviado para a cozinha!');

    this.carrinho = [];
    this.checkoutAberto = false;
  }

  montarMensagemWhatsApp(codigo: string): string {
    const itens = this.carrinho
      .map((item) => `• ${item.quantidade}x ${item.prato.nome} - ${this.moeda(item.prato.preco * item.quantidade)}`)
      .join('\n');

    const endereco =
      this.entregaTipo === 'Entrega'
        ? `${this.dados.rua}, ${this.dados.numero} - ${this.dados.bairro} ${this.dados.complemento ? '- ' + this.dados.complemento : ''}`
        : 'Retirada no local';

    let extraPagamento = '';

    if (this.pagamento === 'Dinheiro') {
      extraPagamento = `\nTroco: ${this.dados.precisaTroco}`;
      if (this.dados.precisaTroco === 'Sim') {
        extraPagamento += `\nTroco para: ${this.dados.trocoPara}`;
      }
    }

    if (this.pagamento === 'Crédito' || this.pagamento === 'Débito') {
      extraPagamento = '\nPagamento no cartão informado pelo cliente.';
    }

    return `
🍽️ *NOVO PEDIDO - EMÍDIO*

Código: ${codigo}

👤 Cliente: ${this.dados.nome}
📞 Telefone: ${this.dados.telefone}

🛒 Itens:
${itens}

🚚 Entrega: ${this.entregaTipo}
📍 Endereço: ${endereco}

💳 Pagamento: ${this.pagamento}${extraPagamento}

📝 Observação:
${this.dados.observacao || 'Sem observação'}

Subtotal: ${this.moeda(this.subtotal())}
Taxa: ${this.moeda(this.taxaEntrega())}
Total: ${this.moeda(this.totalPedido())}
    `.trim();
  }

  buscarCEP(): void {
    const cep = this.dados.cep.replace(/\D/g, '');

    if (cep.length !== 8) {
      this.erroCEP = 'CEP deve ter 8 dígitos';
      return;
    }

    this.carregandoCEP = true;
    this.erroCEP = '';

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((response) => response.json())
      .then((data) => {
        if (data.erro) {
          this.erroCEP = 'CEP não encontrado';
          return;
        }

        this.dados.rua = data.logradouro;
        this.dados.bairro = data.bairro;
        this.erroCEP = '';
      })
      .catch(() => {
        this.erroCEP = 'Erro ao buscar CEP';
      })
      .finally(() => {
        this.carregandoCEP = false;
      });
  }

  limitarCep(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 8);
    this.dados.cep = input.value;
  }

  limitarNumero(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 11);
    this.dados.numero = input.value;
  }

  private carregarUsuario(): void {
    const usuarios = this.lerStorage<Usuario[]>('usuarios', []);

    const usuarioEncontrado = usuarios.find((u) => u.email === this.emailLogado);

    if (usuarioEncontrado) {
      this.usuario = usuarioEncontrado;
      return;
    }

    this.usuario = {
      nome: 'Cliente',
      email: this.emailLogado || 'cliente',
      pedidos: 0,
      foto: '',
      cartao: ''
    };
  }

  private salvarUsuarios(): void {
    const usuarios = this.lerStorage<Usuario[]>('usuarios', []);
    const index = usuarios.findIndex((u) => u.email === this.usuario.email);

    if (index >= 0) {
      usuarios[index] = this.usuario;
    } else {
      usuarios.push(this.usuario);
    }

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  private lerStorage<T>(chave: string, padrao: T): T {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : padrao;
    } catch {
      return padrao;
    }
  }
}