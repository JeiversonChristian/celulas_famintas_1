// funcoes.js
// Esse é o módulo que controla as funções principais globais da simulação

import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';
import { gerar_celulas, desenhar_todas_celulas, LIMITE_MORTAL } from './celulas.js';
import { gerar_comidas, desenhar_todas_comidas } from './comidas.js';
import { gerar_predadores, desenhar_todos_predadores } from './predadores.js';

// --- IMPORT NOVO ---
import { atualizar_interface } from './interface.js';

let deslocamento_x = 0;
let deslocamento_y = 0;

// Gera tudo
gerar_celulas();
gerar_comidas();
gerar_predadores(); 

function desenhar_limites_mundo() {
    const x_tela_inicial = (-LIMITE_MORTAL * zoom.valor) + deslocamento_x;
    const y_tela_inicial = (-LIMITE_MORTAL * zoom.valor) + deslocamento_y;
    const tamanho_tela_total = (LIMITE_MORTAL * 2) * zoom.valor;

    ctx.beginPath();
    ctx.rect(x_tela_inicial, y_tela_inicial, tamanho_tela_total, tamanho_tela_total);
    // Parede Azul
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; 
    ctx.lineWidth = 10 * zoom.valor; 
    ctx.stroke();
    ctx.closePath();
}

function desenhar_mundo() {
    desenhar_limites_mundo();

    // 1. Comidas (Fundo)
    desenhar_todas_comidas(deslocamento_x, deslocamento_y);

    // 2. Células Normais (Meio)
    desenhar_todas_celulas(deslocamento_x, deslocamento_y);

    // 3. Predadores (Topo)
    desenhar_todos_predadores(deslocamento_x, deslocamento_y);

    // --- ATUALIZA O PAINEL DE TEXTO ---
    atualizar_interface();
}

function limpar_tela() {
    ctx.clearRect(0, 0, largura_tela_real, altura_tela_real);
}

function calcular_zoom_mouse(mouse_x, mouse_y, direcao) {
    const mundo_x = (mouse_x - deslocamento_x) / zoom.valor;
    const mundo_y = (mouse_y - deslocamento_y) / zoom.valor;
    
    let fator = 1.0;
    if (direcao > 0) fator = 1.1; 
    else fator = 0.9;             

    const novo_zoom = zoom.valor * fator;
    
    if (novo_zoom < 0.005) return; 

    zoom.valor = novo_zoom;
    
    deslocamento_x = mouse_x - (mundo_x * zoom.valor);
    deslocamento_y = mouse_y - (mundo_y * zoom.valor);
}

function zoom_in(mx, my) { calcular_zoom_mouse(mx, my, 1); }
function zoom_out(mx, my) { calcular_zoom_mouse(mx, my, -1); }

function mover_camera(delta_x, delta_y) {
    deslocamento_x += delta_x;
    deslocamento_y += delta_y;
}

export { desenhar_mundo, limpar_tela, zoom_in, zoom_out, mover_camera };