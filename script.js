// Esse é o script principal da simulação - ele usa todos os outros módulos

// Módulos importados
// Funções
import { desenhar_jogador, limpar_tela, zoom_in, zoom_out } from './scripts/funcoes.js';
// variáveis do canvas
import { zoom } from './scripts/canvas.js';

// "Eventos escutadores"
// "Roletinha" do mouse para dar zoom
window.addEventListener("wheel", (e) => {
    if (e.deltaY < 0) zoom_in(zoom);
    else zoom_out(zoom);
});
// teclas para dar zoom; obs.: O "=" na verdade é o "+"
window.addEventListener("keydown", (e) => {
    if (e.key === "=") zoom_in(zoom);
    else if (e.key === "-") zoom_out(zoom);
});

// Loop da simulação 
function loop_simulacao() {
    // Limpa a tela antes de desenhar o próximo quadro
    limpar_tela();
    
    // O jogador é a bolinha controlada pela gente
    desenhar_jogador();    
    
    // Solicita ao navegador para chamar essa função novamente no próximo quadro
    requestAnimationFrame(loop_simulacao);
}

// Inicia o jogo
loop_simulacao();