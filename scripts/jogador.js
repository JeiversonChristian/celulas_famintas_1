// Esse é o módulo que controla a bolinha do jogador

import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';

// Definição da Bolinha do Jogador (Objeto)
const Jogador = {
    x_real: largura_tela_real / 2,
    x_virtual: (largura_tela_real/2)*zoom.valor, //x_real*zoom.valor
    y_real: altura_tela_real / 2,
    y_virtual: (altura_tela_real/2)*zoom.valor, //y_real*zoom.valor
    r_real: 5,
    r_virtual: 5*zoom.valor, //r_real*zoom.valor         
    cor: '#3498db',

    desenhar() {
        // Inicia o desenho
        ctx.beginPath();
        // Cria um círculo: arc(pos x, pos y, raio, ang inicial, ang final)
        ctx.arc(this.x_virtual,this.y_virtual,this.r_virtual,0,Math.PI*2);
        // Define a cor de preenchimento  
        ctx.fillStyle = this.cor;
        // Preenche o círculo
        ctx.fill();
        // Encerra o caminho de desenho
        ctx.closePath();
    }
};

export { Jogador };