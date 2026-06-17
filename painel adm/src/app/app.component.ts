import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Page = 'dashboard' | 'owner' | 'menu' | 'kitchen' | 'gps' | 'orders' | 'delivery' | 'clients' | 'analytics';
type StoreStatus = 'ABERTA' | 'FECHADA' | 'AUTO';
type OrderStatus = 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';
type OwnerTab = 'overview' | 'stock' | 'shopping' | 'suppliers' | 'finance' | 'expenses' | 'analytics' | 'employees' | 'point' | 'freelance';
type DeliveryTab = 'disponiveis' | 'rastreador' | 'ativas' | 'historico';

interface Order {
  id: string;
  client: string;
  date: string;
  time: string;
  total: number;
  status: OrderStatus;
  items: string[];
  address: string;
}

interface Dish {
  id: number;
  name: string;
  category: string;
  price: number;
  active: boolean;
  description?: string;
  prepTime?: number;
  ingredients?: string;
}

interface StockItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  min: number;
  max: number;
  cost: number;
  category: string;
  supplier: string;
}

interface PurchaseItem {
  id: number;
  stockId?: number;
  name: string;
  quantity: number;
  unit: string;
  supplier: string;
  price: number;
  checked: boolean;
  category?: string;
  current?: number;
  min?: number;
  buy?: number;
  total?: number;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  category: string;
  score: number;
  lastOrder: string;
  manager: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
  payment: string;
  monthlySpend: number;
  active: boolean;
}

interface SupplierForm {
  name: string;
  manager: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  categoriesText: string;
  payment: string;
  monthlySpend: number;
  score: number;
  active: boolean;
}

interface Expense {
  id: number;
  description: string;
  date: string;
  category: string;
  value: number;
  quantity?: string;
  reason?: string;
  responsible?: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  shift: string;
  status: string;
  productivity: number;
  avatar: string;
  salary: number;
  charges: number;
  total: number;
  admission: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  neighborhood: string;
  notes: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
}


interface DeliveryProfile {
  name: string;
  rating: string;
  deliveries: number;
  avatar: string;
  color?: string;
}

interface DeliveryJob {
  id: string;
  client: string;
  price: number;
  distance: string;
  eta: string;
  pickup: string;
  destination: string;
  lat: number;
  lng: number;
}

interface ActiveDeliveryJob extends DeliveryJob {
  acceptedAt: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  page: Page = 'dashboard';
  storeStatus: StoreStatus = 'FECHADA';
  filterStart = '2026-06-15';
  filterEnd = '2026-06-15';
  selectedOrder: Order | null = null;
  selectedDish: Dish | null = null;
  ownerTab: OwnerTab = 'overview';
  livePreview = true;
  kitchenQueueVisible = true;
  chatDraft = '';
  showSupplierForm = false;
  showExpenseForm = false;
  newExpense: Omit<Expense, 'id'> = { description: '', date: '2026-06-15', category: 'Vencimento', value: 0, quantity: '', reason: 'Vencimento', responsible: '' };
  newSupplier: SupplierForm = this.emptySupplierForm();
  newDish: Omit<Dish, 'id'> = { name: '', category: 'Principal', price: 0, active: true, description: '', prepTime: 20, ingredients: '' };
  newStockItem: Omit<StockItem, 'id'> = { name: '', quantity: 0, unit: 'kg', min: 1, max: 10, cost: 0, category: 'Grãos', supplier: 'Manual' };
  newClient: Omit<Client, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'lastOrder'> = { name: '', phone: '', email: '', address: '', neighborhood: '', notes: '' };
  stockSearch = '';
  stockFilter: 'all' | 'critical' | 'low' | 'ok' = 'all';
  clientSearch = '';
  analyticsStart = '2026-06-01';
  analyticsEnd = '2026-06-15';
  analyticsSearch = '';
  freelancerSearch = '';
  freelancerFilter: 'all' | 'ativo' | 'inativo' | 'pendente' = 'all';


  deliveryLoggedIn = false;
  deliveryOnline = false;
  deliveryTab: DeliveryTab = 'disponiveis';
  deliveryProfile: DeliveryProfile | null = null;
  deliveryEarnings = 0;
  deliveryFinishedToday = 0;
  deliveryGpsActive = false;
  deliveryGpsStatus = 'Aguardando permissão...';
  deliveryGpsCoords = '—';
  deliveryGpsAccuracy = '—';
  deliveryGpsTime = '—';
  deliveryToast = '';
  activeDelivery: ActiveDeliveryJob | null = null;
  private deliveryToastTimer: ReturnType<typeof setTimeout> | null = null;
  private gpsWatchId: number | null = null;

  readonly deliveryProfiles: DeliveryProfile[] = [
    { name: 'Carlos Silva', rating: '4.8', deliveries: 342, avatar: 'CS' },
    { name: 'Maria Santos', rating: '4.9', deliveries: 518, avatar: 'MS', color: '#c0392b' }
  ];

  deliveryJobs: DeliveryJob[] = [
    { id: 've-001', client: 'João Silva', price: 8.50, distance: '2,4 km', eta: '~14 min', pickup: 'Emídio Gastronomia — Capão Redondo', destination: 'Rua das Flores, 123 – Capão Redondo', lat: -23.664, lng: -46.779 },
    { id: 've-003', client: 'Carlos Lima', price: 10.00, distance: '3,2 km', eta: '~18 min', pickup: 'Emídio Gastronomia — Capão Redondo', destination: 'Rua Vergueiro, 3000 – Vila Mariana', lat: -23.588, lng: -46.643 },
    { id: 've-005', client: 'Ana Rodrigues', price: 12.00, distance: '4,1 km', eta: '~22 min', pickup: 'Emídio Gastronomia — Capão Redondo', destination: 'Av. Paulista, 900 – Bela Vista', lat: -23.561, lng: -46.656 }
  ];

  deliveryHistory = [
    { client: 'Fernanda Costa', when: 'Hoje, 11:32 · Pedido #ve-001', price: 9.50 },
    { client: 'Roberto Alves', when: 'Hoje, 10:15 · Pedido #ve-002', price: 7.00 },
    { client: 'Patricia Mendes', when: 'Ontem, 19:44 · Pedido #ve-003', price: 11.00 },
    { client: 'Lucas Teixeira', when: 'Ontem, 18:20 · Pedido #ve-002', price: 8.50 }
  ];

  readonly sidebarItems: Array<{page: Page; label: string; icon: string}> = [
    { page: 'dashboard', label: 'Dashboard', icon: '▦' },
    { page: 'owner', label: 'Olho do Dono', icon: '◎' },
    { page: 'menu', label: 'Cadastrar Prato', icon: '⊕' },
    { page: 'orders', label: 'Controle de Pedidos', icon: '▱' },
    { page: 'delivery', label: 'Entregadores', icon: '⌘' },
    { page: 'clients', label: 'Clientes', icon: '♙' },
    { page: 'analytics', label: 'Analytics', icon: '↗' }
  ];

  readonly moduleCards: Array<{page: Page; title: string; subtitle: string; icon: string; accent: 'gold' | 'blue'}> = [
    { page: 'menu', title: 'Gerenciar Cardápio', subtitle: 'Adicionar, editar ou remover pratos', icon: '🍴', accent: 'gold' },
    { page: 'kitchen', title: 'Cozinha & Pedidos', subtitle: 'Visualizar fila de preparação', icon: '♨', accent: 'gold' },
    { page: 'gps', title: 'Simulador GPS', subtitle: 'Rastreamento de entregadores', icon: '⌖', accent: 'blue' }
  ];

