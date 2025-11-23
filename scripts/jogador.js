// Esse é o módulo que controla a bolinha do jogador

// Módulos importados
// Canvas
import { ctx, largura_tela, altura_tela } from './canvas.js';

// Definição da Bolinha do Jogador (Objeto)
const Jogador = {
    x: largura_tela / 2,  // Posição x da bolinha: Meio da tela na horizontal
    y: altura_tela / 2,  // Posição y da bolinha: Meio da tela na vertical
    r: 20,              // Raio da bolinha
    cor: '#3498db',  // Cor azul (Hexadecimal)

    desenhar() {
        // Inicia o desenho
        ctx.beginPath();
        // Cria um círculo: arc(pos x, pos y, raio, ang inicial, ang final)
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        // Define a cor de preenchimento  
        ctx.fillStyle = this.cor;
        // Preenche o círculo
        ctx.fill();
        // Encerra o caminho de desenho
        ctx.closePath();
    }
};

export { Jogador };