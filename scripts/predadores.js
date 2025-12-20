// preadores.js

import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';
// Importamos a lista de células (presas) e o limite do mundo
import { lista_celulas, LIMITE_MORTAL, TAMANHO_MAPA_CELULAS } from './celulas.js';

// --- CONFIGURAÇÕES DOS PREDADORES ---
const QUANTIDADE_MIN = 120;
const QTD_MAX_PREDADORES = 150;

const RAIO_PREDADOR = 17; // Dobro do tamanho (7 * 2)
const RAIO_VISAO = 500;   // Visão aguçada para caça

const VIDA_INICIAL = 500;
const VIDA_MAXIMA = 500;
const PERDA_POR_FRAME = 0.06; // Gasta mais energia que a célula normal
const GANHO_AO_COMER = 100;  // Comer uma presa enche bastante a barriga

const COOLDOWN_REPRODUCAO = 400; // Reprodução mais lenta
const TAXA_MUTACAO = 0.1; 
const CUSTO_REPRODUCAO = 80;     // Custa caro reproduzir
const VELOCIDADE_MAXIMA = 16;   // Levemente mais rápidos que as presas (4.0)

const INTERVALO_PENSAMENTO = 3;

export const lista_predadores = [];

function random_gene() {
    return (Math.random() * 2) - 1; 
}

class Predador {
    constructor(genes_herdados = null, x_nasc = null, y_nasc = null) {
        if (x_nasc !== null) {
            this.x_real = x_nasc;
            this.y_real = y_nasc;
        } else {
            this.x_real = (Math.random() * TAMANHO_MAPA_CELULAS * 2) - TAMANHO_MAPA_CELULAS;
            this.y_real = (Math.random() * TAMANHO_MAPA_CELULAS * 2) - TAMANHO_MAPA_CELULAS;
        }
        
        this.raio_real = RAIO_PREDADOR;
        this.tick_interno = Math.floor(Math.random() * INTERVALO_PENSAMENTO);
        this.vel_x_cache = 0;
        this.vel_y_cache = 0;

        // Sensores (Presa = Comida, Vizinho = Outro Predador)
        this.sensor = {
            presa_esq: 0, presa_dir: 0, presa_cima: 0, presa_baixo: 0,
            vizinho_esq: 0, vizinho_dir: 0, vizinho_cima: 0, vizinho_baixo: 0
        };

        if (genes_herdados) {
            this.genes = genes_herdados;
        } else {
            // Predadores nascem agressivos (Bias alto para movimento)
            this.genes = {
                bias_x: (Math.random() * 2) - 1,
                bias_y: (Math.random() * 2) - 1,
                
                // Pesos para PRESAS (Células Normais)
                w_presa_esq_x: random_gene(), w_presa_dir_x: random_gene(),
                w_presa_cima_y: random_gene(), w_presa_baixo_y: random_gene(),

                // Pesos para VIZINHOS (Outros Predadores)
                w_vizinho_esq_x: random_gene(), w_vizinho_dir_x: random_gene(),
                w_vizinho_cima_y: random_gene(), w_vizinho_baixo_y: random_gene(),

                w_vida_x: random_gene(), w_vida_y: random_gene(),
                w_pos_x: random_gene(), w_pos_y: random_gene()
            };
        }

        this.vida = VIDA_INICIAL;
        this.cooldown_reproducao = 0;
        
        // Aparência
        this.cor_preenchimento = '#8B0000'; // Vermelho Escuro
        this.cor_neon = '#FF0000';          // Vermelho Sangue Neon
    }

    reproduzir(parceiro) {
        if (lista_predadores.length >= QTD_MAX_PREDADORES) return;

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

        const filho = new Predador(genes_filho, this.x_real, this.y_real);
        filho.cooldown_reproducao = COOLDOWN_REPRODUCAO;
        lista_predadores.push(filho);
    }

