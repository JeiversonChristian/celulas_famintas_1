// Esse é o módulo que controla as funções principais globais da simulação

// Módulos importados
// Canvas
import { ctx, largura_tela_real, altura_tela_real, largura_tela_virtual, altura_tela_virtual, zoom } from './canvas.js';
// Jogadores
import { Jogador } from './jogador.js';
import { Jogador_2 } from './jogador_2.js';

// Variáveis persistentes de deslocamento ---
// Elas guardam a posição da câmera. Começam em 0.
let deslocamento_x = 0;
let deslocamento_y = 0;

function desenhar_jogadores() {
    Jogador.desenhar();
    Jogador_2.desenhar();
}

function limpar_tela() {
    ctx.clearRect(0, 0, largura_tela_real, altura_tela_real);
}

// Função auxiliar para recalcular o deslocamento
function calcular_zoom_mouse(mouse_x, mouse_y, fator) {
    // 1. Onde o mouse está no MUNDO "antes" do zoom mudar?
    // Fórmula inversa: (Mouse - Deslocamento) / ZoomAtual
    const mundo_x = (mouse_x - deslocamento_x) / zoom.valor;
    const mundo_y = (mouse_y - deslocamento_y) / zoom.valor;

    // 2. Aplica o novo zoom
    const novo_zoom = zoom.valor + fator;
    
    // Trava de segurança para não inverter a tela ou ficar muito pequeno
    if (novo_zoom < 0.1) return; 

    zoom.valor = novo_zoom;

    // 3. Recalcula o deslocamento
    // "Eu quero que (mundo_x * novo_zoom) + novo_deslocamento seja igual a mouse_x"
    deslocamento_x = mouse_x - (mundo_x * zoom.valor);
    deslocamento_y = mouse_y - (mundo_y * zoom.valor);
}

// Agora zoom_in e zoom_out recebem a posição do mouse
function zoom_in(mx, my) {
    calcular_zoom_mouse(mx, my, 0.05);
}

function zoom_out(mx, my) {
    calcular_zoom_mouse(mx, my, -0.05);
}

function aplicar_zoom() {
    // Jogador 1
    Jogador.x_virtual = (Jogador.x_real * zoom.valor) + deslocamento_x;
    Jogador.y_virtual = (Jogador.y_real * zoom.valor) + deslocamento_y;
    Jogador.r_virtual = Jogador.r_real * zoom.valor; 

    // Jogador 2
    Jogador_2.x_virtual = (Jogador_2.x_real * zoom.valor) + deslocamento_x;
    Jogador_2.y_virtual = (Jogador_2.y_real * zoom.valor) + deslocamento_y;
    Jogador_2.r_virtual = Jogador_2.r_real * zoom.valor;
}

// Função para mover a câmera (Pan) ---
function mover_camera(delta_x, delta_y) {
    deslocamento_x += delta_x;
    deslocamento_y += delta_y;
}

export { desenhar_jogadores, limpar_tela, zoom_in, zoom_out, aplicar_zoom, mover_camera };