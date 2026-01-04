import { Game } from './game.js';

const create_state = ( date = new Date() ) => {
    return {
        cash: 0.00,
        upgrade_costs: 0.00,
        clicks: [
            [2, Math.pow(10, 9) ],
            [8, Math.pow(10, 8) ],
            [5, Math.pow(10, 7) ],
            [1, 927023.07]
        ],
        upgrades: { manual: 0, ac0 : 30, ac1 : 30, ac2 : 30, ac3 : 30, ac4 : 30, ac5 : 30, ac6 : 30, ac7 : 30, ac8 : 30, ac9 : 30 },
        auto_clickers: [ /*{ time:       7500, per: 0, last_update: date.getTime() } */ ]
    };
};

class Boot extends Phaser.Scene {

    constructor (config) {
        super(config);
        this.key = 'Boot';
    }
    
    preload(){
        this.load.bitmapFont('min_3px_5px', 'fonts/min_3px_5px.png', 'fonts/min_3px_5px.xml');
    }

    create () {
    
        // load/create game save and set to registry
        let save = create_state();
        const save_str = localStorage.getItem('income_game_save');
        if(save_str){
            const obj_save = JSON.parse( save_str );
            save = Object.assign({}, save, obj_save);
        }
        this.registry.set('save', save);
        
        // create additional states and start next state
        this.scene.add('Game', Game, false);
        this.scene.start('Game');
        
        // egg api
        const egg = {};
        
        // clear local storage and restart the game
        egg.reset = ( ) => {
            localStorage.clear();
            document.location.reload();
        };
        
        window.egg = egg;

        
    }
        
}

export { Boot }

