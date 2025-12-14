import { ctx, largura_tela_real, altura_tela_real, zoom } from './canvas.js';

// Configurações
const QUANTIDADE_MIN = 300;
const QUANTIDADE_MAX = 500; // Reduzi um pouco para não travar com a inteligência artificial
const TAMANHO_MAPA = 2000; 
const RAIO_CELULA = 5;
const RAIO_VISAO = 20; // O "tamanho" do olho da célula

export const lista_celulas = [];

class Celula {
    constructor() {
        // --- CORPO FÍSICO ---
        this.x_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        this.y_real = (Math.random() * TAMANHO_MAPA * 2) - TAMANHO_MAPA;
        this.raio_real = RAIO_CELULA;
        
        // --- DNA / GENES (A "Personalidade" da célula) ---
        // Valores entre 0.0 e 1.0 que definem a força de vontade dela
        this.genes = {
            vontade_direita: Math.random(),
            vontade_esquerda: Math.random(),
            vontade_cima: Math.random(),
            vontade_baixo: Math.random()
        };

        // --- ESTADO MENTAL ---
        this.vizinhos_perto = 0; // Quantas células ela está vendo agora?

        // Aparência
        this.cor_preenchimento = '#00008B';
        this.cor_neon = '#0026ffff';
    }

    // A parte difícil: O "OLHO" da célula
    perceber_ambiente() {
        let contador_vizinhos = 0;

        // A célula precisa olhar para TODAS as outras para saber quem está perto
        // Obs: Isso é computacionalmente pesado. Se tiver 1000 células, são 1 milhão de checagens por frame!
        for (let i = 0; i < lista_celulas.length; i++) {
            const outra = lista_celulas[i];

            // Não checar a distância de si mesma
            if (outra === this) continue;

            // Matemática de Distância (Pitágoras)
            const dx = outra.x_real - this.x_real;
            const dy = outra.y_real - this.y_real;
            
            // Otimização: Comparar distância ao quadrado evita usar Raiz Quadrada (que é lenta)
            const distancia_quadrada = (dx * dx) + (dy * dy);
            const raio_visao_quadrado = RAIO_VISAO * RAIO_VISAO;

            if (distancia_quadrada < raio_visao_quadrado) {
                contador_vizinhos++;
            }
        }
        
        this.vizinhos_perto = contador_vizinhos;
    }

    // O "CÉREBRO" da célula
    tomar_decisao_e_mover() {
        // 1. Primeiro ela olha em volta
        this.perceber_ambiente();

        // 2. Define a velocidade baseada nos Genes
        // Ex: Se vontade_direita é 0.9 e esquerda é 0.1, ela tende a ir pra direita.
        let vel_x = this.genes.vontade_direita - this.genes.vontade_esquerda;
        let vel_y = this.genes.vontade_baixo - this.genes.vontade_cima;

        // 3. Fator de Aleatoriedade ("Tremidinha")
        // Adiciona um caos para ela não andar em linha reta perfeita como um robô
        vel_x += (Math.random() - 0.5) * 0.5;
        vel_y += (Math.random() - 0.5) * 0.5;

        // 4. Reação Social (Baseado na Visão)
        // Se tiver muita gente perto, ela fica nervosa e se move mais rápido!
        if (this.vizinhos_perto > 0) {
            // Se estiver "apertado", a célula ganha um boost de velocidade para tentar sair
            vel_x *= 2; 
            vel_y *= 2;
            
            // (Visual) Muda de cor se estiver vendo alguém (só para teste)
            this.cor_neon = '#FF0000'; // Fica com borda vermelha
        } else {
            this.cor_neon = '#0026ffff'; // Borda azul normal
        }

        // 5. Aplica o movimento
        this.x_real += vel_x;
        this.y_real += vel_y;
    }

    desenhar(deslocamento_x, deslocamento_y) {
        // --- AGORA A CÉLULA PENSA E MOVE ANTES DE DESENHAR ---
        this.tomar_decisao_e_mover();

        // Cálculo de posição na tela (igual antes)
        const x_virtual = (this.x_real * zoom.valor) + deslocamento_x;
        const y_virtual = (this.y_real * zoom.valor) + deslocamento_y;
        const r_virtual = this.raio_real * zoom.valor;

        // Culling (Otimização visual)
        if (x_virtual + r_virtual < 0 || x_virtual - r_virtual > largura_tela_real ||
            y_virtual + r_virtual < 0 || y_virtual - r_virtual > altura_tela_real) {
            return; 
        }

        // Desenho
        ctx.beginPath();
        ctx.arc(x_virtual, y_virtual, r_virtual, 0, Math.PI * 2);
        
        ctx.fillStyle = this.cor_preenchimento;
        
        // Neon
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.cor_neon; 
        ctx.strokeStyle = this.cor_neon;
        ctx.lineWidth = 1;

        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

export function gerar_celulas() {
    const quantidade = Math.floor(Math.random() * (QUANTIDADE_MAX - QUANTIDADE_MIN + 1)) + QUANTIDADE_MIN;
    for (let i = 0; i < quantidade; i++) {
        lista_celulas.push(new Celula());
    }
    
    // --- Célula de Teste (para você ver logo de cara) ---
    // Cria um "grupinho" no centro para testar a visão
    for(let k=0; k<5; k++) {
        const c = new Celula();
        c.x_real = 200 + (Math.random()*20);
        c.y_real = 200 + (Math.random()*20);
        lista_celulas.push(c);
    }
    
    console.log(`Simulação iniciada com ${lista_celulas.length} células vivas.`);
}

export function desenhar_todas_celulas(deslocamento_x, deslocamento_y) {
    for (let i = 0; i < lista_celulas.length; i++) {
        lista_celulas[i].desenhar(deslocamento_x, deslocamento_y);
    }
}