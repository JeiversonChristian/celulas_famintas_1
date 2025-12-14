// Esse é o módulo que controla as funções principais globais da simulação

// Módulos importados
// Canvas
import { ctx, largura_tela_real, altura_tela_real, largura_tela_virtual, altura_tela_virtual, zoom } from './canvas.js';
// Jogadores
import { Jogador } from './jogador.js';
import { Jogador_2 } from './jogador_2.js';

function desenhar_jogadores() {
    Jogador.desenhar();
    Jogador_2.desenhar();
}

function limpar_tela() {
    ctx.clearRect(0, 0, largura_tela_real, altura_tela_real);
}

function zoom_in() {
    zoom.valor += 0.05;
}

function zoom_out() {
    if (zoom.valor > 0.1) {
        zoom.valor -= 0.05;
    }
}

function aplicar_zoom () {

    // --- LÓGICA DO PIVÔ CENTRAL ---
    // Queremos que o centro da tela continue no centro após o zoom.
    
    // 1. Pegamos o centro da tela real
    const centro_x = largura_tela_real / 2;
    const centro_y = altura_tela_real / 2;

    // 2. Calculamos o deslocamento (Offset)
    // Fórmula: Onde o centro está - Onde o centro estaria com o zoom
    const deslocamento_x = centro_x - (centro_x * zoom.valor);
    const deslocamento_y = centro_y - (centro_y * zoom.valor);

    // --- APLICANDO AOS JOGADORES ---
    
    // IMPORTANTE: Sempre calculamos o Virtual a partir do Real (Original).
    // Nunca faça "virtual *= zoom", pois isso cria um loop infinito de crescimento.
    
    // Jogador 1
    Jogador.x_virtual = (Jogador.x_real * zoom.valor) + deslocamento_x;
    Jogador.y_virtual = (Jogador.y_real * zoom.valor) + deslocamento_y;
    Jogador.r_virtual = Jogador.r_real * zoom.valor; 

    // Jogador 2
    Jogador_2.x_virtual = (Jogador_2.x_real * zoom.valor) + deslocamento_x;
    Jogador_2.y_virtual = (Jogador_2.y_real * zoom.valor) + deslocamento_y;
    Jogador_2.r_virtual = Jogador_2.r_real * zoom.valor;

}

export { desenhar_jogadores, limpar_tela, zoom_in, zoom_out, aplicar_zoom };