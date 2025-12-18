// celulas.js

import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';
import { lista_comidas } from './comidas.js'; 

// --- CONFIGURAÇÕES ---
const QUANTIDADE_MIN = 50;
export const QTD_MAX_CELULAS = 200;
export const TAMANHO_MAPA_CELULAS = 500; 
const RAIO_CELULA = 7;
const RAIO_VISAO = 150; // Aumentei um pouco para elas verem melhor

const VIDA_INICIAL = 100;
const VIDA_MAXIMA = 100;
const PERDA_POR_FRAME = 0.05; // Ajuste fino
const GANHO_COMIDA = 40;

const COOLDOWN_REPRODUCAO = 200; 
const TAXA_MUTACAO = 0.1;        
const CUSTO_REPRODUCAO = 30;     
const VELOCIDADE_MAXIMA = 4;

export const lista_celulas = [];

function random_gene() {
    return (Math.random() * 2) - 1; 
}

class Celula {
    constructor(genes_herdados = null, x_nasc = null, y_nasc = null) {
        if (x_nasc !== null) {
            this.x_real = x_nasc;
            this.y_real = y_nasc;
        } else {
            this.x_real = (Math.random() * TAMANHO_MAPA_CELULAS * 2) - TAMANHO_MAPA_CELULAS;
            this.y_real = (Math.random() * TAMANHO_MAPA_CELULAS * 2) - TAMANHO_MAPA_CELULAS;
        }
        
        this.raio_real = RAIO_CELULA;
        
        // --- SENSORES (INPUTS) ---
        // Agora temos visão direcional
        this.sensor = {
            comida_esq: 0, comida_dir: 0, comida_cima: 0, comida_baixo: 0,
            vizinho_esq: 0, vizinho_dir: 0, vizinho_cima: 0, vizinho_baixo: 0
        };

        // --- GENÉTICA (CÉREBRO) ---
        if (genes_herdados) {
            this.genes = genes_herdados;
        } else {
            this.genes = {
                // VIÉS (Vontade de andar sozinho)
                bias_x: random_gene(),
                bias_y: random_gene(),
                
                // PESOS DA COMIDA (Se ver comida na esquerda, o que faço no eixo X?)
                w_comida_esq_x: random_gene(),  // Ex: Deveria ser negativo (ir pra esquerda)
                w_comida_dir_x: random_gene(),  // Ex: Deveria ser positivo (ir pra direita)
                w_comida_cima_y: random_gene(), 
                w_comida_baixo_y: random_gene(),

                // PESOS DOS VIZINHOS (Se ver vizinho na esquerda, fujo ou ataco?)
                w_vizinho_esq_x: random_gene(),
                w_vizinho_dir_x: random_gene(),
                w_vizinho_cima_y: random_gene(),
                w_vizinho_baixo_y: random_gene(),

                // PESOS DE ESTADO (Vida e Posição no Mapa)
                w_vida_x: random_gene(),
                w_vida_y: random_gene(),
                w_pos_x: random_gene(), // Peso da posição X global
                w_pos_y: random_gene()
            };
        }

        this.vida = VIDA_INICIAL;
        this.cooldown_reproducao = 0;
        this.cor_preenchimento = '#00008B';
        this.cor_neon = '#0026ffff';
    }

    reproduzir(parceiro) {
        const genes_filho = {};
        const chaves = Object.keys(this.genes);
        
        for (let key of chaves) {
            // 50% de chance de pegar do pai ou da mãe
            let base = (Math.random() < 0.5) ? this.genes[key] : parceiro.genes[key];
            
            // Mutação
            if (Math.random() < 0.2) { // 20% de chance de mutar cada gene
                base += (Math.random() * 0.4) - 0.2;
                if (base > 1) base = 1;
                if (base < -1) base = -1;
            }
            genes_filho[key] = base;
        }

        const filho = new Celula(genes_filho, this.x_real, this.y_real);
        filho.cooldown_reproducao = COOLDOWN_REPRODUCAO;
        lista_celulas.push(filho);
    }

    // --- SISTEMA SENSORIAL AVANÇADO ---
    atualizar_sensores() {
        // Reseta sensores
        this.sensor = {
            comida_esq: 0, comida_dir: 0, comida_cima: 0, comida_baixo: 0,
            vizinho_esq: 0, vizinho_dir: 0, vizinho_cima: 0, vizinho_baixo: 0
        };

        const raio_sq = RAIO_VISAO * RAIO_VISAO;
        let tocando_alguem = false;

        // 1. CHEIRA COMIDA
        for (let i = 0; i < lista_comidas.length; i++) {
            const c = lista_comidas[i];
            const dx = c.x_real - this.x_real;
            const dy = c.y_real - this.y_real;
            
            if ((dx*dx + dy*dy) < raio_sq) {
                // Intensidade do cheiro (quanto mais perto, maior o valor)
                // Usamos 1 / distancia (ou algo linear para simplificar)
                const forca = 1 - (Math.sqrt(dx*dx + dy*dy) / RAIO_VISAO);

                // Ativa os sensores direcionais
                if (dx < 0) this.sensor.comida_esq += forca; // Está na esquerda
                else this.sensor.comida_dir += forca;        // Está na direita
                
                if (dy < 0) this.sensor.comida_cima += forca;
                else this.sensor.comida_baixo += forca;
            }
        }

        // 2. SENTE VIZINHOS
        for (let i = 0; i < lista_celulas.length; i++) {
            const outra = lista_celulas[i];
            if (outra === this) continue;

            const dx = outra.x_real - this.x_real;
            const dy = outra.y_real - this.y_real;
            const dist_sq = dx*dx + dy*dy;

            // Reprodução (Toque)
            const raio_toque = this.raio_real + outra.raio_real;
            if (dist_sq < raio_toque * raio_toque) {
                tocando_alguem = true;
                if (this.cooldown_reproducao <= 0 && outra.cooldown_reproducao <= 0 && this.vida > 40) {
                    this.reproduzir(outra);
                    this.cooldown_reproducao = COOLDOWN_REPRODUCAO;
                    outra.cooldown_reproducao = COOLDOWN_REPRODUCAO;
                    this.vida -= CUSTO_REPRODUCAO;
                }
            }

            // Visão
            if (dist_sq < raio_sq) {
                const forca = 1 - (Math.sqrt(dist_sq) / RAIO_VISAO);
                
                if (dx < 0) this.sensor.vizinho_esq += forca;
                else this.sensor.vizinho_dir += forca;
                
                if (dy < 0) this.sensor.vizinho_cima += forca;
                else this.sensor.vizinho_baixo += forca;
            }
        }

        this.cor_neon = tocando_alguem ? '#FF69B4' : '#0026ffff';
    }

