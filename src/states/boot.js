import { Game } from './game.js';


const create_state = ( date = new Date() ) => {
    return {
        cash: 0.00,
        upgrade_costs: 0.00,
        clicks: [
            [1, 250000]
            //[1, 2.25]
            //[1, 12191025.55]
        ],
        upgrades: {
            manual: 0,
            ac0 : 0, ac1 : 0, ac2 : 0, ac3 : 0, ac4 : 0, ac5 : 0, ac6 : 0, ac7 : 0, ac8 : 0, ac9 : 0
        },
        auto_clickers: [
            //{ time:       7500, per: 0, last_update: date.getTime() },
        ]
    };
};

//const state_default = create_state();


class Boot extends Phaser.Scene {

    constructor (config) {
        super(config);
        this.key = 'Boot';
    }
    
    preload(){
        // FONT
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
        console.log('save object: ',save);
  
  
        // create additional states and start next state
        this.scene.add('Game', Game, false);
        this.scene.start('Game');
    }
        
}

export { Boot }

