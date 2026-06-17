import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';

  constructor(private router: Router) {}

  fazerLogin() {
    const emailLower = this.email.trim().toLowerCase();
    const senhaDigitada = this.senha.trim();

    this.erro = '';

    login() {
  if (this.email === 'adm@email.com' && this.senha === '123456') {
    localStorage.setItem('usuarioLogado', JSON.stringify({
      nome: 'Administrador',
      email: this.email,
      tipo: 'admin'
    }));

    this.router.navigate(['/painel-adm']);
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

  const usuarioEncontrado = usuarios.find((u: any) =>
    u.email === this.email && u.senha === this.senha
  );

  if (!usuarioEncontrado) {
    alert('Usuário não cadastrado!');
    return;
  }

  localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
  this.router.navigate(['/inicio']);
}

    // LOGIN DA COZINHA
    if (emailLower === 'cozinha@gmail.com' && senhaDigitada === '123456') {
      alert('Bem-vindo Cozinha!');
      localStorage.setItem('tipoUsuario', 'cozinha');
      this.router.navigate(['/painel-cozinha']);
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
      localStorage.setItem('usuarioLogado', emailLower);

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

  recuperarSenha() {
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

  voltar() {
    this.router.navigate(['/inicio']);
  }
}
