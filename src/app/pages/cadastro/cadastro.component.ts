import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  nome = '';
  email = '';
  senha = '';
  erro = '';

  constructor(private router: Router) {}

  cadastrar() {
    this.erro = '';
    const nome = this.nome.trim();
    const email = this.email.trim();
    const senha = this.senha.trim();

    const usuarios: any[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const emailJaExiste = usuarios.find((u: any) => u.email === email);

    if (emailJaExiste) {
      this.erro = 'Esse e-mail já está cadastrado.';
      return;
    }

    usuarios.push({ nome, email, senha });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('Conta criada com sucesso!');
    this.router.navigate(['/login']);
  }

  voltar() {
    if (history.length > 1) history.back();
    else this.router.navigate(['/inicio']);
  }
}