  readonly ownerTabs: Array<{key: OwnerTab; label: string; icon: string}> = [
    { key: 'overview', label: 'Visão Geral', icon: '◎' },
    { key: 'stock', label: 'Estoque', icon: '◈' },
    { key: 'shopping', label: 'Lista de Compras', icon: '🛒' },
    { key: 'suppliers', label: 'Fornecedores', icon: '▹' },
    { key: 'finance', label: 'Financeiro', icon: '$' },
    { key: 'expenses', label: 'Dispensas', icon: '♙' },
    { key: 'analytics', label: 'Analytics', icon: '▥' },
    { key: 'employees', label: 'Funcionários', icon: '▥' },
    { key: 'point', label: 'Bate Ponto', icon: '◷' },
    { key: 'freelance', label: 'Freelance', icon: '⌁' }
  ];

  orders: Order[] = [
    { id: '#-003', client: 'Mariana Costa', date: '2026-06-15', time: '00:31', total: 72.00, status: 'PRONTO', items: ['Baião de dois', 'Coca-Cola lata'], address: 'Rua Amapá, 74' },
    { id: '#-002', client: 'Carlos Mendes', date: '2026-06-15', time: '00:41', total: 60.90, status: 'PREPARANDO', items: ['Peixe fresco grelhado', 'Arroz de castanha'], address: 'Av. Paulista, 1313' },
    { id: '#-001', client: 'Fernanda Lima', date: '2026-06-15', time: '00:58', total: 70.00, status: 'ENTREGUE', items: ['Carne seca premium', 'Vinho tinto taça'], address: 'Rua Augusta, 890' },
    { id: '#-004', client: 'João Victor', date: '2026-06-14', time: '22:10', total: 99.80, status: 'ENTREGUE', items: ['Combo família', 'Sobremesa'], address: 'Moema, São Paulo' },
    { id: '#-005', client: 'Patrícia Mendes', date: '2026-06-14', time: '21:42', total: 48.90, status: 'ENTREGUE', items: ['Baião de Dois Especial'], address: 'Rua Heitor Penteado, 45' },
    { id: '#-006', client: 'Roberto Alves', date: '2026-06-13', time: '19:18', total: 86.40, status: 'ENTREGUE', items: ['Picanha', 'Cerveja Long Neck'], address: 'Vila Mariana, São Paulo' },
    { id: '#-007', client: 'Ana Paula Rocha', date: '2026-06-12', time: '20:04', total: 42.80, status: 'ENTREGUE', items: ['Moqueca', 'Suco Natural'], address: 'Rua Vergueiro, 3000' },
    { id: '#-008', client: 'Lucas Teixeira', date: '2026-06-11', time: '18:35', total: 58.00, status: 'ENTREGUE', items: ['Carne Seca com Nata'], address: 'Rua das Flores, 123' },
    { id: '#-009', client: 'Bianca Nunes', date: '2026-06-10', time: '12:20', total: 31.50, status: 'ENTREGUE', items: ['Entrada Nordestina', 'Água'], address: 'Capão Redondo, São Paulo' },
    { id: '#-010', client: 'Diego Santana', date: '2026-06-09', time: '22:05', total: 67.30, status: 'ENTREGUE', items: ['Peixe Fresco Grelhado', 'Coca-Cola 2L'], address: 'Bela Vista, São Paulo' },
    { id: '#-011', client: 'Camila Torres', date: '2026-06-08', time: '13:10', total: 44.20, status: 'ENTREGUE', items: ['Strogonoff', 'Chocolate 70%'], address: 'Santo Amaro, São Paulo' },
    { id: '#-012', client: 'Rafael Souza', date: '2026-06-07', time: '20:50', total: 76.00, status: 'ENTREGUE', items: ['Combo família'], address: 'Diadema, SP' },
    { id: '#-013', client: 'Juliana Barros', date: '2026-06-06', time: '16:26', total: 52.90, status: 'CANCELADO', items: ['Galinhada'], address: 'Moema, São Paulo' }
  ];

  dishes: Dish[] = [
    { id: 1, name: 'Baião de Dois Especial', category: 'Principal', price: 38.00, active: true, description: 'Arroz, feijão verde, queijo coalho e carne seca.', prepTime: 25, ingredients: 'Arroz, feijão, queijo coalho, carne seca' },
    { id: 2, name: 'Peixe Fresco Grelhado', category: 'Principal', price: 54.90, active: true, description: 'Tilápia grelhada com legumes e farofa da casa.', prepTime: 30, ingredients: 'Tilápia, legumes, farofa' },
    { id: 3, name: 'Carne Seca com Nata', category: 'Principal', price: 49.00, active: true, description: 'Carne seca cremosa acompanhada de arroz branco.', prepTime: 28, ingredients: 'Carne seca, nata, arroz' },
    { id: 4, name: 'Vinho Tinto da Casa', category: 'Bebidas', price: 34.90, active: false, description: 'Garrafa selecionada da casa.', prepTime: 2, ingredients: 'Vinho tinto' }
  ];

  clients: Client[] = [
    { id: 1, name: 'Mariana Costa', phone: '(11) 98888-1201', email: 'mariana.costa@email.com', address: 'Rua Amapá, 74', neighborhood: 'Capão Redondo', notes: 'Prefere entrega sem contato.', createdAt: '2026-01-12', totalOrders: 18, totalSpent: 1218.40, lastOrder: '2026-06-15' },
    { id: 2, name: 'Carlos Mendes', phone: '(11) 97777-2140', email: 'carlos.mendes@email.com', address: 'Av. Paulista, 1313', neighborhood: 'Bela Vista', notes: 'Cliente recorrente no almoço.', createdAt: '2026-02-05', totalOrders: 11, totalSpent: 735.20, lastOrder: '2026-06-15' },
    { id: 3, name: 'Fernanda Lima', phone: '(11) 96666-5022', email: 'fernanda.lima@email.com', address: 'Rua Augusta, 890', neighborhood: 'Consolação', notes: 'Gosta de vinho tinto.', createdAt: '2026-01-28', totalOrders: 9, totalSpent: 612.00, lastOrder: '2026-06-15' },
    { id: 4, name: 'João Victor', phone: '(11) 95555-8200', email: 'joao.victor@email.com', address: 'Alameda dos Nhambiquaras, 520', neighborhood: 'Moema', notes: 'Pedir troco para R$ 100.', createdAt: '2026-03-03', totalOrders: 6, totalSpent: 449.30, lastOrder: '2026-06-14' },
    { id: 5, name: 'Patrícia Mendes', phone: '(11) 94444-3310', email: 'patricia.mendes@email.com', address: 'Rua Heitor Penteado, 45', neighborhood: 'Pinheiros', notes: 'Sem cebola.', createdAt: '2026-04-18', totalOrders: 4, totalSpent: 194.20, lastOrder: '2026-06-14' },
    { id: 6, name: 'Roberto Alves', phone: '(11) 93333-9044', email: 'roberto.alves@email.com', address: 'Rua Domingos de Morais, 1000', neighborhood: 'Vila Mariana', notes: 'Liga antes de sair para entrega.', createdAt: '2026-02-21', totalOrders: 12, totalSpent: 920.80, lastOrder: '2026-06-13' },
    { id: 7, name: 'Ana Paula Rocha', phone: '(11) 92222-1144', email: 'ana.rocha@email.com', address: 'Rua Vergueiro, 3000', neighborhood: 'Vila Mariana', notes: 'Cliente gosta de promoções.', createdAt: '2026-05-07', totalOrders: 3, totalSpent: 128.40, lastOrder: '2026-06-12' },
    { id: 8, name: 'Lucas Teixeira', phone: '(11) 91111-2211', email: 'lucas.teixeira@email.com', address: 'Rua das Flores, 123', neighborhood: 'Capão Redondo', notes: 'Entregar na portaria.', createdAt: '2026-03-16', totalOrders: 7, totalSpent: 390.70, lastOrder: '2026-06-11' },
    { id: 9, name: 'Bianca Nunes', phone: '(11) 90000-6789', email: 'bianca.nunes@email.com', address: 'Av. Carlos Caldeira Filho, 900', neighborhood: 'Capão Redondo', notes: 'Sem lactose.', createdAt: '2026-05-20', totalOrders: 2, totalSpent: 63.00, lastOrder: '2026-06-10' },
    { id: 10, name: 'Diego Santana', phone: '(11) 98989-4545', email: 'diego.santana@email.com', address: 'Rua Treze de Maio, 200', neighborhood: 'Bela Vista', notes: 'Pedido corporativo.', createdAt: '2026-04-02', totalOrders: 5, totalSpent: 336.50, lastOrder: '2026-06-09' },
    { id: 11, name: 'Camila Torres', phone: '(11) 97878-1209', email: 'camila.torres@email.com', address: 'Av. Santo Amaro, 1700', neighborhood: 'Santo Amaro', notes: 'Enviar nota fiscal por e-mail.', createdAt: '2026-01-30', totalOrders: 8, totalSpent: 421.60, lastOrder: '2026-06-08' },
    { id: 12, name: 'Rafael Souza', phone: '(11) 96767-6677', email: 'rafael.souza@email.com', address: 'Rua das Figueiras, 77', neighborhood: 'Diadema', notes: 'Retirada às vezes.', createdAt: '2026-02-18', totalOrders: 13, totalSpent: 988.00, lastOrder: '2026-06-07' }
  ];

