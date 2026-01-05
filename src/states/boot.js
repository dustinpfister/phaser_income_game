import { Game } from './game.js';

const create_state = ( date = new Date() ) => {
    return {
        cash: 0.00,
        upgrade_costs: 0.00,
        clicks: [
            //[1, 10000]
        ],
        upgrades: { manual: 0, ac0 : 0, ac1 : 0, ac2 : 0, ac3 : 0, ac4 : 0, ac5 : 0, ac6 : 0, ac7 : 0, ac8 : 0, ac9 : 0 },
        auto_clickers: [ /*{ time:       7500, per: 0, last_update: date.getTime() } */ ]
    };
};

class Boot extends Phaser.Scene {

    constructor (config) {
        super(config);
        this.key = 'Boot';
    }
    
    preload(){
        this.load.bitmapFont('min_5px_7px', 'fonts/min_5px_7px.png', 'fonts/min_5px_7px.xml');
    }

    create () {
    
        // load/create game save and set to registry
        let save = create_state();
        const save_str = localStorage.getItem('income_game_save');
        if(save_str){
            const obj_save = JSON.parse( save_str );
            
            console.log(obj_save)
            
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

