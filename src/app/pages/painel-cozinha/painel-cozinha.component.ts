import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

interface Pedido {
  id: number;
  numero: string;
  cliente: string;
  itens: Array<{ quantidade: number; nome: string }>;
  status: 'aguardando' | 'em_preparo' | 'pronto';
  local: string;
  valor: number;
  criadoEm: number;
  tempoDecorrido?: number;
}

@Component({
  selector: 'app-painel-cozinha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './painel-cozinha.component.html',
  styleUrls: ['./painel-cozinha.component.css']
})
export class PainelCozinhaComponent implements OnInit, OnDestroy {
  abaAtiva: 'aguardando' | 'em_preparo' | 'pronto' = 'aguardando';
  tempoAtual = Date.now();
  private timerSubscription?: Subscription;

  pedidos: Pedido[] = [
    {
      id: 1,
      numero: '#001',
      cliente: 'Ana Souza',
      itens: [
        { quantidade: 1, nome: 'Moqueca de Peixe' },
        { quantidade: 2, nome: 'Suco de Laranja' }
      ],
      status: 'aguardando',
      local: 'Mesa 4',
      valor: 70.00,
      criadoEm: Date.now() - 300000
    },
    {
      id: 2,
      numero: '#002',
      cliente: 'Carlos Mendes',
      itens: [
        { quantidade: 1, nome: 'Feijoada Completa' },
        { quantidade: 1, nome: 'Gim Tônica' }
      ],
      status: 'em_preparo',
      local: 'Delivery',
      valor: 60.90,
      criadoEm: Date.now() - 150000
    },
    {
      id: 3,
      numero: '#003',
      cliente: 'Mariana Costa',
      itens: [
        { quantidade: 2, nome: 'Baião de Dois' },
        { quantidade: 1, nome: 'Água Mineral' }
      ],
      status: 'pronto',
      local: 'Mesa 2',
      valor: 72.00,
      criadoEm: Date.now() - 600000
    }
  ];

  statusOnline = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.carregarPedidos();
    this.iniciarTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private iniciarTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.tempoAtual = Date.now();
    });
  }

  get pedidosAguardando() {
    return this.pedidos.filter(p => p.status === 'aguardando');
  }

  get pedidosEmPreparo() {
    return this.pedidos.filter(p => p.status === 'em_preparo');
  }

  get pedidosProntos() {
    return this.pedidos.filter(p => p.status === 'pronto');
  }

  get totalAtivos() {
    return this.pedidos.filter(p => p.status !== 'pronto').length;
  }

  get countAguardando() {
    return this.pedidosAguardando.length;
  }

  get countEmPreparo() {
    return this.pedidosEmPreparo.length;
  }

  get countProntos() {
    return this.pedidosProntos.length;
  }

  getTempoDecorrido(pedido: Pedido): string {
    const minutos = Math.floor((this.tempoAtual - pedido.criadoEm) / 60000);
    const segundos = Math.floor(((this.tempoAtual - pedido.criadoEm) % 60000) / 1000);
    
    if (minutos > 0) {
      return `${minutos}m ${segundos}s`;
    }
    return `${segundos}s`;
  }

  getUrgencia(pedido: Pedido): 'urgente' | 'normal' | 'novo' {
    const minutos = (this.tempoAtual - pedido.criadoEm) / 60000;
    if (minutos > 10) return 'urgente';
    if (minutos > 3) return 'normal';
    return 'novo';
  }

  selecionarAba(aba: 'aguardando' | 'em_preparo' | 'pronto'): void {
    this.abaAtiva = aba;
  }

  iniciarPreparo(pedido: Pedido): void {
    pedido.status = 'em_preparo';
    this.salvarPedidos();
  }

  marcarPronto(pedido: Pedido): void {
    pedido.status = 'pronto';
    this.salvarPedidos();
  }

  entregarPedido(pedido: Pedido): void {
    this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
    this.salvarPedidos();
    this.mostrarNotificacao(`Pedido ${pedido.numero} entregue!`);
  }

  pausarCozinha(): void {
    this.statusOnline = !this.statusOnline;
  }

  private mostrarNotificacao(mensagem: string): void {
    alert(mensagem);
  }

  private carregarPedidos(): void {
    try {
      const pedidosCozinha = localStorage.getItem('pedidosCozinha');
      if (pedidosCozinha) {
        const dados = JSON.parse(pedidosCozinha);
        this.pedidos = dados.map((p: any) => ({
          id: p.id,
          numero: `#${String(p.id).padStart(3, '0')}`,
          cliente: p.cliente,
          itens: p.itens || [],
          status: 'aguardando',
          local: p.tipoEntrega === 'Delivery' ? '🚚 Delivery' : '🏪 Retirada',
          valor: p.valor,
          criadoEm: p.criadoEm || Date.now()
        }));
      }
    } catch (error) {
      console.log('Erro ao carregar pedidos:', error);
    }
  }

  private salvarPedidos(): void {
    localStorage.setItem('pedidosCozinha', JSON.stringify(this.pedidos));
  }

  sair(): void {
    localStorage.removeItem('tipoUsuario');
    this.router.navigate(['/inicio']);
  }
}