// comidas.js

import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';

// --- ATENÇÃO: Copiei os valores aqui para evitar Dependência Circular ---
// (Não podemos importar de celulas.js se celulas.js importar daqui)
const TAMANHO_MAPA_CELULAS = 500;
const QTD_MAX_CELULAS = 200;

// Configurações da Comida
const TAMANHO_MAPA = TAMANHO_MAPA_CELULAS * 1.5; // 50% maior
const QTD_MAX = QTD_MAX_CELULAS * 8;             // 4x mais comida 
const QTD_MIN = QTD_MAX / 2;                     // Mínimo aleatório
const RAIO = 2.5;

export const lista_comidas = [];

class Comida {
    constructor() {
        // Posição Real Aleatória (Mapa Expandido)
        this.x_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        this.y_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        
        this.raio_real = RAIO;
        
        // Aparência
        this.cor = '#00FF00';      // Verde Puro
        this.cor_neon = '#ccffcc'; // Verde Claro Brilhante
    }

    desenhar(deslocamento_x, deslocamento_y) {
        // Cálculo de posição na tela
        const x_virtual = (this.x_real * zoom.valor) + deslocamento_x;
        const y_virtual = (this.y_real * zoom.valor) + deslocamento_y;
        const r_virtual = this.raio_real * zoom.valor;

        // Culling (Otimização)
        if (x_virtual + r_virtual < 0 || x_virtual - r_virtual > largura_tela_real ||
            y_virtual + r_virtual < 0 || y_virtual - r_virtual > altura_tela_real) {
            return; 
        }

        ctx.beginPath();
        ctx.arc(x_virtual, y_virtual, r_virtual, 0, Math.PI * 2);
        
        ctx.fillStyle = this.cor;
        
        // Efeito Neon Verde
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.cor_neon; 
        
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

export function gerar_comidas() {
    const quantidade = Math.floor(Math.random() * (QTD_MAX - QTD_MIN + 1)) + QTD_MIN;

    for (let i = 0; i < quantidade; i++) {
        lista_comidas.push(new Comida());
    }
    console.log(`Foram geradas ${quantidade} comidinhas.`);
}

export function desenhar_todas_comidas(deslocamento_x, deslocamento_y) {
    for (let i = 0; i < lista_comidas.length; i++) {
        lista_comidas[i].desenhar(deslocamento_x, deslocamento_y);
    }
}