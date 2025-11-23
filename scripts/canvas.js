// Esse é o módulo que controla o canvas onde é desenhada a simulação

// Configuração do canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Definindo o tamanho da tela
canvas.width = 1300;
const largura_tela = canvas.width;
canvas.height = 600;
const altura_tela = canvas.height;

export { ctx, largura_tela, altura_tela };