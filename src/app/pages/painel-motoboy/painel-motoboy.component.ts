import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

type PerfilMotoboy = {
  nome: string;
  rating: string;
  entregas: number;
  avatar: string;
  cor?: string;
};

type PedidoMotoboy = {
  id: string;
  cliente: string;
  preco: number;
  distancia: string;
  tempo: string;
  retirada: string;
  entrega: string;
  lat: number;
  lng: number;
};

type EntregaAtiva = PedidoMotoboy & {
  status: string;
};

@Component({
  selector: 'app-painel-motoboy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './painel-motoboy.component.html',
  styleUrls: ['./painel-motoboy.component.css']
})
export class PainelMotoboyComponent implements OnDestroy {
  logado = false;
  online = false;
  abaAtiva = 'disponiveis';
  toastMessage = '';
  toastVisible = false;
  toastTimer: any;
  gpsWatchId: number | null = null;
  gpsStatus = 'Aguardando permissao...';
  gpsCoords = '-';
  gpsPrecisao = '-';
  gpsHora = '-';
  locStatus = 'Aguardando GPS...';
  posAtual: GeolocationPosition | null = null;
  ganhos = 0;
  entregasHoje = 0;

  perfilSelecionado: PerfilMotoboy | null = null;
  entregaAtiva: EntregaAtiva | null = null;

  perfis: PerfilMotoboy[] = [
    { nome: 'Carlos Silva', rating: '4.8', entregas: 342, avatar: 'CS' },
    { nome: 'Maria Santos', rating: '4.9', entregas: 518, avatar: 'MS', cor: '#c0392b' }
  ];

  pedidosDisponiveis: PedidoMotoboy[] = [
    {
      id: 've-001',
      cliente: 'Joao Silva',
      preco: 8.5,
      distancia: '2,4 km',
      tempo: '~14 min',
      retirada: 'Emidio Gastronomia - Capao Redondo',
      entrega: 'Rua das Flores, 123 - Capao Redondo',
      lat: -23.664,
      lng: -46.779
    },
    {
      id: 've-003',
      cliente: 'Carlos Lima',
      preco: 10,
      distancia: '3,2 km',
      tempo: '~18 min',
      retirada: 'Emidio Gastronomia - Capao Redondo',
      entrega: 'Rua Vergueiro, 3000 - Vila Mariana',
      lat: -23.588,
      lng: -46.643
    },
    {
      id: 've-005',
      cliente: 'Ana Rodrigues',
      preco: 12,
      distancia: '4,1 km',
      tempo: '~22 min',
      retirada: 'Emidio Gastronomia - Capao Redondo',
      entrega: 'Av. Paulista, 900 - Bela Vista',
      lat: -23.561,
      lng: -46.656
    }
  ];

  historico = [
    { cliente: 'Fernanda Costa', data: 'Hoje, 11:32 - Pedido #ve-001', preco: 9.5 },
    { cliente: 'Roberto Alves', data: 'Hoje, 10:15 - Pedido #ve-002', preco: 7 },
    { cliente: 'Patricia Mendes', data: 'Ontem, 19:44 - Pedido #ve-003', preco: 11 },
    { cliente: 'Lucas Teixeira', data: 'Ontem, 18:20 - Pedido #ve-002', preco: 8.5 }
  ];

  constructor(private router: Router) {}

  ngOnDestroy() {
    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
    }

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  entrar(perfil: PerfilMotoboy) {
    this.perfilSelecionado = perfil;
    this.entregasHoje = perfil.entregas;
    this.logado = true;
    this.showToast('Bem-vindo(a), ' + perfil.nome.split(' ')[0] + '!');
  }

  sair() {
    this.logado = false;
    this.online = false;
    this.abaAtiva = 'disponiveis';
    this.entregaAtiva = null;

    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }
  }

  voltarCardapio() {
    this.router.navigate(['/cardapio']);
  }

  setOnline(checked: boolean) {
    this.online = checked;
    this.showToast(this.online ? 'Voce esta online!' : 'Voce esta offline');
  }

  mudarAba(aba: string) {
    this.abaAtiva = aba;

    if (aba === 'rastreador') {
      this.ativarGPS();
    }
  }

  ativarGPS() {
    if (!navigator.geolocation) {
      this.gpsStatus = 'GPS nao suportado';
      this.locStatus = 'Nao foi possivel obter localizacao';
      return;
    }

    this.gpsStatus = 'Obtendo localizacao...';
    this.locStatus = 'Localizando...';

    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
    }

    this.gpsWatchId = navigator.geolocation.watchPosition(
      pos => {
        this.posAtual = pos;
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        this.gpsStatus = 'GPS Ativo';
        this.gpsCoords = lat + ', ' + lng;
        this.gpsPrecisao = '+/- ' + Math.round(pos.coords.accuracy) + ' metros';
        this.gpsHora = new Date().toLocaleTimeString('pt-BR');
        this.locStatus = 'Lat: ' + lat + ' - Lng: ' + lng;
      },
      err => {
        this.gpsStatus = 'Erro: ' + err.message;
        this.locStatus = 'Nao foi possivel obter localizacao';
        this.showToast('Erro GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  aceitarPedido(pedido: PedidoMotoboy) {
    if (!this.online) {
      this.showToast('Fique online para aceitar pedidos.');
      return;
    }

    this.pedidosDisponiveis = this.pedidosDisponiveis.filter(item => item.id !== pedido.id);
    this.entregaAtiva = { ...pedido, status: 'EM ANDAMENTO' };
    this.showToast('Pedido aceito. Boa entrega!');
  }

  recusarPedido(pedido: PedidoMotoboy) {
    this.pedidosDisponiveis = this.pedidosDisponiveis.filter(item => item.id !== pedido.id);
    this.showToast('Pedido recusado');
  }

  finalizarEntrega() {
    if (!this.entregaAtiva) return;

    this.ganhos += this.entregaAtiva.preco;
    this.entregasHoje++;
    this.historico.unshift({
      cliente: this.entregaAtiva.cliente,
      data: 'Agora - Pedido #' + this.entregaAtiva.id,
      preco: this.entregaAtiva.preco
    });
    this.entregaAtiva = null;
    this.showToast('Entrega concluida!');
  }

  abrirMaps(lat: number, lng: number) {
    window.open('https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng, '_blank');
  }

  abrirWaze(lat: number, lng: number) {
    window.open('https://waze.com/ul?ll=' + lat + ',' + lng + '&navigate=yes', '_blank');
  }

  verRota(pedido: PedidoMotoboy) {
    if (!this.posAtual) {
      this.showToast('Ative o GPS para ver a rota.');
      return;
    }

    const lat = this.posAtual.coords.latitude;
    const lng = this.posAtual.coords.longitude;
    window.open('https://www.google.com/maps/dir/' + lat + ',' + lng + '/' + pedido.lat + ',' + pedido.lng, '_blank');
  }

  dinheiro(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  showToast(mensagem: string) {
    this.toastMessage = mensagem;
    this.toastVisible = true;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 2800);
  }
}
