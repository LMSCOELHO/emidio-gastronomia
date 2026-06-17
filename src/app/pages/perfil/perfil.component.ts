import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  fotoPerfil = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  nomeCliente = 'Cliente';
  totalPedidos = 0;
  desconto = '';
  enderecoSalvo = '';
  cartaoSalvo = '';

  private emailLogado: string | null = null;
  private usuarios: any[] = [];

  ngOnInit() {
    this.emailLogado = localStorage.getItem('usuarioLogado');
    this.usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const pedidosClientes: any = JSON.parse(localStorage.getItem('pedidosClientes') || '{}');
    const usuario = this.usuarios.find((u: any) => u.email === this.emailLogado);

    if (usuario) {
      this.nomeCliente = '👋 ' + usuario.nome;
      this.totalPedidos = pedidosClientes[this.emailLogado!] || 0;
      this.desconto = this.totalPedidos >= 10
        ? '🎉 Você ganhou 15% OFF'
        : `⭐ Faltam ${10 - this.totalPedidos} pedidos para ganhar 15% OFF`;
      if (usuario.endereco) this.enderecoSalvo = usuario.endereco;
      if (usuario.cartao) this.cartaoSalvo = usuario.cartao;
      if (usuario.foto) this.fotoPerfil = usuario.foto;
    }
  }

  onFileChange(event: any) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (e: any) => { this.fotoPerfil = e.target.result; };
    leitor.readAsDataURL(arquivo);
  }

  salvarPerfil() {
    const usuario = this.usuarios.find((u: any) => u.email === this.emailLogado);
    if (!usuario) { alert('Usuário não encontrado!'); return; }
    usuario.endereco = this.enderecoSalvo;
    usuario.cartao = this.cartaoSalvo;
    usuario.foto = this.fotoPerfil;
    localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    alert('Perfil salvo com sucesso!');
  }

  finalizarPedido() {
    if (!this.emailLogado) { alert('Faça login primeiro!'); return; }
    const pedidos: any = JSON.parse(localStorage.getItem('pedidosClientes') || '{}');
    if (!pedidos[this.emailLogado]) pedidos[this.emailLogado] = 0;
    pedidos[this.emailLogado]++;
    localStorage.setItem('pedidosClientes', JSON.stringify(pedidos));
    alert('Pedido realizado com sucesso!');
    this.ngOnInit();
  }
}
