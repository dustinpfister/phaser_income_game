const MANUAL_RATES = [
    0.05, 0.10, 0.25, 0.50, 0.75, 
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
    12, 15, 
    20, 25, 30, 35, 40, 45, 50, 55, 60, 64, 70, 75, 80, 85, 90, 95, 100
];

const UPGRADES = {
    manual : { start:        1, base: 2.00 },
    ac0:     { start:        1, base: 1.25, rate:   0.01, time_start: 10000 },
    ac1:     { start:      100, base: 1.50, rate:   0.05, time_start: 10000 },
    ac2:     { start:      250, base: 1.75, rate:   0.10, time_start: 10000 },
    ac3:     { start:      750, base: 2.00, rate:   0.25, time_start: 10000 },
    ac4:     { start:     1250, base: 2.50, rate:   0.50, time_start: 10000 },
    ac5:     { start:     5000, base: 2.75, rate:   1.00, time_start: 10000 },
    ac6:     { start:    12000, base: 3.00, rate:   5.00, time_start: 10000 },
    ac7:     { start:    50000, base: 3.05, rate:  10.00, time_start: 10000 },
    ac8:     { start:   100000, base: 3.75, rate:  50.00, time_start: 10000 },
    ac9:     { start:  1000000, base: 4.00, rate: 100.00, time_start: 10000 }
};

// using my old diminishing returns method! 
// https://dustinpfister.github.io/2021/07/28/js-function-diminishing-returns/
const dim_return = function (number=0, mid_point=30) {
    return 1 - 1 / (number / mid_point + 1);
};

const get_upgrade_cost = ( level=1, start=10, base=2 ) => {
    return start * level + Math.pow( base, level );
};

const create_state = ( date = new Date() ) => {

    return {
        cash: 0.00,
        upgrade_costs: 0.00,
        clicks: [
            //[1, 12191025.55]
        ],
        upgrades: {
            manual: 0,
            ac0 : 1, ac1 : 0, ac2 : 0, ac3 : 0, ac4 : 0, ac5 : 0, ac6 : 0, ac7 : 0, ac8 : 0, ac9 : 0
        },
        auto_clickers: [
            { time:       7500, per: 0, last_update: date.getTime() },
        ]
    };
};

const state_default = create_state();

let state = Object.assign({}, state_default);

// load state
const save = localStorage.getItem('income_game_save');
if(save){
    const obj_save = JSON.parse( save );
    state = Object.assign(state, obj_save);
}

window.reset = ( date = new Date() ) => {
    //const state_new = create_state( date );
    localStorage.clear();
    document.location.reload();
    //localStorage.setItem('income_game_save', JSON.stringify( state_new ) );
    //state = Object.assign({}, state_new );
    //document.location.reload();
};

const get_per_hour = ( state, index ) => {
    const ac = state.auto_clickers[index];
    const ug = UPGRADES['ac' + index];
    const uc = state.upgrades['ac' + index];
    if(uc === 0){
        return 0;
    }
    const per_hour = ug.rate / ac.time * ( 1000 * 60 * 60 );
    return per_hour;
};

const get_click_rec = (state, rate = 0.05 ) => {
    let i = 0;
    const len = state.clicks.length;
    while(i < len){
        const rec = state.clicks[i];
        if( rec[1] === rate ){
            return rec
        }
        i += 1;
    }
    return null;
};

const update_click_rate = (state, rate=0.10, click_delta = 1 ) => {
    let rec = get_click_rec( state, rate );
    if(!rec){
       state.clicks.push([ click_delta, rate ])
    }
    if(rec){
        rec[0] += click_delta;
    }
};

const tabulate_clicks = (state) => {
    return state.clicks.reduce((acc, rec) => {
        const count = rec[0], amount_per = rec[1];
        return acc + count * amount_per;
    }, 0);
};

const get_total_upgrades_cost = (state, key='manual') => {
    let cost = 0;
    let level = state.upgrades[ key ];
    while(level > 0){
        cost += get_upgrade_cost( level , UPGRADES[key].start, UPGRADES[key].base );
        level -= 1;
    }
    return cost;
}

const tabulate_upgrade_costs = (state) => {
    let cost = get_total_upgrades_cost(state, 'manual');
    let i_ac = 0;
    while(i_ac < 10){
        cost += get_total_upgrades_cost(state, 'ac' + i_ac);
        i_ac += 1;
    }
    return cost;
}