    atualizar_sensores() {
        this.sensor = {
            presa_esq: 0, presa_dir: 0, presa_cima: 0, presa_baixo: 0,
            vizinho_esq: 0, vizinho_dir: 0, vizinho_cima: 0, vizinho_baixo: 0
        };

        const raio_sq = RAIO_VISAO * RAIO_VISAO;
        let tocando_parceiro = false;

        // 1. PROCURA PRESAS (Células Normais)
        // Percorre a lista de celulas importada
        for (let i = 0; i < lista_celulas.length; i++) {
            const presa = lista_celulas[i];
            const dx = presa.x_real - this.x_real;
            const dy = presa.y_real - this.y_real;
            const dist_sq = dx*dx + dy*dy;
            
            if (dist_sq < raio_sq) {
                // Sinal forte (multiplicado por 3) para priorizar caça
                const forca = (1 - (Math.sqrt(dist_sq) / RAIO_VISAO)) * 3;
                
                if (dx < 0) this.sensor.presa_esq += forca; 
                else this.sensor.presa_dir += forca;        
                if (dy < 0) this.sensor.presa_cima += forca;
                else this.sensor.presa_baixo += forca;
            }
        }

        // 2. SENTE OUTROS PREDADORES (Vizinhos/Parceiros)
        for (let i = 0; i < lista_predadores.length; i++) {
            const outro = lista_predadores[i];
            if (outro === this) continue;

            const dx = outro.x_real - this.x_real;
            const dy = outro.y_real - this.y_real;
            const dist_sq = dx*dx + dy*dy;

            const raio_toque = this.raio_real + outro.raio_real;
            if (dist_sq < raio_toque * raio_toque) {
                tocando_parceiro = true;
                if (this.cooldown_reproducao <= 0 && outro.cooldown_reproducao <= 0 && this.vida > 150) {
                    this.reproduzir(outro);
                    this.cooldown_reproducao = COOLDOWN_REPRODUCAO;
                    outro.cooldown_reproducao = COOLDOWN_REPRODUCAO;
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
        
        // Predador fica Roxo/Rosa se estiver reproduzindo, senão Vermelho Neon
        this.cor_neon = tocando_parceiro ? '#ff8800ff' : '#FF0000';
    }

    caçar() {
        // Percorre a lista de presas de trás para frente para poder remover
        for (let i = lista_celulas.length - 1; i >= 0; i--) {
            const presa = lista_celulas[i];

            const dx = this.x_real - presa.x_real;
            const dy = this.y_real - presa.y_real;
            const soma_raios = this.raio_real + presa.raio_real;

            // Colisão Simples (Círculo com Círculo)
            if ((dx*dx + dy*dy) < soma_raios*soma_raios) {
                // NHAC!
                lista_celulas.splice(i, 1); // Remove a célula normal do mundo
                
                this.vida += GANHO_AO_COMER;
                if (this.vida > VIDA_MAXIMA) this.vida = VIDA_MAXIMA;
            }
        }
    }

    tomar_decisao_e_mover() {
        this.vida -= PERDA_POR_FRAME;
        if (this.cooldown_reproducao > 0) this.cooldown_reproducao--;
        
        this.caçar(); // Tenta comer presas próximas

        this.tick_interno++;
        
        if (this.tick_interno % INTERVALO_PENSAMENTO === 0) {
            this.atualizar_sensores();
            const s = this.sensor;
            
            // Inputs
            const in_pe = Math.min(1, s.presa_esq);
            const in_pd = Math.min(1, s.presa_dir);
            const in_pc = Math.min(1, s.presa_cima);
            const in_pb = Math.min(1, s.presa_baixo);
            
            const in_ve = Math.min(1, s.vizinho_esq);
            const in_vd = Math.min(1, s.vizinho_dir);
            const in_vc = Math.min(1, s.vizinho_cima);
            const in_vb = Math.min(1, s.vizinho_baixo);
            
            const in_vida = this.vida / VIDA_MAXIMA;
            const in_pos_x = this.x_real / LIMITE_MORTAL;
            const in_pos_y = this.y_real / LIMITE_MORTAL;

            // Rede Neural
            let vx = this.genes.bias_x + 
                     (in_pe * this.genes.w_presa_esq_x) + 
                     (in_pd * this.genes.w_presa_dir_x) +
                     (in_ve * this.genes.w_vizinho_esq_x) +
                     (in_vd * this.genes.w_vizinho_dir_x) +
                     (in_vida * this.genes.w_vida_x) +
                     (in_pos_x * this.genes.w_pos_x);

            let vy = this.genes.bias_y +
                     (in_pc * this.genes.w_presa_cima_y) +
                     (in_pb * this.genes.w_presa_baixo_y) +
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

        // Limite Mortal (Igual ao das células)
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
    }
}

export function gerar_predadores() {
    for (let i = 0; i < QUANTIDADE_MIN; i++) lista_predadores.push(new Predador());
    console.log(`PREDADORES LIBERADOS: ${lista_predadores.length}`);
}

export function desenhar_todos_predadores(dx, dy) {
    for (let i = lista_predadores.length - 1; i >= 0; i--) {
        const p = lista_predadores[i];
        if (p.vida <= 0) { lista_predadores.splice(i, 1); continue; }
        p.desenhar(dx, dy);
    }
}