// celulas.js
import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';

// Configurações
const QUANTIDADE_MIN = 300;
const QUANTIDADE_MAX = 600;
const TAMANHO_MAPA = 4000; // As células vão nascer entre -4000 e +4000
const RAIO_CELULA = 5;

// Lista que vai guardar todas as células
export const lista_celulas = [];

class Celula {
    constructor() {
        // Posição Real Aleatória (Mundo Infinito)
        // Math.random() gera de 0 a 1. 
        // A fórmula abaixo gera números entre -TAMANHO_MAPA e +TAMANHO_MAPA
        this.x_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        this.y_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        
        this.raio_real = RAIO_CELULA;
        this.cor_preenchimento = '#00008B';
        this.cor_neon = '#002fffff';
    }

    desenhar(deslocamento_x, deslocamento_y) {
        // 1. Calcula posição virtual (igual aos jogadores)
        const x_virtual = (this.x_real * zoom.valor) + deslocamento_x;
        const y_virtual = (this.y_real * zoom.valor) + deslocamento_y;
        const r_virtual = this.raio_real * zoom.valor;

        // --- OTIMIZAÇÃO (CULLING) ---
        // Se a bolinha estiver fora da tela, NÃO desenhe. Economiza processamento.
        if (x_virtual + r_virtual < 0 || x_virtual - r_virtual > largura_tela_real ||
            y_virtual + r_virtual < 0 || y_virtual - r_virtual > altura_tela_real) {
            return; 
        }

        // 2. Desenha
        ctx.beginPath();
        ctx.arc(x_virtual, y_virtual, r_virtual, 0, Math.PI * 2);
        
        ctx.fillStyle = this.cor_preenchimento;
        
        // Efeito Neon (Sombra brilhante)
        ctx.shadowBlur = 5;          // O quanto a luz "espalha"
        ctx.shadowColor = this.cor_neon; 
        
        // Borda Neon
        ctx.strokeStyle = this.cor_neon;
        ctx.lineWidth = 1;

        ctx.fill();
        ctx.stroke(); // Desenha a borda
        
        ctx.closePath();

        // IMPORTANTE: Limpar o efeito de sombra para não afetar os outros desenhos
        ctx.shadowBlur = 0;
    }
}

// Função para iniciar as células (chamada apenas uma vez)
export function gerar_celulas() {
    // Sorteia uma quantidade entre o min e max
    const quantidade = Math.floor(Math.random() * (QUANTIDADE_MAX - QUANTIDADE_MIN + 1)) + QUANTIDADE_MIN;

    for (let i = 0; i < quantidade; i++) {
        lista_celulas.push(new Celula());
    }
    console.log(`Foram geradas ${quantidade} células.`);
}

// Função que percorre a lista e manda desenhar todas
export function desenhar_todas_celulas(deslocamento_x, deslocamento_y) {
    for (let i = 0; i < lista_celulas.length; i++) {
        lista_celulas[i].desenhar(deslocamento_x, deslocamento_y);
    }
}