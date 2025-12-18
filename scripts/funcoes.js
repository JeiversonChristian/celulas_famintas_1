// funcoes.js
// Esse é o módulo que controla as funções principais globais da simulação

// Módulos importados
import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';
// IMPORTANTE: Adicionei LIMITE_MORTAL na importação abaixo
import { gerar_celulas, desenhar_todas_celulas, LIMITE_MORTAL } from './celulas.js';
import { gerar_comidas, desenhar_todas_comidas } from './comidas.js';

// Variáveis persistentes de deslocamento
let deslocamento_x = 0;
let deslocamento_y = 0;

// Gera tudo ao iniciar
gerar_celulas();
gerar_comidas();

// --- NOVA FUNÇÃO: Desenha o círculo da morte ---
// --- FUNÇÃO ATUALIZADA: Desenha RETÂNGULO da morte ---
function desenhar_limites_mundo() {
    // O limite vai de -LIMITE até +LIMITE.
    // O canto superior esquerdo no mundo é (-LIMITE, -LIMITE).
    
    // 1. Calcula onde esse canto fica na tela (aplicando zoom e deslocamento)
    const x_tela_inicial = (-LIMITE_MORTAL * zoom.valor) + deslocamento_x;
    const y_tela_inicial = (-LIMITE_MORTAL * zoom.valor) + deslocamento_y;

    // 2. Calcula a largura e altura total do retângulo na tela
    // O tamanho total no mundo é LIMITE * 2 (ex: de -1000 a +1000 = 2000)
    const tamanho_tela_total = (LIMITE_MORTAL * 2) * zoom.valor;

    ctx.beginPath();
    // Desenha o retângulo: X inicial, Y inicial, Largura, Altura
    ctx.rect(x_tela_inicial, y_tela_inicial, tamanho_tela_total, tamanho_tela_total);
    
    // Estilo do retângulo: Vermelho, meio transparente e grosso
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)'; 
    ctx.lineWidth = 10 * zoom.valor; // A espessura também acompanha o zoom
    
    ctx.stroke();
    ctx.closePath();
}

function desenhar_mundo() {
    // 1. Desenha o Limite (Fica bem no fundo)
    desenhar_limites_mundo();

    // 2. Desenha Comidas
    desenhar_todas_comidas(deslocamento_x, deslocamento_y);

    // 3. Desenha Células (Ficam por cima de tudo)
    desenhar_todas_celulas(deslocamento_x, deslocamento_y);
}

function limpar_tela() {
    ctx.clearRect(0, 0, largura_tela_real, altura_tela_real);
}

// Função auxiliar para recalcular o deslocamento (Igual ao anterior)
function calcular_zoom_mouse(mouse_x, mouse_y, fator) {
    const mundo_x = (mouse_x - deslocamento_x) / zoom.valor;
    const mundo_y = (mouse_y - deslocamento_y) / zoom.valor;
    const novo_zoom = zoom.valor + fator;
    if (novo_zoom < 0.1) return; 
    zoom.valor = novo_zoom;
    deslocamento_x = mouse_x - (mundo_x * zoom.valor);
    deslocamento_y = mouse_y - (mundo_y * zoom.valor);
}

function zoom_in(mx, my) { calcular_zoom_mouse(mx, my, 0.03); }
function zoom_out(mx, my) { calcular_zoom_mouse(mx, my, -0.03); }

function mover_camera(delta_x, delta_y) {
    deslocamento_x += delta_x;
    deslocamento_y += delta_y;
}

export { desenhar_mundo, limpar_tela, zoom_in, zoom_out, mover_camera };