const clamp_cash = function(cash=0, min=-99999999999.99, max=999999999999.99){
    if(cash < min){ return min; }
    if(cash > max){ return max; }
    return cash;
};

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const format_cash = function(cash=0, chars=19){
    //-$99,999,999,999.99
    //..............$0.00
    //$999,999,999,999.99
    return formatter.format(cash).padStart(chars, '.');
};

const set_graphics_interactive = (gr, x=0, y=0, width=128, height=64) => {
    gr.setInteractive({
        hitArea: { x:x, y: y, width: width, height: height},
        hitAreaCallback : (shape, x, y) => {
            return x >= shape.x && x < shape.x + shape.width && y >= shape.y && y < shape.y + shape.height;
        } 
    });
};


class Boot extends Phaser.Scene {

    constructor (config) {
        super(config);
        this.key = 'Boot';
    }
    
    add_button ( suffix='', x=0, y=0, w=200, h=64, font_size=25 ) {
        const gr = this.add.graphics();
        gr.x = x; gr.y = y;
        gr.setName('graph_' + suffix);
        set_graphics_interactive(gr, 0, 0, w, h);
        const line = this.add.bitmapText( x, y, 'min_3px_5px', '', font_size);
        line.setName('text_' + suffix);
        line.setScrollFactor(0, 0);
        return gr;
    }
    
    preload(){
        // FONTS
        this.load.bitmapFont('min_3px_5px', 'fonts/min_3px_5px.png', 'fonts/min_3px_5px.xml');
    }
/*
    load_save () {
    
      
    }
    */

    create () {
        const state2 = this;
        
        //this.load_save();
        
        // create main display objects
        const gr_main = this.add.graphics();
        gr_main.setName('graph_main');
        const line_main = this.add.bitmapText( 0, 0, 'min_3px_5px', '', 25);
        line_main.setName('text_main');
        line_main.setScrollFactor(0, 0);
            
        // create manual display objects
        const gr_ma = this.add_button('manual', 640 - 175 - 25, 100, 175, 64);
        gr_ma.on('pointerdown', ()=>{
            state2.manual_work();
        });
        
        // create manual_upgrade display objects
        const gr_mu = this.add_button('manual_upgrade', 640 - 175 - 25, 200, 175, 64);
        gr_mu.on('pointerdown', ()=>{
            state2.manual_upgrade();
        });
        
        // create auto_clicker display objects
        const bar_width = 150;
        const bar_height = 25;
        const max = 10;
        let i = 0, x=0, y=0;
        while(i < max){
            const gr_ac = this.add_button('ac' + i, 0, 0, 200, 25);
            gr_ac.on('pointerdown', () => {
                state2.auto_clicker_upgrade( parseInt(gr_ac.name.replace(/graph_ac/, '')) )
            });
            i += 1;
        }    
    }
    
    manual_work () {
        const rate = MANUAL_RATES[ state.upgrades.manual ];
        update_click_rate(state, rate, 1);
    }
    
    manual_upgrade () {
        console.log('manual upgrade requested');
        const level_current = state.upgrades.manual;
        const level_next = level_current + 1;
        const upgrade_cost = get_upgrade_cost( level_next, UPGRADES.manual.start, UPGRADES.manual.base );
        if( state.cash >= upgrade_cost ){
            state.upgrades.manual = level_next;
            console.log('upgrade successful!');
        }
        if( state.cash < upgrade_cost ){
            console.log('need more money to upgrade');
        }
    }
    
    auto_clicker_upgrade (index=0) {
        console.log('auto clicker upgrade requested for ac index: ' + index);
        const key = 'ac' + index;
        const level_current = state.upgrades[key];
        const level_next = level_current + 1;
        const upgrade_cost = get_upgrade_cost( level_next, UPGRADES[key].start, UPGRADES[key].base );
        
        //console.log(level_current, level_next, upgrade_cost);
        if( state.cash >= upgrade_cost ){
            state.upgrades[key] = level_next;
            console.log('upgrade successful!');
        }
        if( state.cash < upgrade_cost ){
            console.log('need ' + upgrade_cost + ' to upgrade');
        }
    }
    
    render_main () {
        const graph = this.children.getByName('graph_main');
        graph.fillStyle(0xafafaf);
        graph.fillRect(0, 0, 300, 50);
        graph.x = 25;
        graph.y = 25;
        const text = this.children.getByName('text_main');
        text.x = 25;
        text.y = 30;
        text.text = format_cash(state.cash, 15);
        text.setCharacterTint(0, text.text.length, true, 0xffffff);  
        text.setDropShadow(1, 1, 0x2a2a2a, 1);
    }
    
