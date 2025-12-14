// Esse é o script principal da simulação - ele usa todos os outros módulos

// Módulos importados
// Funções
import { desenhar_jogadores, limpar_tela, zoom_in, zoom_out, aplicar_zoom } from './scripts/funcoes.js';
// variáveis do canvas

// "Eventos escutadores"
// "Roletinha" do mouse para dar zoom
window.addEventListener("wheel", (e) => {
    if (e.deltaY < 0) zoom_in();
    else zoom_out();
});
// teclas para dar zoom; obs.: O "=" na verdade é o "+"
window.addEventListener("keydown", (e) => {
    if (e.key === "=") zoom_in();
    else if (e.key === "-") zoom_out();
});

// Loop da simulação 
function loop_simulacao() {
    // Limpa a tela antes de desenhar o próximo quadro
    limpar_tela();

    aplicar_zoom();
    
    // O jogador é a bolinha controlada pela gente e a outra
    desenhar_jogadores();    
    
    // Solicita ao navegador para chamar essa função novamente no próximo quadro
    requestAnimationFrame(loop_simulacao);
}

// Inicia o jogo
loop_simulacao();