// comidas.js

import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';

// --- ATENÇÃO: Valores sincronizados com celulas.js ---
const TAMANHO_MAPA_CELULAS = 1200;
const QTD_MAX_CELULAS = 800;

// Configurações da Comida
// 1.5x o mapa de células = 1350.
const TAMANHO_MAPA = TAMANHO_MAPA_CELULAS * 1.5; 
const QTD_MAX = 2000;             
const QTD_MIN = 1500;                     
const RAIO = 2.5;

export const lista_comidas = [];

class Comida {
    constructor() {
        this.x_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        this.y_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        this.raio_real = RAIO;
        this.cor = '#00FF00';      
        this.cor_neon = '#ccffcc'; 
    }

    desenhar(deslocamento_x, deslocamento_y) {
        const x_virtual = (this.x_real * zoom.valor) + deslocamento_x;
        const y_virtual = (this.y_real * zoom.valor) + deslocamento_y;
        const r_virtual = this.raio_real * zoom.valor;

        if (x_virtual + r_virtual < 0 || x_virtual - r_virtual > largura_tela_real ||
            y_virtual + r_virtual < 0 || y_virtual - r_virtual > altura_tela_real) {
            return; 
        }

        ctx.beginPath();
        ctx.arc(x_virtual, y_virtual, r_virtual, 0, Math.PI * 2);
        ctx.fillStyle = this.cor;
        ctx.fill();
        ctx.closePath();
    }
}

export function notificar_comida_comida() {
    // Respawn 1:1 para manter o mundo cheio
    lista_comidas.push(new Comida());
}

export function gerar_comidas() {
    const quantidade = Math.floor(Math.random() * (QTD_MAX - QTD_MIN + 1)) + QTD_MIN;
    for (let i = 0; i < quantidade; i++) {
        lista_comidas.push(new Comida());
    }
    console.log(`Geradas ${quantidade} comidas.`);
}

export function desenhar_todas_comidas(deslocamento_x, deslocamento_y) {
    for (let i = 0; i < lista_comidas.length; i++) {
        lista_comidas[i].desenhar(deslocamento_x, deslocamento_y);
    }
}