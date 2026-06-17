import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';

interface Perfil {
  nome: string;
  rating: string;
  entregas: number;
  cor?: string;
}

interface Pedido {
  id: string;
  cardId: string;
  cliente: string;
  preco: number;
  precoTexto: string;
  distancia: string;
  tempo: string;
  origem: string;
  destino: string;
  lat: number;
  lng: number;
  recusando?: boolean;
}

interface HistoricoItem {
  nome: string;
  data: string;
  pedido: string;
  precoTexto: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnDestroy {
  perfilLogado: Perfil | null = null;
  online = false;
  entregasTotal = 0;
  ganhos = 0;
  pedidoAtivo: Pedido | null = null;
  tabAtual: 'disponiveis' | 'rastreador' | 'ativas' | 'historico' = 'disponiveis';

  gpsWatchId: number | null = null;
  posAtual: GeolocationPosition | null = null;
  gpsStatus = 'Aguardando permissão...';
  gpsCoords = '—';
  gpsPrecisao = '—';
  gpsHora = '—';
  locStatus = 'Aguardando GPS...';
  gpsAtivo = false;
  pinAnimando = false;

  toastMensagem = '';
  toastVisivel = false;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  pedidosDisponiveis: Pedido[] = [
    {
      id: 've-001',
      cardId: 'card-ve001',
      cliente: 'João Silva',
      preco: 8.5,
      precoTexto: 'R$ 8,50',
      distancia: '2,4 km',
      tempo: '~14 min',
      origem: 'Emídio Gastronomia — Capão Redondo',
      destino: 'Rua das Flores, 123 – Capão Redondo',
      lat: -23.664,
      lng: -46.779
    },
    {
      id: 've-003',
      cardId: 'card-ve003',
      cliente: 'Carlos Lima',
      preco: 10,
      precoTexto: 'R$ 10,00',
      distancia: '3,2 km',
      tempo: '~18 min',
      origem: 'Emídio Gastronomia — Capão Redondo',
      destino: 'Rua Vergueiro, 3000 – Vila Mariana',
      lat: -23.588,
      lng: -46.643
    },
    {
      id: 've-005',
      cardId: 'card-ve005',
      cliente: 'Ana Rodrigues',
      preco: 12,
      precoTexto: 'R$ 12,00',
      distancia: '4,1 km',
      tempo: '~22 min',
      origem: 'Emídio Gastronomia — Capão Redondo',
      destino: 'Av. Paulista, 900 – Bela Vista',
      lat: -23.561,
      lng: -46.656
    }
  ];

  historico: HistoricoItem[] = [
    { nome: 'Fernanda Costa', data: 'Hoje, 11:32', pedido: 've-001', precoTexto: 'R$ 9,50' },
    { nome: 'Roberto Alves', data: 'Hoje, 10:15', pedido: 've-002', precoTexto: 'R$ 7,00' },
    { nome: 'Patricia Mendes', data: 'Ontem, 19:44', pedido: 've-003', precoTexto: 'R$ 11,00' },
    { nome: 'Lucas Teixeira', data: 'Ontem, 18:20', pedido: 've-002', precoTexto: 'R$ 8,50' }
  ];

  get headerAvatar(): string {
    return this.perfilLogado ? this.iniciais(this.perfilLogado.nome) : 'CS';
  }

  get headerNome(): string {
    return this.perfilLogado ? `Olá, ${this.perfilLogado.nome.split(' ')[0]}!` : 'Olá, Carlos!';
  }

  get headerRating(): string {
    if (!this.perfilLogado) return '⭐ 4.8 · 342 entregas';
    return `⭐ ${this.perfilLogado.rating} · ${this.entregasTotal} entregas`;
  }

  get ganhosTexto(): string {
    return this.formatarMoeda(this.ganhos);
  }

  entrar(nome: string, rating: string, entregas: number, cor?: string): void {
    this.perfilLogado = { nome, rating, entregas, cor };
    this.entregasTotal = entregas;
    this.tabAtual = 'disponiveis';
    this.online = false;
    this.showToast('Bem-vindo(a), ' + nome.split(' ')[0] + '! 👋');
  }

  sair(): void {
    this.perfilLogado = null;
    this.online = false;
    this.pararGPS(true);
  }

  toggleStatus(event: Event): void {
    this.online = (event.target as HTMLInputElement).checked;
    this.showToast(this.online ? '🟢 Você está online!' : '🔴 Você está offline');
  }

  mudarTab(tab: 'disponiveis' | 'rastreador' | 'ativas' | 'historico'): void {
    this.tabAtual = tab;
    if (tab === 'rastreador') {
      this.ativarGPS();
    }
  }

  ativarGPS(): void {
    if (!navigator.geolocation) {
      this.gpsStatus = 'GPS não suportado';
      this.gpsAtivo = false;
      return;
    }

    this.gpsStatus = 'Obtendo localização...';
    this.locStatus = 'Localizando...';
    this.gpsAtivo = false;

    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }

    this.gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.posAtual = pos;
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const acc = Math.round(pos.coords.accuracy);
        const agora = new Date().toLocaleTimeString('pt-BR');

        this.gpsStatus = '✅ GPS Ativo';
        this.gpsCoords = lat + ', ' + lng;
        this.gpsPrecisao = '±' + acc + ' metros';
        this.gpsHora = agora;
        this.locStatus = '📍 Lat: ' + lat + ' · Lng: ' + lng;
        this.gpsAtivo = true;
        this.animarPin();
      },
      (err) => {
        this.gpsStatus = 'Erro: ' + err.message;
        this.locStatus = 'Não foi possível obter localização';
        this.gpsAtivo = false;
        this.showToast('❌ Erro GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  animarPin(): void {
    this.pinAnimando = true;
    setTimeout(() => (this.pinAnimando = false), 300);
  }

  aceitarPedido(pedido: Pedido): void {
    if (!this.online) {
      this.showToast('⚠️ Fique online para aceitar pedidos!');
      return;
    }

    this.pedidosDisponiveis = this.pedidosDisponiveis.filter((p) => p.cardId !== pedido.cardId);
    this.pedidoAtivo = pedido;
    this.showToast('✅ Pedido aceito! Boa entrega 🛵');
  }

  recusarPedido(pedido: Pedido): void {
    pedido.recusando = true;
    setTimeout(() => {
      this.pedidosDisponiveis = this.pedidosDisponiveis.filter((p) => p.cardId !== pedido.cardId);
    }, 300);
    this.showToast('Pedido recusado');
  }

  finalizarEntrega(precoTexto: string): void {
    const valor = Number(precoTexto.replace('R$ ', '').replace(',', '.')) || 0;
    this.ganhos += valor;
    this.entregasTotal++;

    if (this.pedidoAtivo) {
      this.historico.unshift({
        nome: this.pedidoAtivo.cliente,
        data: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        pedido: this.pedidoAtivo.id,
        precoTexto
      });
    }

    this.pedidoAtivo = null;
    this.showToast('🎉 Entrega concluída! + ' + precoTexto);
  }

  abrirMaps(lat: number, lng: number): void {
    window.open('https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng, '_blank');
  }

  abrirWaze(lat: number, lng: number): void {
    window.open('https://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes', '_blank');
  }

  verRota(pedido: Pedido): void {
    this.showToast('Abrindo rota para o pedido #' + pedido.id.replace('-', '') + '...');
    if (this.posAtual) {
      const lat = this.posAtual.coords.latitude;
      const lng = this.posAtual.coords.longitude;
      window.open('https://www.google.com/maps/dir/' + lat + ',' + lng + '/' + pedido.lat + ',' + pedido.lng, '_blank');
    } else {
      this.showToast('⚠️ Ative o GPS para ver a rota a partir de você');
    }
  }

  voltarCardapio(): void {
    this.showToast('Voltando ao cardápio...');
  }

  showToast(msg: string): void {
    this.toastMensagem = msg;
    this.toastVisivel = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisivel = false;
    }, 2800);
  }

  iniciais(nome: string): string {
    return nome
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  formatarMoeda(valor: number): string {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }

  private pararGPS(resetTela: boolean): void {
    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }

    if (resetTela) {
      this.posAtual = null;
      this.gpsStatus = 'Aguardando permissão...';
      this.gpsCoords = '—';
      this.gpsPrecisao = '—';
      this.gpsHora = '—';
      this.locStatus = 'Aguardando GPS...';
      this.gpsAtivo = false;
    }
  }

  ngOnDestroy(): void {
    this.pararGPS(false);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
