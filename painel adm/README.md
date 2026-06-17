# EMÍDIO Angular Clone

Projeto Angular com painel do restaurante, Olho do Dono, estoque, cardápio, clientes, analytics e painel de entregador.

## Rodar

```bash
npm install
npm start
```

Depois abra: `http://localhost:4200`

## Atualizações incluídas

- Lista de compras sincronizada com o estoque: quando a quantidade sobe acima do mínimo, o item sai automaticamente da lista.
- Botão "Dar entrada" na Lista de Compras: soma a quantidade recomendada no estoque e remove o item da lista.
- Novo fornecedor funcionando: abre formulário manual, salva no navegador, permite ativar/desativar e excluir.
- Registrar Dispensa manual: formulário com item, quantidade, custo, motivo, responsável e data.
- Dispensa baixa estoque automaticamente quando o nome do item registrado existe no estoque.
- Dados salvos no navegador via localStorage.
