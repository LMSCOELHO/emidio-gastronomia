import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { LocalizacaoComponent } from './pages/localizacao/localizacao.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { PainelAdmComponent } from './pages/painel-adm/painel-adm.component';
import { PainelCozinhaComponent } from './pages/painel-cozinha/painel-cozinha.component';
import { CardapioAngularComponent } from './pages/cardapio-angular/cardapio-angular.component';
import { PainelMotoboyComponent } from './pages/painel-motoboy/painel-motoboy.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'localizacao', component: LocalizacaoComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'painel-adm', component: PainelAdmComponent },
  { path: 'painel-cozinha', component: PainelCozinhaComponent },
  { path: 'painel-motoboy', component: PainelMotoboyComponent },

  { path: 'cardapio', component: CardapioAngularComponent },
  { path: 'cardapio-angular', component: CardapioAngularComponent },

  { path: '**', redirectTo: 'inicio' }
];