    comer() {
        for (let i = lista_comidas.length - 1; i >= 0; i--) {
            const c = lista_comidas[i];
            const dx = this.x_real - c.x_real;
            const dy = this.y_real - c.y_real;
            const soma_raios = this.raio_real + c.raio_real;

            if ((dx*dx + dy*dy) < soma_raios*soma_raios) {
                lista_comidas.splice(i, 1);
                this.vida += GANHO_COMIDA;
                if (this.vida > VIDA_MAXIMA) this.vida = VIDA_MAXIMA;
            }
        }
    }

    tomar_decisao_e_mover() {
        this.vida -= PERDA_POR_FRAME;
        if (this.cooldown_reproducao > 0) this.cooldown_reproducao--;

        this.atualizar_sensores();
        this.comer();

        // --- CÉREBRO (Rede Neural) ---
        // Normalizamos inputs para evitar explosão de valores
        // Limitamos (clamp) a percepção em 1.0 para que uma montanha de comida não gere velocidade infinita
        const s = this.sensor;
        const in_comida_esq = Math.min(1, s.comida_esq);
        const in_comida_dir = Math.min(1, s.comida_dir);
        const in_comida_cima = Math.min(1, s.comida_cima);
        const in_comida_baixo = Math.min(1, s.comida_baixo);
        
        const in_viz_esq = Math.min(1, s.vizinho_esq);
        const in_viz_dir = Math.min(1, s.vizinho_dir);
        const in_viz_cima = Math.min(1, s.vizinho_cima);
        const in_viz_baixo = Math.min(1, s.vizinho_baixo);
        
        const in_vida = this.vida / 100;
        const in_pos_x = this.x_real / TAMANHO_MAPA_CELULAS;
        const in_pos_y = this.y_real / TAMANHO_MAPA_CELULAS;

        // CÁLCULO DA VELOCIDADE X
        let vx = this.genes.bias_x + 
                 (in_comida_esq * this.genes.w_comida_esq_x) + // Se vejo comida na esq, isso afeta minha vel X?
                 (in_comida_dir * this.genes.w_comida_dir_x) +
                 (in_viz_esq * this.genes.w_vizinho_esq_x) +
                 (in_viz_dir * this.genes.w_vizinho_dir_x) +
                 (in_vida * this.genes.w_vida_x) +
                 (in_pos_x * this.genes.w_pos_x);

        // CÁLCULO DA VELOCIDADE Y
        let vy = this.genes.bias_y +
                 (in_comida_cima * this.genes.w_comida_cima_y) +
                 (in_comida_baixo * this.genes.w_comida_baixo_y) +
                 (in_viz_cima * this.genes.w_vizinho_cima_y) +
                 (in_viz_baixo * this.genes.w_vizinho_baixo_y) +
                 (in_vida * this.genes.w_vida_y) +
                 (in_pos_y * this.genes.w_pos_y);

        // Limite de Velocidade
        const v_total = Math.sqrt(vx*vx + vy*vy);
        if (v_total > VELOCIDADE_MAXIMA) {
            vx = (vx / v_total) * VELOCIDADE_MAXIMA;
            vy = (vy / v_total) * VELOCIDADE_MAXIMA;
        }

        this.x_real += vx;
        this.y_real += vy;
    }

    desenhar(dx, dy) {
        this.tomar_decisao_e_mover();
        
        const xv = (this.x_real * zoom.valor) + dx;
        const yv = (this.y_real * zoom.valor) + dy;
        const rv = this.raio_real * zoom.valor;

        if (xv+rv < 0 || xv-rv > largura_tela_real || yv+rv < 0 || yv-rv > altura_tela_real) return;

        ctx.beginPath();
        ctx.arc(xv, yv, rv, 0, Math.PI*2);
        ctx.globalAlpha = Math.max(0.2, this.vida / 100);
        ctx.fillStyle = this.cor_preenchimento;
        ctx.shadowBlur = 5; 
        ctx.shadowColor = this.cor_neon;
        ctx.strokeStyle = this.cor_neon;
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }
}

export function gerar_celulas() {
    for (let i = 0; i < QUANTIDADE_MIN; i++) lista_celulas.push(new Celula());
    console.log(`${lista_celulas.length} células iniciadas.`);
}

export function desenhar_todas_celulas(dx, dy) {
    for (let i = lista_celulas.length - 1; i >= 0; i--) {
        const c = lista_celulas[i];
        if (c.vida <= 0) { lista_celulas.splice(i, 1); continue; }
        c.desenhar(dx, dy);
    }
}