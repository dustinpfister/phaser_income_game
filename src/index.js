import { Boot } from './states/boot.js';

const canvas = document.querySelector('#canvas_game');
canvas.width = 640;
canvas.height = 480;

const config = {
    parent: 'container_flr',
    canvas: canvas,
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#000000',
    scene: Boot,
    zoom: 1,
    render: { pixelArt: true  },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x:0 }
        }
    }
};
const game = window.game = new Phaser.Game(config);

