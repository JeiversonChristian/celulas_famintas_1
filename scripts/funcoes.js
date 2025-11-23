// Esse é o módulo que controla as funções principais globais da simulação

// Módulos importados
// Canvas
import { ctx, largura_tela, altura_tela } from './canvas.js';
// Jogador
import { Jogador } from './jogador.js';

function desenhar_jogador() {
    Jogador.desenhar();
}

function limpar_tela() {    
    ctx.clearRect(0, 0, largura_tela, altura_tela);
}

export { desenhar_jogador, limpar_tela };