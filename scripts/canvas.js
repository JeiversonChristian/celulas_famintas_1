// canvas.js
// Esse é o módulo que controla o canvas onde é desenhada a simulação

// Configuração do canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Definindo o tamanho da tela real
canvas.width = 1300;
const largura_tela_real = canvas.width;
canvas.height = 600;
const altura_tela_real = canvas.height;

// Zoom da tela
let zoom = { valor: 1 };

export { ctx, largura_tela_real, altura_tela_real, zoom };