import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-localizacao',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './localizacao.component.html',
  styleUrls: ['./localizacao.component.css']
})
export class LocalizacaoComponent {
  constructor(private location: Location) {}
  voltar() { this.location.back(); }
}