  stockItems: StockItem[] = [
    { id: 1, name: 'Feijão Preto', category: 'Grãos', supplier: 'Armazém Grãos & Farinhas', quantity: 50, unit: 'kg', min: 10, max: 80, cost: 8.90 },
    { id: 2, name: 'Arroz Agulhinha', category: 'Grãos', supplier: 'Armazém Grãos & Farinhas', quantity: 40, unit: 'kg', min: 15, max: 100, cost: 5.50 },
    { id: 3, name: 'Picanha', category: 'Carnes', supplier: 'Frigorífico São Paulo Carnes', quantity: 8, unit: 'kg', min: 5, max: 30, cost: 89.90 },
    { id: 4, name: 'Carne Seca', category: 'Carnes', supplier: 'Frigorífico São Paulo Carnes', quantity: 3, unit: 'kg', min: 5, max: 20, cost: 58.00 },
    { id: 5, name: 'Linguiça Calabresa', category: 'Embutidos', supplier: 'Frigorífico São Paulo Carnes', quantity: 12, unit: 'kg', min: 4, max: 25, cost: 24.90 },
    { id: 6, name: 'Couve Manteiga', category: 'Verduras', supplier: 'Hortifruti Verde Campo', quantity: 2, unit: 'kg', min: 2, max: 15, cost: 7.00 },
    { id: 7, name: 'Farinha de Mandioca', category: 'Grãos', supplier: 'Armazém Grãos & Farinhas', quantity: 25, unit: 'kg', min: 5, max: 40, cost: 8.50 },
    { id: 8, name: 'Peixe Fresco (Tilápia)', category: 'Peixes', supplier: 'Pesca & Mar Frutos do Mar', quantity: 1.5, unit: 'kg', min: 3, max: 20, cost: 29.90 },
    { id: 9, name: 'Leite de Coco', category: 'Enlatados', supplier: 'Armazém Grãos & Farinhas', quantity: 8, unit: 'L', min: 5, max: 30, cost: 9.90 },
    { id: 10, name: 'Salmão', category: 'Peixes', supplier: 'Pesca & Mar Frutos do Mar', quantity: 4, unit: 'kg', min: 4, max: 15, cost: 79.90 },
    { id: 11, name: 'Queijo Parmesão', category: 'Laticínios', supplier: 'Laticínios Família Minas', quantity: 6, unit: 'kg', min: 3, max: 15, cost: 49.90 },
    { id: 12, name: 'Tomate', category: 'Verduras', supplier: 'Hortifruti Verde Campo', quantity: 9, unit: 'kg', min: 5, max: 25, cost: 5.90 },
    { id: 13, name: 'Cebola', category: 'Verduras', supplier: 'Hortifruti Verde Campo', quantity: 14, unit: 'kg', min: 5, max: 20, cost: 4.50 },
    { id: 14, name: 'Alho', category: 'Verduras', supplier: 'Hortifruti Verde Campo', quantity: 3, unit: 'kg', min: 2, max: 8, cost: 18.90 },
    { id: 15, name: 'Coca-Cola 2L', category: 'Bebidas', supplier: 'Distribuidora Bebidas Total', quantity: 18, unit: 'un', min: 12, max: 60, cost: 11.50 },
    { id: 16, name: 'Cerveja Long Neck 355ml', category: 'Bebidas', supplier: 'Distribuidora Bebidas Total', quantity: 48, unit: 'un', min: 24, max: 120, cost: 4.50 },
    { id: 17, name: 'Vinho Tinto (garrafa)', category: 'Bebidas', supplier: 'Distribuidora Bebidas Total', quantity: 5, unit: 'un', min: 6, max: 24, cost: 35.90 },
    { id: 18, name: 'Manteiga', category: 'Laticínios', supplier: 'Laticínios Família Minas', quantity: 4, unit: 'kg', min: 2, max: 10, cost: 42.00 },
    { id: 19, name: 'Azeite Extra Virgem', category: 'Óleos', supplier: 'Armazém Grãos & Farinhas', quantity: 6, unit: 'L', min: 4, max: 15, cost: 38.90 },
    { id: 20, name: 'Chocolate 70%', category: 'Confeitaria', supplier: 'Armazém Grãos & Farinhas', quantity: 3, unit: 'kg', min: 2, max: 10, cost: 55.00 },
    { id: 21, name: 'Frango Inteiro', category: 'Aves', supplier: 'Frigorífico São Paulo Carnes', quantity: 10, unit: 'kg', min: 5, max: 30, cost: 12.90 },
    { id: 22, name: 'Batata Inglesa', category: 'Verduras', supplier: 'Hortifruti Verde Campo', quantity: 15, unit: 'kg', min: 8, max: 40, cost: 4.90 }
  ];

  purchases: PurchaseItem[] = [
    { id: 1, stockId: 4, name: 'Carne Seca', category: 'Carnes', supplier: 'Frigorífico São Paulo Carnes', quantity: 17, unit: 'kg', current: 3, min: 5, buy: 17, price: 58.00, total: 986.00, checked: false },
    { id: 2, stockId: 8, name: 'Peixe Fresco (Tilápia)', category: 'Peixes', supplier: 'Pesca & Mar Frutos do Mar', quantity: 18.5, unit: 'kg', current: 1.5, min: 3, buy: 18.5, price: 29.90, total: 553.15, checked: false },
    { id: 3, stockId: 17, name: 'Vinho Tinto (garrafa)', category: 'Bebidas', supplier: 'Distribuidora Bebidas Total', quantity: 19, unit: 'un', current: 5, min: 6, buy: 19, price: 35.90, total: 682.10, checked: false }
  ];

