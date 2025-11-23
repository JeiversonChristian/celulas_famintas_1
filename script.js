// Esse é o script principal da simulação - ele usa todos os outros módulos

// Módulos importados
// Funções
import { desenhar_jogador, limpar_tela } from './scripts/funcoes.js';

// Loop da simulação 
// A tela deve ser desenhada várias vezes por segundo
function loop_simulacao() {
    // Limpa a tela antes de desenhar o próximo quadro
    limpar_tela();

    desenhar_jogador();    
    
    // Solicita ao navegador para chamar essa função novamente no próximo quadro
    requestAnimationFrame(loop_simulacao);
}

// Inicia o jogo
loop_simulacao();