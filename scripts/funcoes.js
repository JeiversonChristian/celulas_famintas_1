// funcoes.js
// Esse é o módulo que controla as funções principais globais da simulação

// Módulos importados
// Canvas
import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';
// Células
import { gerar_celulas, desenhar_todas_celulas } from './celulas.js';
// Comidas
import { gerar_comidas, desenhar_todas_comidas } from './comidas.js';

// Variáveis persistentes de deslocamento ---
// Elas guardam a posição da câmera. Começam em 0.
let deslocamento_x = 0;
let deslocamento_y = 0;

// Gera tudo ao iniciar
gerar_celulas();
gerar_comidas();

function desenhar_mundo() {
    // 1. Desenha Comidas (Ficam no chão)
    desenhar_todas_comidas(deslocamento_x, deslocamento_y);

    // 2. Desenha Células (Ficam por cima)
    desenhar_todas_celulas(deslocamento_x, deslocamento_y);
}

function limpar_tela() {
    ctx.clearRect(0, 0, largura_tela_real, altura_tela_real);
}

// Função auxiliar para recalcular o deslocamento
function calcular_zoom_mouse(mouse_x, mouse_y, fator) {
    // 1. Onde o mouse está no MUNDO "antes" do zoom mudar?
    const mundo_x = (mouse_x - deslocamento_x) / zoom.valor;
    const mundo_y = (mouse_y - deslocamento_y) / zoom.valor;

    // 2. Aplica o novo zoom
    const novo_zoom = zoom.valor + fator;
    
    // Trava de segurança
    if (novo_zoom < 0.1) return; 

    zoom.valor = novo_zoom;

    // 3. Recalcula o deslocamento
    deslocamento_x = mouse_x - (mundo_x * zoom.valor);
    deslocamento_y = mouse_y - (mundo_y * zoom.valor);
}

function zoom_in(mx, my) {
    calcular_zoom_mouse(mx, my, 0.03);
}

function zoom_out(mx, my) {
    calcular_zoom_mouse(mx, my, -0.03);
}

// Função para mover a câmera (Pan) ---
function mover_camera(delta_x, delta_y) {
    deslocamento_x += delta_x;
    deslocamento_y += delta_y;
}

export { desenhar_mundo, limpar_tela, zoom_in, zoom_out, mover_camera };