  suppliers: Supplier[] = [
    { id: 1, name: 'Frigorífico São Paulo Carnes', contact: 'Marcos Oliveira', category: 'Carnes', score: 5, lastOrder: '30 dias', manager: 'Marcos Oliveira', phone: '(11) 98765-4321', email: 'vendas@frigorifico-sp.com.br', address: 'Rua do Mercado, 340 — Vila Leopoldina, SP', categories: ['Carnes', 'Aves', 'Embutidos'], payment: '30 dias', monthlySpend: 4800, active: true },
    { id: 2, name: 'Hortifruti Verde Campo', contact: 'Ana Souza', category: 'Verduras', score: 5, lastOrder: 'À vista', manager: 'Ana Souza', phone: '(11) 97654-3210', email: 'compras@verdecampo.com.br', address: 'Ceagesp — Av. Dr. Gastão Vidigal, 1946, SP', categories: ['Verduras', 'Legumes', 'Frutas'], payment: 'À vista', monthlySpend: 1200, active: true },
    { id: 3, name: 'Distribuidora Bebidas Total', contact: 'Roberto Mendes', category: 'Bebidas', score: 4, lastOrder: '15 dias', manager: 'Roberto Mendes', phone: '(11) 96543-2109', email: 'roberto@bebidasTotal.com.br', address: 'Av. Industrial, 850 — Santo André, SP', categories: ['Refrigerantes', 'Águas', 'Cervejas', 'Vinhos'], payment: '15 dias', monthlySpend: 900, active: true },
    { id: 4, name: 'Armazém Grãos & Farinhas', contact: 'Claudia Pereira', category: 'Grãos', score: 5, lastOrder: '30 dias', manager: 'Claudia Pereira', phone: '(11) 95432-1098', email: 'claudia@graosfarinhas.com.br', address: 'Rua das Figueiras, 77 — Diadema, SP', categories: ['Arroz', 'Feijão', 'Farinha', 'Macarrão'], payment: '30 dias', monthlySpend: 700, active: true },
    { id: 5, name: 'Laticínios Família Minas', contact: 'José Carlos', category: 'Laticínios', score: 5, lastOrder: '15 dias', manager: 'José Carlos', phone: '(11) 94321-0987', email: 'josecarlos@familiaminas.com.br', address: 'Estrada Municipal, km 12 — Cotia, SP', categories: ['Queijos', 'Requeijão', 'Manteiga', 'Creme'], payment: '15 dias', monthlySpend: 580, active: true },
    { id: 6, name: 'Pesca & Mar Frutos do Mar', contact: 'Eduardo Lima', category: 'Peixes', score: 4, lastOrder: 'À vista', manager: 'Eduardo Lima', phone: '(11) 93210-9876', email: 'eduardo@pescamar.com.br', address: 'Mercado Municipal — Rua Cantareira, 306, SP', categories: ['Peixes', 'Frutos do Mar', 'Salmão'], payment: 'À vista', monthlySpend: 620, active: false }
  ];

  expenses: Expense[] = [
    { id: 1, date: '2026-03-03', description: 'Tomate', quantity: '2,5 kg', value: 9.50, category: 'Vencimento', reason: 'Vencimento', responsible: 'Maria' },
    { id: 2, date: '2026-03-02', description: 'Pão de Hambúrguer', quantity: '12 un', value: 8.40, category: 'Vencimento', reason: 'Vencimento', responsible: 'João' },
    { id: 3, date: '2026-03-01', description: 'Leite de Coco', quantity: '1 L', value: 7.50, category: 'Embalagem danificada', reason: 'Embalagem danificada', responsible: 'Maria' },
    { id: 4, date: '2026-02-28', description: 'Alface', quantity: '1 kg', value: 4.20, category: 'Qualidade ruim', reason: 'Qualidade ruim', responsible: 'Carlos' },
    { id: 5, date: '2026-02-27', description: 'Carne Moída', quantity: '0,8 kg', value: 22.40, category: 'Quebra operacional', reason: 'Quebra operacional', responsible: 'João' },
    { id: 6, date: '2026-02-26', description: 'Suco de Laranja', quantity: '3 L', value: 12.00, category: 'Vencimento', reason: 'Vencimento', responsible: 'Maria' },
    { id: 7, date: '2026-02-24', description: 'Queijo Mussarela', quantity: '0,5 kg', value: 14.50, category: 'Quebra operacional', reason: 'Quebra operacional', responsible: 'Carlos' },
    { id: 8, date: '2026-02-23', description: 'Ovo', quantity: '6 un', value: 3.60, category: 'Quebra acidental', reason: 'Quebra acidental', responsible: 'João' }
  ];

  employees: Employee[] = [
    { id: 1, name: 'Maria Oliveira', role: 'Cozinheira', shift: '07:00–15:00', status: 'ativo', productivity: 94, avatar: 'MO', salary: 2200, charges: 407, total: 2827, admission: '29/01/2024' },
    { id: 2, name: 'João Santos', role: 'Garçom', shift: '11:30–20:00', status: 'ativo', productivity: 90, avatar: 'JS', salary: 1800, charges: 333, total: 2313, admission: '14/02/2024' },
    { id: 3, name: 'Carlos Lima', role: 'Auxiliar de Cozinha', shift: '07:00–15:00', status: 'ativo', productivity: 88, avatar: 'CL', salary: 1540, charges: 280, total: 1985, admission: '08/07/2025' },
    { id: 4, name: 'Ana Ferreira', role: 'Caixa / Atendente', shift: '10:00–18:00', status: 'ativo', productivity: 91, avatar: 'AF', salary: 1750, charges: 324, total: 2184, admission: '31/08/2024' },
    { id: 5, name: 'Pedro Costa', role: 'Entregador', shift: '18:00–23:00', status: 'ativo', productivity: 86, avatar: 'PC', salary: 1513, charges: 280, total: 1950, admission: '19/04/2025' },
    { id: 6, name: 'Renata Souza', role: 'Atendente / Buffet', shift: '11:30–20:00', status: 'ativo', productivity: 92, avatar: 'RS', salary: 1630, charges: 296, total: 2056, admission: '04/09/2025' }
  ];

  serviceRows = [
    { type: 'Manutenção', title: 'Tapeçaria (cadeiras e estofados)', supplier: 'Estofamentos Paulina', due: '14/02/2026', value: 850, status: 'pago' },
    { type: 'Higiene', title: 'Dedetização e sanitização', supplier: 'PestControl SP', due: '19/02/2026', value: 420, status: 'pago' }
  ];

  financeRows = [
    { month: 'Out', profit: 11600, revenue: 28800, totalCost: 17200 },
    { month: 'Nov', profit: 13200, revenue: 32400, totalCost: 19200 },
    { month: 'Dez', profit: 20600, revenue: 45200, totalCost: 24600 },
    { month: 'Jan', profit: 12600, revenue: 32600, totalCost: 20000 },
    { month: 'Fev', profit: 14200, revenue: 35600, totalCost: 21400 },
    { month: 'Mar', profit: 5200, revenue: 12000, totalCost: 6800 }
  ];

  expenseBreakdown = [
    { label: 'Matéria-Prima', value: 7200, percent: 44, className: 'gold' },
    { label: 'Mão de Obra', value: 4800, percent: 29, className: 'purple' },
    { label: 'Aluguel', value: 2500, percent: 15, className: 'blue' },
    { label: 'Energia/Água', value: 980, percent: 6, className: 'green' },
    { label: 'Embalagens', value: 620, percent: 4, className: 'red' },
    { label: 'Marketing', value: 400, percent: 2, className: 'yellow' }
  ];

  weeklyOrders = [
    { day: 'Seg', value: 28 }, { day: 'Ter', value: 34 }, { day: 'Qua', value: 36 },
    { day: 'Qui', value: 52 }, { day: 'Sex', value: 68 }, { day: 'Sáb', value: 76 }, { day: 'Dom', value: 56 }
  ];

