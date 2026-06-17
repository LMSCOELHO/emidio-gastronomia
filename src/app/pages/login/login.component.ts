import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';

  constructor(private router: Router) {}

  fazerLogin(): void {
    const emailLower = this.email.trim().toLowerCase();
    const senhaDigitada = this.senha.trim();

    this.erro = '';

    // LOGIN DO ADM
    if (
      (emailLower === 'adm@gmail.com' || emailLower === 'adm@email.com') &&
      senhaDigitada === '123456'
    ) {
      alert('Bem-vindo ADM!');

      localStorage.setItem('tipoUsuario', 'admin');
      localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: 'Administrador',
        email: emailLower,
        tipo: 'admin'
      }));

      this.router.navigate(['/painel-adm']);
      return;
    }

    // LOGIN DA COZINHA
    if (
      (emailLower === 'cozinha@gmail.com' || emailLower === 'cozinhaadmin@gmail.com') &&
      senhaDigitada === '123456'
    ) {
      alert('Bem-vindo Cozinha!');

      localStorage.setItem('tipoUsuario', 'cozinha');
      localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: 'Cozinha',
        email: emailLower,
        tipo: 'cozinha'
      }));

      this.router.navigate(['/painel-cozinha']);
      return;
    }

    // LOGIN DO MOTOBOY
    if (emailLower === 'motoboy@gmail.com' && senhaDigitada === '123456') {
      alert('Bem-vindo Motoboy!');

      localStorage.setItem('tipoUsuario', 'motoboy');
      localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: 'Motoboy',
        email: emailLower,
        tipo: 'motoboy'
      }));

      this.router.navigate(['/painel-motoboy']);
      return;
    }

    // LOGIN DE CLIENTE NORMAL
    const usuarios: any[] = JSON.parse(localStorage.getItem('usuarios') || '[]');

    const usuario = usuarios.find((u: any) =>
      u.email?.toLowerCase() === emailLower &&
      u.senha === senhaDigitada
    );

    if (usuario) {
      localStorage.setItem('tipoUsuario', 'cliente');
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

      const pedidosClientes: any = JSON.parse(localStorage.getItem('pedidosClientes') || '{}');
      const totalPedidos = pedidosClientes[emailLower] || 0;

      let mensagem = `Bem-vindo de volta, ${usuario.nome}! Você já fez ${totalPedidos} pedido(s).`;

      if (totalPedidos >= 10) {
        mensagem += ' 🎉 Você ganhou 15% de desconto!';
      }

      alert(mensagem);
      this.router.navigate(['/cardapio']);
      return;
    }

    this.erro = 'Usuário não cadastrado!';
    alert('Usuário não cadastrado!');
  }

  // Deixei esse também caso seu HTML esteja chamando login()
  login(): void {
    this.fazerLogin();
  }

  recuperarSenha(): void {
    const emailDigitado = prompt('Digite o e-mail cadastrado:');

    if (!emailDigitado) return;

    const email = emailDigitado.trim().toLowerCase();
    const usuarios: any[] = JSON.parse(localStorage.getItem('usuarios') || '[]');

    const usuario = usuarios.find((u: any) =>
      u.email?.toLowerCase() === email
    );

    if (usuario) {
      alert(`Senha encontrada!\n\nE-mail: ${usuario.email}\nSenha: ${usuario.senha}`);
    } else {
      alert('E-mail não encontrado. Crie uma conta primeiro.');
    }
  }

  voltar(): void {
    this.router.navigate(['/inicio']);
  }
}