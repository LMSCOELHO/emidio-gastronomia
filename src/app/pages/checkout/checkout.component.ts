import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  pagamentoSelecionado = 'PIX';
  distanciaKm = 0;
  subtotal = 0;

  constructor(private location: Location) {
    // Carrega o subtotal do localStorage (ajuste conforme sua estrutura)
    const cartData = localStorage.getItem('carrinho');
    if (cartData) {
      const items = JSON.parse(cartData);
      this.subtotal = items.reduce((sum: number, item: any) => sum + (item.preco * item.quantidade), 0);
    }
  }

  calcularTaxaEntrega() {
    return Math.max(7, this.distanciaKm * 1.5);
  }

  getTotalComTaxa() {
    return this.subtotal + this.calcularTaxaEntrega();
  }

  voltar() { this.location.back(); }

  selecionarPagamento(metodo: string) {
    this.pagamentoSelecionado = metodo;
  }

  finalizarPedido() {
    const taxa = this.calcularTaxaEntrega();
    const total = this.getTotalComTaxa();
    
    alert(
      `Pedido confirmado!\n\n` +
      `Subtotal: R$ ${this.subtotal.toFixed(2)}\n` +
      `Taxa Entrega (${this.distanciaKm}km): R$ ${taxa.toFixed(2)}\n` +
      `Total: R$ ${total.toFixed(2)}\n` +
      `Pagamento: ${this.pagamentoSelecionado}`
    );
  }
}