  topDishes = [
    { name: 'Feijoada', orders: 45, revenue: 990 },
    { name: 'Picanha', orders: 38, revenue: 1368 },
    { name: 'Moqueca', orders: 32, revenue: 832 },
    { name: 'Strogonoff', orders: 28, revenue: 644 },
    { name: 'Galinhada', orders: 24, revenue: 288 }
  ];

  foodBars = [
    { name: 'Feijoada', revenue: 1800, cost: 680, profit: 780 },
    { name: 'Picanha', revenue: 2100, cost: 720, profit: 1150 },
    { name: 'Moqueca', revenue: 1450, cost: 620, profit: 700 },
    { name: 'Strogonoff', revenue: 950, cost: 420, profit: 540 },
    { name: 'Galinhada', revenue: 620, cost: 260, profit: 240 }
  ];

  drinkMix = ['Capirinha', 'Cerveja', 'Suco Natural', 'Refrigerante', 'Gin Tônica', 'Vinho'];

  pointCards = [
    { id: 1, name: 'Maria Oliveira', role: 'Cozinheira', avatar: 'MO', entry: '06:58', exit: '15:03', planned: '07:00–15:00', status: 'normal', action: 'completed', accent: 'green' },
    { id: 2, name: 'João Santos', role: 'Garçom', avatar: 'JS', entry: '11:05', exit: '—', planned: '11:30–20:00', status: 'presente', action: 'exit', accent: 'blue' },
    { id: 3, name: 'Carlos Lima', role: 'Aux. Cozinha', avatar: 'CL', entry: '07:12', exit: '—', planned: '07:00–15:00', status: 'atrasado', action: 'exit', accent: 'orange' },
    { id: 4, name: 'Ana Ferreira', role: 'Caixa', avatar: 'AF', entry: '09:58', exit: '—', planned: '10:00–18:00', status: 'presente', action: 'exit', accent: 'blue' },
    { id: 5, name: 'Pedro Costa', role: 'Entregador', avatar: 'PC', entry: '—', exit: '—', planned: '18:00–23:00', status: 'ausente', action: 'entry', accent: 'gray' },
    { id: 6, name: 'Renata Souza', role: 'Atendente', avatar: 'RS', entry: '—', exit: '—', planned: '11:00–20:00', status: 'ausente', action: 'entry', accent: 'gray' }
  ];

  pointHistory = [
    { date: '08/03/2026', name: 'Maria Oliveira', entry: '06:58', exit: '15:03', hours: '08:05', status: 'normal' },
    { date: '08/03/2026', name: 'João Santos', entry: '11:05', exit: 'Em turno', hours: '—', status: 'presente' },
    { date: '08/03/2026', name: 'Carlos Lima', entry: '07:12', exit: 'Em turno', hours: '—', status: 'atraso' },
    { date: '08/03/2026', name: 'Ana Ferreira', entry: '09:58', exit: 'Em turno', hours: '—', status: 'presente' }
  ];

  freelancers = [
    { id: 1, name: 'Lucas Pereira', role: 'Cozinheiro Eventual', avatar: 'LP', status: 'ativo', city: 'Itatiba', pix: 'lucas-p@gmail.com', phone: '(11) 98765-4321', email: 'lucas-p@gmail.com', document: '123.456.789-00', since: '22/02/2026', specialty: 'Grelhados', rate: 180 },
    { id: 2, name: 'Fernanda Gomes', role: 'Garçonete', avatar: 'FG', status: 'ativo', city: 'Jundiaí', pix: '97665432100', phone: '(11) 97654-3210', email: 'fgomes@gmail.com', document: '987.654.321-10', since: '14/02/2026', specialty: 'Disponível fim de semana', rate: 150 },
    { id: 3, name: 'Roberto Dias', role: 'Auxiliar de Cozinha', avatar: 'RD', status: 'inativo', city: 'Bradesco', pix: '45678912300', phone: '(11) 96543-2100', email: 'roberto@hotmail.com', document: '456.789.123-00', since: '09/01/2026', specialty: 'Experiência com buffet', rate: 120 }
  ];

  chatMessages = [
    { from: 'Sistema', text: 'Entrada de Lucas Rocha registrada às 18:02.' },
    { from: 'Cozinha', text: 'Pedido #-002 entrou em preparação.' }
  ];

  monthlySeries = [
    { month: 'Out', revenue: 28800, cost: 17200, profit: 11600 },
    { month: 'Nov', revenue: 32400, cost: 19200, profit: 13200 },
    { month: 'Dez', revenue: 45200, cost: 24600, profit: 20600 },
    { month: 'Jan', revenue: 32600, cost: 20000, profit: 12600 },
    { month: 'Fev', revenue: 35600, cost: 21400, profit: 14200 },
    { month: 'Mar', revenue: 12000, cost: 6800, profit: 5200 }
  ];

  costDistribution = [
    { label: 'Matéria Prima', value: 7200 },
    { label: 'Mão de Obra', value: 4800 },
    { label: 'Aluguel', value: 2500 },
    { label: 'Energia/Água', value: 980 },
    { label: 'Embalagens', value: 620 },
    { label: 'Marketing', value: 400 }
  ];

  constructor() {
    this.loadSavedData();
  }

  get deliveryFirstName(): string {
    return this.deliveryProfile?.name.split(' ')[0] ?? '';
  }

  get deliveryAvailableCount(): number {
    return this.deliveryJobs.length;
  }

  enterDelivery(profile: DeliveryProfile): void {
    this.deliveryProfile = profile;
    this.deliveryLoggedIn = true;
    this.deliveryTab = 'disponiveis';
    this.deliveryFinishedToday = profile.deliveries;
    this.showDeliveryToast(`Bem-vindo(a), ${profile.name.split(' ')[0]}! 👋`);
  }

  exitDelivery(): void {
    this.deliveryLoggedIn = false;
    this.deliveryOnline = false;
    this.deliveryTab = 'disponiveis';
    this.deliveryProfile = null;
    this.deliveryGpsActive = false;
    this.deliveryGpsStatus = 'Aguardando permissão...';
    this.deliveryGpsCoords = '—';
    this.deliveryGpsAccuracy = '—';
    this.deliveryGpsTime = '—';
    if (this.gpsWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }
  }

  toggleDeliveryStatus(): void {
    this.deliveryOnline = !this.deliveryOnline;
    this.showDeliveryToast(this.deliveryOnline ? '🟢 Você está online!' : '🔴 Você está offline');
  }

  setDeliveryTab(tab: DeliveryTab): void {
    this.deliveryTab = tab;
    if (tab === 'rastreador') this.activateDeliveryGps();
  }

  activateDeliveryGps(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.setMockDeliveryLocation('GPS não suportado pelo navegador');
      return;
    }

    this.deliveryGpsStatus = 'Obtendo localização...';
    if (this.gpsWatchId !== null) navigator.geolocation.clearWatch(this.gpsWatchId);

    this.gpsWatchId = navigator.geolocation.watchPosition(
      position => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        this.deliveryGpsActive = true;
        this.deliveryGpsStatus = '✅ GPS Ativo';
        this.deliveryGpsCoords = `${lat}, ${lng}`;
        this.deliveryGpsAccuracy = `±${Math.round(position.coords.accuracy)} metros`;
        this.deliveryGpsTime = new Date().toLocaleTimeString('pt-BR');
      },
      error => this.setMockDeliveryLocation(`Erro GPS: ${error.message}`),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  setMockDeliveryLocation(message = 'GPS simulado ativo'): void {
    this.deliveryGpsActive = true;
    this.deliveryGpsStatus = message;
    this.deliveryGpsCoords = '-23.664000, -46.779000';
    this.deliveryGpsAccuracy = 'simulado';
    this.deliveryGpsTime = new Date().toLocaleTimeString('pt-BR');
    this.showDeliveryToast('📍 Localização de demonstração ativada');
  }

