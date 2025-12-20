// interface.js

import { lista_celulas } from './celulas.js';
import { lista_predadores } from './predadores.js';
import { lista_comidas } from './comidas.js';

// Cria o elemento visual (uma caixinha flutuante)
const painel = document.createElement('div');

// Estilos para fazer ele ficar flutuando no canto superior esquerdo
painel.style.position = 'fixed';
painel.style.top = '10px';
painel.style.left = '10px';
painel.style.padding = '10px';
painel.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // Fundo preto transparente
painel.style.borderRadius = '8px';
painel.style.fontFamily = 'Consolas, monospace'; // Fonte estilo código
painel.style.fontSize = '16px';
painel.style.pointerEvents = 'none'; // Permite clicar "através" do painel
painel.style.userSelect = 'none';
painel.style.zIndex = '1000'; // Garante que fique por cima de tudo

// Adiciona ao corpo da página
document.body.appendChild(painel);

export function atualizar_interface() {
    // Monta o HTML com as cores correspondentes
    const html = `
        <div style="color: #4488ff; font-weight: bold;">
            🔹 Presas: ${lista_celulas.length}
        </div>
        <div style="color: #ff4444; font-weight: bold;">
            🔻 Predadores: ${lista_predadores.length}
        </div>
        <div style="color: #66ff66; font-weight: bold;">
            🥗 Comidas: ${lista_comidas.length}
        </div>
        <div style="margin-top: 5px; font-size: 12px; color: #aaa;">
            FPS: -- (Otimizado)
        </div>
    `;

    painel.innerHTML = html;
}