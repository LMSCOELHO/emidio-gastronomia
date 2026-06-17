import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var Chart: any;
declare var L: any;

@Component({
  selector: 'app-painel-adm',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './painel-adm.component.html',
  styleUrls: ['./painel-adm.component.css']
})
export class PainelAdmComponent implements OnInit, AfterViewInit, OnDestroy {

  activeSection = 'dashboard';
  activeOwnerTab = 'visao';
  pageTitle = 'Dashboard';
  toastMessage = '';
  toastVisible = false;
  toastTimeout: any;
  modalVisible = false;

  // Forms
  dishName = '';
  dishPrice: number | null = null;
  dishIng = 'Carne Seca';
  clientName = 'Cliente Teste';
  selectDishValue = '';
  selectDriverValue = '';
  stockSearch = '';
  newItemName = '';
  newItemCat = '';
  newItemQty: number | null = null;
  newItemCost: number | null = null;

  state: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    const saved = localStorage.getItem('emidioPanelV2');

    if (saved) {
      this.state = JSON.parse(saved);
    } else {
      this.state = {
        stock: [
          {name:'Filé Peito',cat:'Aves',supplier:'Armazém Online & Produtos',qty:25,unit:'kg',min:10,cost:18},
          {name:'Arroz Agulhinha',cat:'Grãos',supplier:'Armazém Online & Produtos',qty:48,unit:'kg',min:20,cost:6},
          {name:'Carne Seca',cat:'Carnes',supplier:'Frigorífico São Paulo Carnes',qty:3,unit:'kg',min:10,cost:45},
          {name:'Linguiça Calabresa',cat:'Embutidos',supplier:'Distribuidora Sabores Total',qty:12,unit:'kg',min:8,cost:22},
          {name:'Peixe Fresco',cat:'Peixes',supplier:'Peixes & Mar Frutos do Mar',qty:1.5,unit:'kg',min:5,cost:39},
          {name:'Queijo Mussarela',cat:'Laticínios',supplier:'Laticínios Família Minas',qty:6,unit:'kg',min:4,cost:31},
          {name:'Vinho Tinto',cat:'Bebidas',supplier:'Distribuidora Bebidas Total',qty:5,unit:'un',min:10,cost:38},
          {name:'Cebola',cat:'Verduras',supplier:'Hortifruti Verde Campo',qty:14,unit:'kg',min:5,cost:4}
        ],
        dishes: [
          {name:'Baião de Dois',price:72,ing:'Carne Seca',use:1},
          {name:'Peixe Executivo',price:60.9,ing:'Peixe Fresco',use:0.5},
          {name:'Macarrão Especial',price:49.9,ing:'Queijo Mussarela',use:0.3}
        ],
        orders: [
          {id:'003',client:'Mariana Costa',dish:'Baião de Dois',price:72,status:'Pronto',driver:'João Silva',date:'29/04/2026 23:55'},
          {id:'002',client:'Carlos Mendes',dish:'Peixe Executivo',price:60.9,status:'Preparando',driver:'Carlos Lima',date:'30/04/2026 00:05'}
        ],
        drivers: [
          {name:'João Silva',phone:'1197777-1111',status:'online',lat:-23.7161,lng:-46.8492,order:'Mariana Costa',battery:89},
          {name:'Carlos Lima',phone:'1197777-2222',status:'online',lat:-23.7132,lng:-46.8556,order:'Carlos Mendes',battery:76},
          {name:'Pedro Santos',phone:'1197777-3333',status:'offline',lat:-23.7205,lng:-46.8425,order:'Sem pedido',battery:42}
        ],
        clients: [
          {name:'Mariana Costa',phone:'1198888-0101',orders:6,total:430,status:'VIP'},
          {name:'Carlos Mendes',phone:'1198888-0202',orders:2,total:130.9,status:'Ativo'},
          {name:'Ana Souza',phone:'1198888-0303',orders:1,total:70,status:'Ativo'}
        ],
        expenses: [
          {date:'30/04/2026',item:'Transporte',qty:'25 km',cost:82.1,status:'Vazamento',resp:'Maria'},
          {date:'29/04/2026',item:'Gás de cozinha',qty:'1 un',cost:118,status:'Operação normal',resp:'João'}
        ]
      };
    }