    render_auto_clickers () {
        const state2 = this;
        const bar_width = 100;
        const bar_height = 25;
        const spacing = 10;
        const max = 10;
        const start_x = 25, start_y = 85;
        let i = 0;
        while(i < max){
            const ac = state.auto_clickers[i];  
            const ug = UPGRADES['ac' + i]
            const graph = state2.children.getByName('graph_ac' + i);
            const text = state2.children.getByName('text_ac' + i);  
            const y = start_y + ( bar_height + spacing ) * i;
            graph.x = start_x; graph.y = y;
            text.x = start_x + bar_width + spacing; text.y = y;
            graph.clear();
            /*
            if(!ac){
                text.text='';
                i += 1;
                continue;
            }
            */
            const w = bar_width * ac.per;
            graph.fillStyle(0xafafaf);
            graph.fillRect(0, 0, bar_width, bar_height);    
            graph.lineStyle(2, 0xffffff, 1.0);
            graph.fillStyle(0x00ff00);
            graph.fillRect(0, 0, w, bar_height);
            graph.strokeRect(0, 0, w, bar_height);   
            text.text = ug.rate + ' ( ' + get_per_hour( state, i ).toFixed(2) + '/hour) ';
            text.setCharacterTint(0, text.text.length, true, 0xffffff);  
            text.setDropShadow(1, 1, 0x2a2a2a, 1);
            i += 1;
        }
    }
    
    render_manual_button () {
        const graph = this.children.getByName('graph_manual');
        const text = this.children.getByName('text_manual');
        graph.fillStyle(0xafafaf);
        graph.fillRect(0, 0, 175, 64);
        const level = state.upgrades.manual;
        text.text = 'Manual Work\n\nlv ' + level  + ' (' + format_cash(MANUAL_RATES[level], 7) + ')';
        text.setCharacterTint(0, text.text.length, true, 0xffffff);  
        text.setDropShadow(1, 1, 0x2a2a2a, 1);   
    }
    
    render_manual_upgrade_button () {
        const graph = this.children.getByName('graph_manual_upgrade');
        const text = this.children.getByName('text_manual_upgrade');
        graph.fillStyle(0xafafaf);
        graph.fillRect(0, 0, 175, 64);
        const level_current = state.upgrades.manual;
        const level_next = level_current + 1;
        const upgrade_cost = get_upgrade_cost( level_next, UPGRADES.manual.start, UPGRADES.manual.base );
        text.text = 'Upgrade Manual \n\n ' + format_cash( upgrade_cost, 10 ) + '';
        text.setCharacterTint(0, text.text.length, true, 0xffffff);  
        text.setDropShadow(1, 1, 0x2a2a2a, 1);   
    }
    
    update_auto_clickers () {
        const now = new Date();
        let i_ac = 0;
        const len_ac = 10; //state.auto_clickers.length;
        while(i_ac < len_ac){
            let ac = state.auto_clickers[i_ac];
            const ug = state.upgrades['ac' + i_ac];
          
            if(!ac){
                ac = state.auto_clickers[i_ac] = {};
                ac.rate = ug.rate;
                ac.time = ug.time_start;
                ac.last_update = new Date().getTime();
            }
          
            ac.time = UPGRADES['ac' + i_ac].time_start;
            
            if(ug <= 0){
               ac.per = 0;
            }
            if(ug > 0){
                const lt = new Date( ac.last_update ).getTime();
                const ms = now.getTime() - lt;
                ac.per = ms / ac.time;
                if(ac.per >= 1){
                    ac.last_update = now.getTime() - ( ac.per % 1 ) * ac.time;
                    const per = Math.floor( ac.per );
                    update_click_rate(state, ug.rate, per);
                    ac.per = 1;
                }
            }
            i_ac += 1;
        }
    }
    
    lt = new Date()
    update () {
        const now = new Date();
        if(now - this.lt >= 100){
            this.update_auto_clickers();       
            state.cash = tabulate_clicks(state);
            state.upgrade_costs = tabulate_upgrade_costs(state);
            state.cash = state.cash - state.upgrade_costs;
            state.cash = clamp_cash(state.cash);
            
            localStorage.setItem('income_game_save', JSON.stringify( state ) );
            this.render_main();
            this.render_manual_button();
            this.render_manual_upgrade_button();
            this.render_auto_clickers();
            this.lt = now;
        }
    }
        
}

export { Boot }