  acceptDelivery(job: DeliveryJob): void {
    if (!this.deliveryOnline) {
      this.showDeliveryToast('⚠️ Fique online para aceitar pedidos!');
      return;
    }
    if (this.activeDelivery) {
      this.showDeliveryToast('⚠️ Finalize a entrega ativa primeiro.');
      return;
    }
    this.deliveryJobs = this.deliveryJobs.filter(item => item.id !== job.id);
    this.activeDelivery = { ...job, acceptedAt: new Date().toLocaleTimeString('pt-BR') };
    this.deliveryTab = 'ativas';
    this.showDeliveryToast('✅ Pedido aceito! Boa entrega 🛵');
  }

  declineDelivery(job: DeliveryJob): void {
    this.deliveryJobs = this.deliveryJobs.filter(item => item.id !== job.id);
    this.showDeliveryToast('Pedido recusado');
  }

  finishDelivery(): void {
    if (!this.activeDelivery) return;
    this.deliveryEarnings += this.activeDelivery.price;
    this.deliveryFinishedToday++;
    this.deliveryHistory.unshift({
      client: this.activeDelivery.client,
      when: `Agora · Pedido #${this.activeDelivery.id}`,
      price: this.activeDelivery.price
    });
    this.showDeliveryToast(`🎉 Entrega concluída! + ${this.formatCurrency(this.activeDelivery.price)}`);
    this.activeDelivery = null;
  }

  openMaps(lat: number, lng: number): void {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }

  openWaze(lat: number, lng: number): void {
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  }