    if (this.state.dishes.length > 0) {
      this.selectDishValue = this.state.dishes[0].name;
    }

    if (this.state.drivers.length > 0) {
      this.selectDriverValue = this.state.drivers[0].name;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.activeSection === 'owner' && this.activeOwnerTab === 'visao') {
        this.drawCharts();
      }
    }, 200);
  }

  ngOnDestroy() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  sair() {
    localStorage.removeItem('tipoUsuario');
    localStorage.removeItem('usuarioLogado');
    this.router.navigate(['/inicio']);
  }

  save() {
    localStorage.setItem('emidioPanelV2', JSON.stringify(this.state));
    this.cdr.detectChanges();
  }

  toast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
    }, 2200);
  }

  setSection(section: string, title: string) {
    this.activeSection = section;
    this.pageTitle = title;

    if (section === 'motoboy') {
      setTimeout(() => this.initMap(), 150);
    }

    if (section === 'owner') {
      this.activeOwnerTab = 'visao';
      setTimeout(() => this.drawCharts(), 200);
    }
  }

  setOwnerTab(tab: string) {
    this.activeOwnerTab = tab;

    if (tab === 'visao') {
      setTimeout(() => this.drawCharts(), 100);
    }

    if (tab === 'financeiro') {
      setTimeout(() => this.drawBar(), 100);
    }
  }

  money(v: number) {
    return v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  get activeOrders() {
    return this.state.orders.filter((o: any) => o.status !== 'Finalizado').length;
  }

  get dayRevenue() {
    return this.money(
      this.state.orders
        .filter((o: any) => o.status === 'Pronto' || o.status === 'Finalizado')
        .reduce((s: number, o: any) => s + o.price, 0)
    );
  }

  get stockValue() {
    return this.money(
      this.state.stock.reduce((s: number, i: any) => s + i.qty * i.cost, 0)
    );
  }

  get itemsCount() {
    return this.state.stock.length + ' itens cadastrados';
  }

  get driversOnline() {
    return this.state.drivers.filter((d: any) => d.status === 'online').length;
  }

  get alertCount() {
    return this.state.stock.filter((i: any) => i.qty <= i.min).length;
  }

  get criticalItems() {
    return this.state.stock.filter((i: any) => i.qty <= i.min);
  }

  get totalStockValue() {
    return this.money(
      this.state.stock.reduce((s: number, i: any) => s + i.qty * i.cost, 0)
    );
  }

  get criticalCount() {
    return this.state.stock.filter((i: any) => i.qty <= i.min).length;
  }

  get lowCount() {
    return this.state.stock.filter((i: any) => i.qty > i.min && i.qty <= i.min * 1.5).length;
  }

  get okCount() {
    return this.state.stock.filter((i: any) => i.qty > i.min * 1.5).length;
  }

  get totalExpenses() {
    return this.money(
      this.state.expenses.reduce((s: number, e: any) => s + e.cost, 0)
    );
  }

  get filteredStock() {
    const q = this.stockSearch.toLowerCase();

    return this.state.stock.filter((i: any) =>
      (i.name + i.cat + i.supplier).toLowerCase().includes(q)
    );
  }

  get reversedOrders() {
    return [...this.state.orders].reverse();
  }

  getOrderIndex(reversedIndex: number) {
    return this.state.orders.length - 1 - reversedIndex;
  }

  stockStatus(item: any) {
    if (item.qty <= item.min) return 'Crítico';
    if (item.qty <= item.min * 1.5) return 'Baixo';
    return 'OK';
  }

  stockBadgeClass(item: any) {
    if (item.qty <= item.min) return 'crit';
    if (item.qty <= item.min * 1.5) return 'low';
    return 'ok';
  }

  stockProgress(item: any) {
    return Math.min(100, (item.qty / (item.min * 3)) * 100);
  }

  orderBadgeClass(status: string) {
    if (status === 'Pronto') return 'ok';
    if (status === 'Preparando') return 'prep';
    if (status === 'Confirmado') return 'conf';
    return 'ok';
  }

  addDish() {
    if (!this.dishName || !this.dishPrice) {
      this.toast('Preencha nome e preço');
      return;
    }

    this.state.dishes.push({
      name: this.dishName,
      price: this.dishPrice,
      ing: this.dishIng,
      use: 1
    });

    this.dishName = '';
    this.dishPrice = null;

    this.save();
    this.toast('Prato adicionado');
  }

  removeDish(i: number) {
    this.state.dishes.splice(i, 1);
    this.save();
    this.toast('Prato removido');
  }

  createOrder() {
    const dish = this.state.dishes.find((d: any) => d.name === this.selectDishValue);

    if (!dish) {
      this.toast('Selecione um prato');
      return;
    }

    const stock = this.state.stock.find((s: any) => s.name === dish.ing);

    if (!stock || stock.qty < dish.use) {
      this.toast('Sem estoque suficiente para ' + dish.ing);
      return;
    }

    stock.qty = +(stock.qty - dish.use).toFixed(2);

    const id = String(this.state.orders.length + 1).padStart(3, '0');
    const client = this.clientName || 'Cliente';

    this.state.orders.push({
      id,
      client,
      dish: dish.name,
      price: dish.price,
      status: 'Confirmado',
      driver: this.selectDriverValue,
      date: new Date().toLocaleString('pt-BR')
    });

    const dr = this.state.drivers.find((d: any) => d.name === this.selectDriverValue);

    if (dr) {
      dr.order = client;
    }

    const cl = this.state.clients.find((c: any) => c.name === client);

    if (cl) {
      cl.orders++;
      cl.total += dish.price;
    } else {
      this.state.clients.push({
        name: client,
        phone: 'Não informado',
        orders: 1,
        total: dish.price,
        status: 'Ativo'
      });
    }

    this.save();
    this.toast('Pedido criado e estoque baixado automaticamente');
  }

  changeOrder(i: number, status: string) {
    this.state.orders[i].status = status;
    this.save();
    this.toast('Pedido atualizado para ' + status);
  }

  restock(i: number) {
    this.state.stock[i].qty += 5;
    this.save();
    this.toast('Estoque atualizado');
  }

  removeStock(i: number) {
    this.state.stock[i].qty = Math.max(0, this.state.stock[i].qty - 1);
    this.save();
    this.toast('Estoque baixado');
  }

  buyCritical() {
    this.state.stock.forEach((i: any) => {
      if (i.qty <= i.min) {
        i.qty = i.min * 3;
      }
    });

    this.save();
    this.toast('Itens críticos repostos');
  }

  addExpense() {
    this.state.expenses.push({
      date: new Date().toLocaleDateString('pt-BR'),
      item: 'Despesa manual',
      qty: '1 un',
      cost: 50,
      status: 'Operação normal',
      resp: 'Admin'
    });

    this.save();
    this.toast('Despesa registrada');
  }

  saveNewStockItem() {
    if (!this.newItemName) {
      this.toast('Digite o nome do item');
      return;
    }

    this.state.stock.push({
      name: this.newItemName,
      cat: this.newItemCat || 'Geral',
      supplier: 'Fornecedor Padrão',
      qty: Number(this.newItemQty) || 0,
      unit: 'kg',
      min: 5,
      cost: Number(this.newItemCost) || 0
    });

    this.modalVisible = false;
    this.newItemName = '';
    this.newItemCat = '';
    this.newItemQty = null;
    this.newItemCost = null;

    this.save();
    this.toast('Item adicionado ao estoque');
  }

  // MAPA
  private map: any = null;
  private markers: any[] = [];

  initMap() {
    if (!L) return;

    if (this.map) {
      this.map.invalidateSize();
      this.refreshMarkers();
      return;
    }

    this.map = L.map('map').setView([-23.7161, -46.8492], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.refreshMarkers();
  }

  refreshMarkers() {
    if (!this.map) return;

    this.markers.forEach(m => m.remove());

    this.markers = this.state.drivers.map((d: any) =>
      L.marker([d.lat, d.lng])
        .addTo(this.map)
        .bindPopup(`<b>${d.name}</b><br>${d.status}<br>Pedido: ${d.order}<br>${d.phone}`)
    );
  }

  selectDriverMap(i: number) {
    const d = this.state.drivers[i];

    if (this.map) {
      this.map.setView([d.lat, d.lng], 16);
      this.markers[i]?.openPopup();
    }

    this.state.drivers.forEach((_: any, idx: number) => {
      document.querySelectorAll('.driver')[idx]?.classList.remove('active');
    });

    document.querySelectorAll('.driver')[i]?.classList.add('active');
  }

  centerAllDrivers() {
    if (!this.map || !this.markers.length) return;

    const group = L.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds().pad(0.3));
  }

  simulateDriverMove() {
    this.state.drivers.forEach((d: any) => {
      if (d.status === 'online') {
        d.lat += (Math.random() - 0.5) / 1000;
        d.lng += (Math.random() - 0.5) / 1000;
        d.battery = Math.max(1, d.battery - 1);
      }
    });

    this.save();
    this.refreshMarkers();
    this.toast('Localização dos motoboys atualizada');
  }

  // GRÁFICOS
  private lineChart: any = null;
  private pieChart: any = null;
  private barChart: any = null;

  drawCharts() {
    if (!Chart) return;

    const lc = document.getElementById('lineChart') as HTMLCanvasElement;
    const pc = document.getElementById('pieChart') as HTMLCanvasElement;

    if (!lc || !pc) return;

    if (this.lineChart) this.lineChart.destroy();
    if (this.pieChart) this.pieChart.destroy();

    this.lineChart = new Chart(lc, {
      type: 'line',
      data: {
        labels: ['Out','Nov','Dez','Jan','Fev','Mar'],
        datasets: [
          {
            label: 'Receita',
            data: [28,32,45,31,34,20],
            borderColor: '#e4b928',
            backgroundColor: 'rgba(228,185,40,.15)',
            fill: true
          },
          {
            label: 'Lucro',
            data: [12,14,20,13,15,8],
            borderColor: '#00d084',
            backgroundColor: 'rgba(0,208,132,.12)',
            fill: true
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#777'
            }
          },
          y: {
            ticks: {
              color: '#777'
            }
          }
        }
      }
    });

    this.pieChart = new Chart(pc, {
      type: 'doughnut',
      data: {
        labels: ['Matéria-prima','Mão de obra','Aluguel','Energia'],
        datasets: [
          {
            data: [7200,4800,2300,900],
            backgroundColor: ['#e4b928','#bf75ff','#56a8ff','#ff6b6b']
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          }
        }
      }
    });
  }

  drawBar() {
    if (!Chart) return;

    const bc = document.getElementById('barChart') as HTMLCanvasElement;

    if (!bc) return;

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(bc, {
      type: 'bar',
      data: {
        labels: ['Out','Nov','Dez','Jan','Fev','Mar'],
        datasets: [
          {
            label: 'Receita',
            data: [9,10,14,10,11,5],
            backgroundColor: '#e4b928'
          },
          {
            label: 'Custo',
            data: [6,6.5,8,6.3,7,3.5],
            backgroundColor: '#ff6b6b'
          },
          {
            label: 'Lucro',
            data: [4,4.2,7,4,4.5,2],
            backgroundColor: '#00d084'
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#777'
            }
          },
          y: {
            ticks: {
              color: '#777'
            }
          }
        }
      }
    });
  }

  suppliers = [
    'Frigorífico São Paulo Carnes',
    'Hortifruti Verde Campo',
    'Distribuidora Bebidas Total',
    'Armazém Online & Produtos',
    'Laticínios Família Minas',
    'Peixes & Mar Frutos do Mar'
  ];
}