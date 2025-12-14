// Esse é o módulo que controla o canvas onde é desenhada a simulação

// Configuração do canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Definindo o tamanho da tela real
canvas.width = 1300;
const largura_tela_real = canvas.width;
canvas.height = 600;
const altura_tela_real = canvas.height;

// Definindo o tamanho da tela virtual (a que aparece com o zoom)
let largura_tela_virtual = { valor: largura_tela_real};
let altura_tela_virtual = {valor: altura_tela_real};

// Zoom da tela
let zoom = { valor: 1 }; // [0,1x - 10x]

export { ctx, largura_tela_real, altura_tela_real, largura_tela_virtual, altura_tela_virtual, zoom };