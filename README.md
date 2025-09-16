# pinDrop2 Jquery

**pinDro2p** é um plugin em jQuery que permite arrastar e soltar pinos sobre uma imagem, podendo movê-los, removê-los e limpar todos de uma vez.  
Ideal para mapas interativos, plantas baixas ou qualquer aplicação visual que exija posicionamento dinâmico de marcadores.

---

## 📦 Dependências
- [jQuery](https://jquery.com/) (>= 3.7.1)
- [Bootstrap](https://getbootstrap.com/) (>= 5.3.7)

---

## 🚀 Inicialização

```javascript
pinDrop2({
    imgContainerSelector: 'seuSelector',    // Elemento que receberá os pinos
    removeAllButtonSelector: 'seuSelector'. // Botão para limpar todos os pinos
    confirmMessage: 'sua mensagem'          // Msg de confirmação para deletar
});

```

## ⚙️ Funcionalidades
- Arrastar pinos da lista para o mapa
- Mover pinos dentro do mapa (mantendo dentro dos limites da imagem)
- Remover pino clicando com o botão direito (ou pressionando Alt + clique)
- Botão limpar para remover todos os pinos de uma vez

## 📝 Observações
- O tooltip é removido automaticamente quando o pino é deletado.
- O botão "Limpar Pinos" é ativado/desativado conforme existam pinos no mapa.
- Caso o Bootstrap Tooltip não esteja presente, basta remover as partes relacionadas a ele no código.