  openDeliveryRoute(job: DeliveryJob | ActiveDeliveryJob): void {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}`, '_blank');
  }

  showDeliveryToast(message: string): void {
    this.deliveryToast = message;
    if (this.deliveryToastTimer) clearTimeout(this.deliveryToastTimer);
    this.deliveryToastTimer = setTimeout(() => this.deliveryToast = '', 2800);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  setPage(page: Page): void {
    this.page = page;
    this.selectedOrder = null;
    this.selectedDish = null;
  }

  setStoreStatus(status: StoreStatus): void {
    this.storeStatus = status;
  }

  get filteredOrders(): Order[] {
    const start = this.dateToNumber(this.filterStart);
    const end = this.dateToNumber(this.filterEnd);
    return this.orders.filter(order => {
      const d = this.dateToNumber(order.date);
      return d >= start && d <= end;
    });
  }

  get activeOrders(): Order[] {
    return this.orders.filter(order => order.status === 'PREPARANDO' || order.status === 'PRONTO');
  }

  get activeOrdersCount(): number {
    return this.activeOrders.length;
  }

  get filteredRevenue(): number {
    return this.filteredOrders
      .filter(order => order.status !== 'CANCELADO')
      .reduce((sum, order) => sum + order.total, 0);
  }

  get filteredFinishedOrders(): number {
    return this.filteredOrders.filter(order => order.status !== 'CANCELADO').length;
  }

  get criticalItems(): StockItem[] {
    return this.stockItems.filter(item => item.quantity < item.min);
  }

  get lowItemsCount(): number {
    return this.stockItems.filter(item => this.stockStatus(item) === 'baixo').length;
  }

  get stockValue(): number {
    return Math.round(this.stockItems.reduce((sum, item) => sum + item.quantity * item.cost, 0) * 100) / 100;
  }

  get pendingPurchasesTotal(): number {
    return this.purchases.filter(item => !item.checked).reduce((sum, item) => sum + (item.total ?? item.price), 0);
  }

  get visiblePurchases(): PurchaseItem[] {
    return this.purchases.filter(item => !item.checked);
  }

  get expensesTotal(): number {
    return this.expenses.reduce((sum, expense) => sum + expense.value, 0);
  }

  get revenueSixMonths(): number {
    return this.monthlySeries.reduce((sum, item) => sum + item.revenue, 0);
  }

  get profitSixMonths(): number {
    return 77400;
  }

  get marginContribution(): number {
    return 36.9;
  }

  setOwnerTab(tab: OwnerTab): void {
    this.ownerTab = tab;
  }

  get okItemsCount(): number {
    return this.stockItems.filter(item => this.stockStatus(item) === 'ok').length;
  }

  get filteredStockItems(): StockItem[] {
    const search = this.stockSearch.trim().toLowerCase();
    return this.stockItems.filter(item => {
      const matchesSearch = !search || [item.name, item.category, item.supplier].some(value => value.toLowerCase().includes(search));
      const status = this.stockStatus(item);
      const matchesFilter = this.stockFilter === 'all' ||
        (this.stockFilter === 'critical' && status === 'critico') ||
        (this.stockFilter === 'low' && status === 'baixo') ||
        (this.stockFilter === 'ok' && status === 'ok');
      return matchesSearch && matchesFilter;
    });
  }

  get shoppingLowItems(): StockItem[] {
    return this.stockItems.filter(item => this.stockStatus(item) === 'baixo');
  }

  get supplierActiveCount(): number {
    return this.suppliers.filter(supplier => supplier.active).length;
  }

  get supplierInactiveCount(): number {
    return this.suppliers.length - this.supplierActiveCount;
  }

  get payrollTotal(): number {
    return 13280;
  }

  get salaryAverage(): number {
    return 1722.667;
  }

  get payrollCharges(): number {
    return 2944;
  }

  get fixedCosts(): number {
    return 8680;
  }

  get variableCosts(): number {
    return 7820;
  }

  get totalExpensesMonth(): number {
    return 16500;
  }

  get activeFreelancers(): number {
    return this.freelancers.filter(item => item.status === 'ativo').length;
  }

  get pendingFreelancers(): number {
    return this.freelancers.filter(item => item.status === 'pendente').length;
  }

  get freelancerAverageRate(): number {
    return 150;
  }

  get filteredFreelancers() {
    const search = this.freelancerSearch.trim().toLowerCase();
    return this.freelancers.filter(item => {
      const matchesSearch = !search || [item.name, item.role, item.email].some(value => value.toLowerCase().includes(search));
      const matchesFilter = this.freelancerFilter === 'all' || item.status === this.freelancerFilter;
      return matchesSearch && matchesFilter;
    });
  }

  get filteredClients(): Client[] {
    const search = this.clientSearch.trim().toLowerCase();
    return this.clients.filter(client => !search || [client.name, client.phone, client.email, client.address, client.neighborhood, client.notes].some(value => value.toLowerCase().includes(search)));
  }

  get completedOrders(): Order[] {
    return this.orders.filter(order => order.status === 'ENTREGUE');
  }

  get analyticsFilteredOrders(): Order[] {
    const start = this.dateToNumber(this.analyticsStart);
    const end = this.dateToNumber(this.analyticsEnd);
    const search = this.analyticsSearch.trim().toLowerCase();
    return this.orders.filter(order => {
      const d = this.dateToNumber(order.date);
      const matchesDate = d >= start && d <= end;
      const matchesSearch = !search || [order.id, order.client, order.address, order.status, order.items.join(' ')].some(value => value.toLowerCase().includes(search));
      return matchesDate && matchesSearch;
    });
  }

  get analyticsCompletedOrders(): Order[] {
    return this.analyticsFilteredOrders.filter(order => order.status === 'ENTREGUE');
  }

  get analyticsRevenue(): number {
    return this.analyticsCompletedOrders.reduce((sum, order) => sum + order.total, 0);
  }

  get analyticsAverageTicket(): number {
    return this.analyticsCompletedOrders.length ? this.analyticsRevenue / this.analyticsCompletedOrders.length : 0;
  }

  get analyticsCancelledCount(): number {
    return this.analyticsFilteredOrders.filter(order => order.status === 'CANCELADO').length;
  }

  get analyticsSummary(): Array<{ label: string; value: string; className: string }> {
    return [
      { label: 'Pedidos no período', value: String(this.analyticsCompletedOrders.length), className: 'blue' },
      { label: 'Receita no período', value: this.formatCurrency(this.analyticsRevenue), className: 'gold' },
      { label: 'Ticket médio', value: this.formatCurrency(this.analyticsAverageTicket), className: 'green' },
      { label: 'Cancelados', value: String(this.analyticsCancelledCount), className: 'purple' }
    ];
  }

  ownerStockStatusLabel(item: StockItem): string {
    const status = this.stockStatus(item);
    if (status === 'critico') return 'Crítico';
    if (status === 'baixo') return 'Baixo';
    return 'OK';
  }

  stockPercent(item: StockItem): number {
    return Math.max(4, Math.min(100, Math.round((item.quantity / item.max) * 100)));
  }

  shortSupplier(value: string): string {
    return value.length > 23 ? value.slice(0, 23) + '...' : value;
  }

  starString(score: number): string {
    return '★★★★★'.slice(0, score) + '☆☆☆☆☆'.slice(0, 5 - score);
  }

  maxValue<T>(items: T[], key: keyof T): number {
    return Math.max(...items.map(item => Number(item[key]) || 0), 1);
  }

  barWidth(value: number, max: number): number {
    return Math.max(3, Math.round((value / Math.max(max, 1)) * 100));
  }

  addMockLoss(): void {
    this.showExpenseForm = !this.showExpenseForm;
  }

  toggleFreelancer(freelancer: { status: string }): void {
    freelancer.status = freelancer.status === 'ativo' ? 'inativo' : 'ativo';
  }

  togglePoint(person: { action: string; exit: string; entry: string; status: string }): void {
    if (person.action === 'entry') {
      person.entry = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      person.status = 'presente';
      person.action = 'exit';
      return;
    }
    if (person.action === 'exit') {
      person.exit = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      person.status = 'normal';
      person.action = 'completed';
    }
  }

  toggleOrderStatus(order: Order): void {
    const next: Record<OrderStatus, OrderStatus> = {
      PREPARANDO: 'PRONTO',
      PRONTO: 'ENTREGUE',
      ENTREGUE: 'PREPARANDO',
      CANCELADO: 'PREPARANDO'
    };
    order.status = next[order.status];
  }

  cancelOrder(order: Order): void {
    order.status = 'CANCELADO';
  }

  selectDish(dish: Dish): void {
    this.selectedDish = { ...dish };
  }

  saveDish(): void {
    if (this.selectedDish) {
      const index = this.dishes.findIndex(item => item.id === this.selectedDish?.id);
      if (index >= 0) this.dishes[index] = { ...this.selectedDish };
      this.selectedDish = null;
      this.saveDishes();
      return;
    }
    if (!this.newDish.name.trim() || this.newDish.price <= 0) return;
    this.dishes.unshift({ id: Date.now(), ...this.newDish, name: this.newDish.name.trim() });
    this.newDish = { name: '', category: 'Principal', price: 0, active: true, description: '', prepTime: 20, ingredients: '' };
    this.saveDishes();
  }

  removeDish(id: number): void {
    this.dishes = this.dishes.filter(item => item.id !== id);
    this.saveDishes();
  }

  toggleDish(dish: Dish): void {
    dish.active = !dish.active;
    this.saveDishes();
  }

  stockStatus(item: StockItem): 'critico' | 'baixo' | 'ok' {
    if (item.quantity < item.min) return 'critico';
    if (item.quantity <= item.min) return 'baixo';
    return 'ok';
  }

  stockStep(item: StockItem): number {
    return item.unit === 'un' ? 1 : 0.5;
  }

  adjustStock(item: StockItem, direction: 1 | -1): void {
    const next = item.quantity + direction * this.stockStep(item);
    item.quantity = Math.max(0, Math.round(next * 10) / 10);
    this.saveStockItems();
  }

  setStockQuantity(item: StockItem, value: string | number): void {
    const next = Number(value);
    if (!Number.isFinite(next)) return;
    item.quantity = Math.max(0, Math.round(next * 10) / 10);
    this.saveStockItems();
  }

  saveStockItem(): void {
    if (!this.newStockItem.name.trim() || this.newStockItem.max <= 0 || this.newStockItem.cost < 0) return;
    this.stockItems.unshift({
      id: Date.now(),
      ...this.newStockItem,
      name: this.newStockItem.name.trim(),
      supplier: this.newStockItem.supplier.trim() || 'Manual',
      quantity: Math.max(0, Number(this.newStockItem.quantity) || 0),
      min: Math.max(0, Number(this.newStockItem.min) || 0),
      max: Math.max(1, Number(this.newStockItem.max) || 1),
      cost: Math.max(0, Number(this.newStockItem.cost) || 0)
    });
    this.newStockItem = { name: '', quantity: 0, unit: 'kg', min: 1, max: 10, cost: 0, category: 'Grãos', supplier: 'Manual' };
    this.saveStockItems();
  }

  removeStockItem(id: number): void {
    this.stockItems = this.stockItems.filter(item => item.id !== id);
    this.saveStockItems();
  }

  markPurchase(item: PurchaseItem): void {
    item.checked = !item.checked;
    this.savePurchases();
  }

  generateCriticalPurchaseList(): void {
    this.syncPurchaseListFromStock();
  }

  createPurchaseFromCritical(item: StockItem): void {
    const existing = this.findPurchaseForStock(item);
    const buy = this.calculateBuyQuantity(item);
    const data: PurchaseItem = {
      id: existing?.id ?? Date.now() + item.id,
      stockId: item.id,
      name: item.name,
      quantity: buy,
      unit: item.unit,
      supplier: item.supplier,
      price: item.cost,
      checked: false,
      category: item.category,
      current: item.quantity,
      min: item.min,
      buy,
      total: Math.round(buy * item.cost * 100) / 100
    };

    if (existing) {
      Object.assign(existing, data);
      return;
    }
    this.purchases.unshift(data);
  }

  receivePurchase(item: PurchaseItem): void {
    const stock = this.findStockForPurchase(item);
    if (stock) {
      const amount = Number(item.buy ?? item.quantity) || 0;
      stock.quantity = Math.round((stock.quantity + amount) * 10) / 10;
      this.purchases = this.purchases.filter(purchase => purchase.id !== item.id);
      this.saveStockItems();
      this.savePurchases();
      return;
    }
    item.checked = true;
    this.savePurchases();
  }

  addExpense(): void {
    if (!this.newExpense.description.trim() || Number(this.newExpense.value) <= 0) return;
    const record: Expense = {
      id: Date.now(),
      description: this.newExpense.description.trim(),
      date: this.newExpense.date || new Date().toISOString().slice(0, 10),
      category: this.newExpense.category || this.newExpense.reason || 'Manual',
      value: Math.max(0, Number(this.newExpense.value) || 0),
      quantity: (this.newExpense.quantity || '').trim() || '1 un',
      reason: (this.newExpense.reason || this.newExpense.category || 'Manual').trim(),
      responsible: (this.newExpense.responsible || 'Equipe').trim()
    };
    this.expenses.unshift(record);
    this.applyExpenseStockDecrease(record);
    this.newExpense = { description: '', date: new Date().toISOString().slice(0, 10), category: 'Vencimento', value: 0, quantity: '', reason: 'Vencimento', responsible: '' };
    this.showExpenseForm = false;
    this.saveExpenses();
  }

  removeExpense(id: number): void {
    this.expenses = this.expenses.filter(item => item.id !== id);
    this.saveExpenses();
  }

  saveSupplier(): void {
    if (!this.newSupplier.name.trim() || !this.newSupplier.manager.trim()) return;
    const categories = this.parseSupplierCategories(this.newSupplier.categoriesText || this.newSupplier.category);
    this.suppliers.unshift({
      id: Date.now(),
      name: this.newSupplier.name.trim(),
      contact: this.newSupplier.manager.trim(),
      manager: this.newSupplier.manager.trim(),
      phone: this.newSupplier.phone.trim(),
      email: this.newSupplier.email.trim(),
      address: this.newSupplier.address.trim(),
      category: this.newSupplier.category.trim() || categories[0] || 'Geral',
      categories,
      payment: this.newSupplier.payment.trim() || 'À vista',
      monthlySpend: Math.max(0, Number(this.newSupplier.monthlySpend) || 0),
      score: Math.max(1, Math.min(5, Number(this.newSupplier.score) || 5)),
      lastOrder: this.newSupplier.payment.trim() || 'À vista',
      active: this.newSupplier.active
    });
    this.newSupplier = this.emptySupplierForm();
    this.showSupplierForm = false;
    this.saveSuppliers();
  }

  toggleSupplier(supplier: Supplier): void {
    supplier.active = !supplier.active;
    this.saveSuppliers();
  }

  removeSupplier(id: number): void {
    this.suppliers = this.suppliers.filter(supplier => supplier.id !== id);
    this.saveSuppliers();
  }

  saveClient(): void {
    if (!this.newClient.name.trim() || !this.newClient.phone.trim()) return;
    this.clients.unshift({
      id: Date.now(),
      ...this.newClient,
      name: this.newClient.name.trim(),
      phone: this.newClient.phone.trim(),
      email: this.newClient.email.trim(),
      address: this.newClient.address.trim(),
      neighborhood: this.newClient.neighborhood.trim(),
      notes: this.newClient.notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      totalOrders: 0,
      totalSpent: 0,
      lastOrder: 'Sem pedidos'
    });
    this.newClient = { name: '', phone: '', email: '', address: '', neighborhood: '', notes: '' };
    this.saveClients();
  }

  removeClient(id: number): void {
    this.clients = this.clients.filter(client => client.id !== id);
    this.saveClients();
  }

  clientInitials(name: string): string {
    return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  sendChat(): void {
    if (!this.chatDraft.trim()) return;
    this.chatMessages.push({ from: 'Você', text: this.chatDraft.trim() });
    this.chatDraft = '';
  }

  dataPoint(value: number, max: number, index: number): string {
    const x = 30 + index * 92;
    const y = 190 - (value / max) * 130;
    return `${x},${y}`;
  }

  get revenuePolyline(): string {
    const max = Math.max(...this.monthlySeries.map(item => item.revenue));
    return this.monthlySeries.map((item, index) => this.dataPoint(item.revenue, max, index)).join(' ');
  }

  get profitPolyline(): string {
    const max = Math.max(...this.monthlySeries.map(item => item.revenue));
    return this.monthlySeries.map((item, index) => this.dataPoint(item.profit, max, index)).join(' ');
  }

  get revenueArea(): string {
    return `30,190 ${this.revenuePolyline} 490,190`;
  }

  trackById<T extends { id: number | string }>(_index: number, item: T): number | string {
    return item.id;
  }

  private syncPurchaseListFromStock(): void {
    const stockIdsToRemove = new Set<number>();

    this.stockItems.forEach(item => {
      const existing = this.findPurchaseForStock(item);
      if (item.quantity < item.min) {
        this.createPurchaseFromCritical(item);
        return;
      }
      if (existing) stockIdsToRemove.add(existing.id);
    });

    if (stockIdsToRemove.size) {
      this.purchases = this.purchases.filter(item => !stockIdsToRemove.has(item.id));
    }
    this.savePurchases();
  }

  private findPurchaseForStock(item: StockItem): PurchaseItem | undefined {
    const normalizedName = this.normalizeText(item.name);
    return this.purchases.find(purchase => purchase.stockId === item.id || this.normalizeText(purchase.name) === normalizedName);
  }

  private findStockForPurchase(item: PurchaseItem): StockItem | undefined {
    const normalizedName = this.normalizeText(item.name);
    return this.stockItems.find(stock => stock.id === item.stockId || this.normalizeText(stock.name) === normalizedName);
  }

  private calculateBuyQuantity(item: StockItem): number {
    return Math.max(0, Math.round((item.max - item.quantity) * 10) / 10);
  }

  private applyExpenseStockDecrease(expense: Expense): void {
    const amount = this.parseQuantityAmount(expense.quantity || '');
    if (amount <= 0) return;
    const normalizedDescription = this.normalizeText(expense.description);
    const stock = this.stockItems.find(item => normalizedDescription.includes(this.normalizeText(item.name)) || this.normalizeText(item.name).includes(normalizedDescription));
    if (!stock) return;
    stock.quantity = Math.max(0, Math.round((stock.quantity - amount) * 10) / 10);
    this.saveStockItems();
  }

  private parseQuantityAmount(value: string): number {
    const match = value.replace(',', '.').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  }

  private emptySupplierForm(): SupplierForm {
    return {
      name: '',
      manager: '',
      phone: '',
      email: '',
      address: '',
      category: 'Geral',
      categoriesText: '',
      payment: 'À vista',
      monthlySpend: 0,
      score: 5,
      active: true
    };
  }

  private parseSupplierCategories(value: string): string[] {
    const categories = value.split(',').map(item => item.trim()).filter(Boolean);
    return categories.length ? categories : ['Geral'];
  }

  private normalizeText(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  private loadSavedData(): void {
    this.clients = this.loadData<Client[]>('clients', this.clients);
    this.dishes = this.loadData<Dish[]>('dishes', this.dishes);
    this.stockItems = this.loadData<StockItem[]>('stock-items', this.stockItems);
    this.suppliers = this.loadData<Supplier[]>('suppliers', this.suppliers);
    this.expenses = this.loadData<Expense[]>('expenses', this.expenses);
    this.purchases = this.loadData<PurchaseItem[]>('purchases', this.purchases);
    this.syncPurchaseListFromStock();
  }

  private saveClients(): void {
    this.saveData('clients', this.clients);
  }

  private saveDishes(): void {
    this.saveData('dishes', this.dishes);
  }

  private saveStockItems(): void {
    this.syncPurchaseListFromStock();
    this.saveData('stock-items', this.stockItems);
  }

  private savePurchases(): void {
    this.saveData('purchases', this.purchases);
  }

  private saveSuppliers(): void {
    this.saveData('suppliers', this.suppliers);
  }

  private saveExpenses(): void {
    this.saveData('expenses', this.expenses);
  }

  private loadData<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(`emidio-${key}`);
      return raw ? JSON.parse(raw) as T : fallback;
    } catch {
      return fallback;
    }
  }

  private saveData(key: string, value: unknown): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`emidio-${key}`, JSON.stringify(value));
    } catch {
      // O navegador pode bloquear armazenamento em modo privado; nesse caso a tela continua funcionando em memória.
    }
  }

  private dateToNumber(value: string): number {
    return Number(value.replace(/-/g, ''));
  }
}
