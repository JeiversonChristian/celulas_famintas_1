// Esse é o script principal da simulação - ele usa todos os outros módulos

// Módulos importados
// Funções
import { desenhar_jogadores, limpar_tela, zoom_in, zoom_out, aplicar_zoom, mover_camera } from './scripts/funcoes.js';

// Estado do Mouse
let mouseX = 0;
let mouseY = 0;
let arrastando = false; // "Flag" para saber se o botão está apertado
let mouse_anterior_x = 0;
let mouse_anterior_y = 0;

// "Eventos escutadores"
// 1. CLICOU (Inicia o arrasto)
window.addEventListener("mousedown", (e) => {
    arrastando = true;
    // Guarda onde o click começou para calcular a diferença depois
    mouse_anterior_x = e.clientX;
    mouse_anterior_y = e.clientY;
    
    // (Opcional) Muda o cursor para "mão fechada"
    document.body.style.cursor = "grabbing";
});

// 2. SOLTOU (Para o arrasto)
window.addEventListener("mouseup", () => {
    arrastando = false;
    document.body.style.cursor = "default";
});

// Caso o mouse saia da janela, também paramos de arrastar
window.addEventListener("mouseleave", () => {
    arrastando = false;
});

// 3. MOVEU
window.addEventListener("mousemove", (e) => {
    // Atualiza a posição atual (usado pelo zoom)
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Se estiver segurando o click:
    if (arrastando) {
        // Calcula a diferença (Delta) entre a posição atual e a anterior
        const delta_x = e.clientX - mouse_anterior_x;
        const delta_y = e.clientY - mouse_anterior_y;

        // Manda mover a câmera
        mover_camera(delta_x, delta_y);

        // Atualiza a posição "anterior" para a atual, para o próximo ciclo
        mouse_anterior_x = e.clientX;
        mouse_anterior_y = e.clientY;
    }
});
// Evento da Rodinha
window.addEventListener("wheel", (e) => {
    // Passamos mouseX e mouseY para o zoom
    if (e.deltaY < 0) {
        zoom_in(mouseX, mouseY);
    } else {
        zoom_out(mouseX, mouseY);
    }
});
// Teclas (opcional: usando o centro da tela como "mouse fake" se usar teclado)
window.addEventListener("keydown", (e) => {
    const centroX = window.innerWidth / 2;
    const centroY = window.innerHeight / 2;
    
    if (e.key === "=") zoom_in(centroX, centroY);
    else if (e.key === "-") zoom_out(centroX, centroY);
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