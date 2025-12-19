// celulas.js

import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';
import { lista_comidas, notificar_comida_comida } from './comidas.js'; 

// --- CONFIGURAÇÕES DE EQUILÍBRIO ---
const QUANTIDADE_MIN = 600; 
export const QTD_MAX_CELULAS = 800;

// Mapa onde elas NASCEM
export const TAMANHO_MAPA_CELULAS = 1200; 

// LIMITE MORTAL: Ajustado para ficar logo depois da comida (que vai até 1350)
// Se for muito longe, elas vagam no vazio e a simulação fica lenta/chata.
export const LIMITE_MORTAL = 2000; 

const RAIO_CELULA = 7;
const RAIO_VISAO = 200; 

// Economia de Vida (Sobrevivência facilitada no início)
const VIDA_INICIAL = 150;
const VIDA_MAXIMA = 150;
const PERDA_POR_FRAME = 0.02; // Perde pouco (dura ~80s)
const GANHO_COMIDA = 30;      // Ganha razoável

const COOLDOWN_REPRODUCAO = 300; 
const TAXA_MUTACAO = 0.15;       
const CUSTO_REPRODUCAO = 50;     
const VELOCIDADE_MAXIMA = 4;

const INTERVALO_PENSAMENTO = 3; 

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
        
        this.tick_interno = Math.floor(Math.random() * INTERVALO_PENSAMENTO);
        this.vel_x_cache = 0;
        this.vel_y_cache = 0;

        this.sensor = {
            comida_esq: 0, comida_dir: 0, comida_cima: 0, comida_baixo: 0,
            vizinho_esq: 0, vizinho_dir: 0, vizinho_cima: 0, vizinho_baixo: 0
        };

        if (genes_herdados) {
            this.genes = genes_herdados;
        } else {
            // Geração Zero mais agitada
            this.genes = {
                bias_x: (Math.random() * 2) - 1,
                bias_y: (Math.random() * 2) - 1,
                
                w_comida_esq_x: random_gene(), w_comida_dir_x: random_gene(),
                w_comida_cima_y: random_gene(), w_comida_baixo_y: random_gene(),

                w_vizinho_esq_x: random_gene(), w_vizinho_dir_x: random_gene(),
                w_vizinho_cima_y: random_gene(), w_vizinho_baixo_y: random_gene(),

                w_vida_x: random_gene(), w_vida_y: random_gene(),
                w_pos_x: random_gene(), w_pos_y: random_gene()
            };
        }

        this.vida = VIDA_INICIAL;
        this.cooldown_reproducao = 0;
        this.cor_preenchimento = '#00008B';
        this.cor_neon = '#0026ffff';
    }

    reproduzir(parceiro) {
        if (lista_celulas.length >= QTD_MAX_CELULAS) return;

        const genes_filho = {};
        const chaves = Object.keys(this.genes);
        
        for (let key of chaves) {
            let base = (Math.random() < 0.5) ? this.genes[key] : parceiro.genes[key];
            if (Math.random() < 0.2) { 
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

    atualizar_sensores() {
        this.sensor = {
            comida_esq: 0, comida_dir: 0, comida_cima: 0, comida_baixo: 0,
            vizinho_esq: 0, vizinho_dir: 0, vizinho_cima: 0, vizinho_baixo: 0
        };

        const raio_sq = RAIO_VISAO * RAIO_VISAO;
        let tocando_alguem = false;

        // Comida
        for (let i = 0; i < lista_comidas.length; i++) {
            const c = lista_comidas[i];
            const dx = c.x_real - this.x_real;
            const dy = c.y_real - this.y_real;
            const dist_sq = dx*dx + dy*dy;
            
            if (dist_sq < raio_sq) {
                const forca = (1 - (Math.sqrt(dist_sq) / RAIO_VISAO)) * 2;
                if (dx < 0) this.sensor.comida_esq += forca; 
                else this.sensor.comida_dir += forca;        
                if (dy < 0) this.sensor.comida_cima += forca;
                else this.sensor.comida_baixo += forca;
            }
        }

        // Vizinhos
        for (let i = 0; i < lista_celulas.length; i++) {
            const outra = lista_celulas[i];
            if (outra === this) continue;

            const dx = outra.x_real - this.x_real;
            const dy = outra.y_real - this.y_real;
            const dist_sq = dx*dx + dy*dy;

            const raio_toque = this.raio_real + outra.raio_real;
            if (dist_sq < raio_toque * raio_toque) {
                tocando_alguem = true;
                if (this.cooldown_reproducao <= 0 && outra.cooldown_reproducao <= 0 && this.vida > 60) {
                    this.reproduzir(outra);
                    this.cooldown_reproducao = COOLDOWN_REPRODUCAO;
                    outra.cooldown_reproducao = COOLDOWN_REPRODUCAO;
                    this.vida -= CUSTO_REPRODUCAO;
                }
            }

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
                notificar_comida_comida(); 
                this.vida += GANHO_COMIDA;
                if (this.vida > VIDA_MAXIMA) this.vida = VIDA_MAXIMA;
            }
        }
    }

    tomar_decisao_e_mover() {
        this.vida -= PERDA_POR_FRAME;
        if (this.cooldown_reproducao > 0) this.cooldown_reproducao--;
        this.comer(); 

        this.tick_interno++;
        
        if (this.tick_interno % INTERVALO_PENSAMENTO === 0) {
            this.atualizar_sensores();
            const s = this.sensor;
            
            const in_ce = Math.min(1, s.comida_esq);
            const in_cd = Math.min(1, s.comida_dir);
            const in_cc = Math.min(1, s.comida_cima);
            const in_cb = Math.min(1, s.comida_baixo);
            
            const in_ve = Math.min(1, s.vizinho_esq);
            const in_vd = Math.min(1, s.vizinho_dir);
            const in_vc = Math.min(1, s.vizinho_cima);
            const in_vb = Math.min(1, s.vizinho_baixo);
            
            const in_vida = this.vida / VIDA_MAXIMA;
            // Normaliza posição pelo Limite Mortal e não pelo mapa de nascimento
            const in_pos_x = this.x_real / LIMITE_MORTAL;
            const in_pos_y = this.y_real / LIMITE_MORTAL;

            let vx = this.genes.bias_x + 
                     (in_ce * this.genes.w_comida_esq_x) + 
                     (in_cd * this.genes.w_comida_dir_x) +
                     (in_ve * this.genes.w_vizinho_esq_x) +
                     (in_vd * this.genes.w_vizinho_dir_x) +
                     (in_vida * this.genes.w_vida_x) +
                     (in_pos_x * this.genes.w_pos_x);

            let vy = this.genes.bias_y +
                     (in_cc * this.genes.w_comida_cima_y) +
                     (in_cb * this.genes.w_comida_baixo_y) +
                     (in_vc * this.genes.w_vizinho_cima_y) +
                     (in_vb * this.genes.w_vizinho_baixo_y) +
                     (in_vida * this.genes.w_vida_y) +
                     (in_pos_y * this.genes.w_pos_y);

            const v_total = Math.sqrt(vx*vx + vy*vy);
            if (v_total > VELOCIDADE_MAXIMA) {
                vx = (vx / v_total) * VELOCIDADE_MAXIMA;
                vy = (vy / v_total) * VELOCIDADE_MAXIMA;
            }

            this.vel_x_cache = vx;
            this.vel_y_cache = vy;
        }

        this.x_real += this.vel_x_cache;
        this.y_real += this.vel_y_cache;

        // Limite Mortal Retangular
        if (this.x_real > LIMITE_MORTAL || this.x_real < -LIMITE_MORTAL ||
            this.y_real > LIMITE_MORTAL || this.y_real < -LIMITE_MORTAL) {
            this.vida = 0;
        }
    }

    desenhar(dx, dy) {
        this.tomar_decisao_e_mover();
        
        const xv = (this.x_real * zoom.valor) + dx;
        const yv = (this.y_real * zoom.valor) + dy;
        const rv = this.raio_real * zoom.valor;

        if (xv+rv < 0 || xv-rv > largura_tela_real || yv+rv < 0 || yv-rv > altura_tela_real) return;

        ctx.beginPath();
        ctx.arc(xv, yv, rv, 0, Math.PI*2);
        
        ctx.globalAlpha = Math.max(0.2, this.vida / VIDA_MAXIMA);
        ctx.fillStyle = this.cor_preenchimento;
        ctx.strokeStyle = this.cor_neon;
        
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }
}

export function gerar_celulas() {
    for (let i = 0; i < QUANTIDADE_MIN; i++) lista_celulas.push(new Celula());
    console.log(`População inicial: ${lista_celulas.length}`);
}

export function desenhar_todas_celulas(dx, dy) {
    for (let i = lista_celulas.length - 1; i >= 0; i--) {
        const c = lista_celulas[i];
        if (c.vida <= 0) { lista_celulas.splice(i, 1); continue; }
        c.desenhar(dx, dy);
    }
}