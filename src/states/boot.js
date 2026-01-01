const MANUAL_RATES = [
    0.05, 0.10, 0.25, 0.50, 0.75, 
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
    12, 15, 
    20, 25, 30, 35, 40, 45, 50, 55, 60, 64, 70, 75, 80, 85, 90, 95, 100
];

const MANUAL_LEVEL_CAP = 30;

const get_upgrade_cost = ( level=1, start=10, base=2 ) => {
    return start * level + Math.pow( base, level );
};

const create_state = ( date = new Date() ) => {
    return {
        cash: 0.00,
        upgrade_costs: 0.00,
        clicks: [],
        upgrades: {
            manual: { level: 0 }
        },
        //manual_rate_index: 0,
        auto_clickers: [
        /*
            { rate:   0.01, time:       7500, per: 0, last_update: date.getTime() },
            { rate:   0.05, time:      20000, per: 0, last_update: date.getTime() },
            { rate:   0.10, time:      30000, per: 0, last_update: date.getTime() },
            { rate:   0.25, time:      55000, per: 0, last_update: date.getTime() },
            { rate:   1.00, time:     180000, per: 0, last_update: date.getTime() },
            
            { rate:   5.00, time:     750000, per: 0, last_update: date.getTime() },
            { rate:  10.00, time:    1250000, per: 0, last_update: date.getTime() },
            { rate:  20.00, time:    1750000, per: 0, last_update: date.getTime() }, 
            { rate:  50.00, time:    2500000, per: 0, last_update: date.getTime() }, 
            { rate: 100.00, time:    4250000, per: 0, last_update: date.getTime() }
            */
            
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
    const state_new = create_state( date );
    localStorage.setItem('income_game_save', JSON.stringify( state_new ) );
    state = Object.assign({}, state_new );
};

const get_per_hour = ( ac ) => {
    return ac.rate / ac.time * ( 1000 * 60 * 60 );
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

const tabulate_upgrade_costs = (state) => {
    let cost = 0;
    let level = state.upgrades.manual.level;
    while(level > 0){
        cost += get_upgrade_cost( level , 10, 2 );
        level -= 1;
    }
    return cost;
}

//console.log( get_upgrade_cost( 2, 10, 2 ) )
//console.log( tabulate_upgrade_costs( { upgrades: { manual: { level: 2 } } } ) );
//console.log( tabulate_upgrade_costs( state ) );

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
    
    preload(){
        // FONTS
        this.load.bitmapFont('min_3px_5px', 'fonts/min_3px_5px.png', 'fonts/min_3px_5px.xml');
    }

    create () {
        const state2 = this;
        const font_size = 25;
        
        // create main display objects
        const gr_main = this.add.graphics();
        gr_main.setName('graph_main');
        const line_main = this.add.bitmapText( 0, 0, 'min_3px_5px', '', font_size);
        line_main.setName('text_main');
        line_main.setScrollFactor(0, 0);
        
        // create manual display objects
        {
            const gr_ma = this.add.graphics();
            const x = 640 - 175 - 25;
            const y = 100;
            gr_ma.x = x; gr_ma.y = y;
            gr_ma.setName('graph_manual');
            set_graphics_interactive(gr_ma, 0, 0, 175, 64);
            gr_ma.on('pointerdown', ()=>{
                state2.manual_work();
            })
            const line = this.add.bitmapText( 0, 0, 'min_3px_5px', '', font_size );
            line.x = x;
            line.y = y;
            line.setName('text_manual');
        }
        // create manual_upgrade display objects
        {
            const gr_ma = this.add.graphics();
            const x = 640 - 175 - 25;
            const y = 200;
            gr_ma.x = x; gr_ma.y = y;
            gr_ma.setName('graph_manual_upgrade');
            set_graphics_interactive(gr_ma, 0, 0, 175, 64);
            gr_ma.on('pointerdown', ()=>{
                //console.log('yes now');
                state2.manual_upgrade();
            })
            const line = this.add.bitmapText( 0, 0, 'min_3px_5px', '', font_size );
            line.x = x;
            line.y = y;
            line.setName('text_manual_upgrade');
        }
        
        // create auto_clicker display objects
        const bar_width = 150;
        const bar_height = 25;
        const max = 10;
        let i = 0, x=0, y=0;
        while(i < max){
            const gr = this.add.graphics();
            gr.setName('ac_graph_' + i);
            const line = this.add.bitmapText( 0, 0, 'min_3px_5px', 'foo', font_size);
            line.setName('ac_text_' + i);
            line.setScrollFactor(0, 0);
            i += 1;
        }    
    }
    
    manual_work () {
        console.log('manual work action:');
        const rate = MANUAL_RATES[ state.upgrades.manual.level ];
        update_click_rate(state, rate, 1);
        console.log(state);
        console.log('');
    }
    
    manual_upgrade () {
        console.log('manual upgrade requested');
        const level_current = state.upgrades.manual.level;
        const level_next = level_current + 1;
        const upgrade_cost = get_upgrade_cost( level_next, 10, 2 );
        console.log('current level : ' + level_current );
        console.log('next level : ' + level_next );
        console.log('cash : ' + state.cash );
        console.log('upgrade cost: ' + upgrade_cost);
        if( state.cash >= upgrade_cost ){
            state.upgrades.manual.level = level_next;
            console.log('upgrade successful!');
        }
        if( state.cash < upgrade_cost ){
            console.log('need more money to upgrade');
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
            const graph = state2.children.getByName('ac_graph_' + i);
            const text = state2.children.getByName('ac_text_' + i);         
            const y = start_y + ( bar_height + spacing ) * i;
            graph.x = start_x; graph.y = y;
            text.x = start_x + bar_width + spacing; text.y = y;
            graph.clear();
            if(!ac){
                text.text='';
                i += 1;
                continue;
            }
            const w = bar_width * ac.per;
            graph.fillStyle(0xafafaf);
            graph.fillRect(0, 0, bar_width, bar_height);    
            graph.lineStyle(2, 0xffffff, 1.0);
            graph.fillStyle(0x00ff00);
            graph.fillRect(0, 0, w, bar_height);
            graph.strokeRect(0, 0, w, bar_height);   
            text.text = format_cash( ac.rate, 10 ) + ' ' + format_cash( get_per_hour( ac), 10 ) + '/hour';
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
        const level = state.upgrades.manual.level;
        text.text = 'Manual Work\n\nlv ' + level  + ' (' + format_cash(MANUAL_RATES[level], 7) + ')';
        text.setCharacterTint(0, text.text.length, true, 0xffffff);  
        text.setDropShadow(1, 1, 0x2a2a2a, 1);   
    }
    
    render_manual_upgrade_button () {
        const graph = this.children.getByName('graph_manual_upgrade');
        const text = this.children.getByName('text_manual_upgrade');
        graph.fillStyle(0xafafaf);
        graph.fillRect(0, 0, 175, 64);
        const level_current = state.upgrades.manual.level;
        const level_next = level_current + 1;
        const upgrade_cost = get_upgrade_cost( level_next, 10, 2 );
        text.text = 'Upgrade Manual \n\n ' + format_cash( upgrade_cost, 10 ) + '';
        text.setCharacterTint(0, text.text.length, true, 0xffffff);  
        text.setDropShadow(1, 1, 0x2a2a2a, 1);   
    }
    
    update_auto_clickers () {
        const now = new Date();
        let i_ac = 0;
        const len_ac = state.auto_clickers.length;
        while(i_ac < len_ac){
            const ac = state.auto_clickers[i_ac];
            const lt = new Date( ac.last_update ).getTime();
            const ms = now.getTime() - lt;
            ac.per = ms / ac.time;
            if(ac.per >= 1){
                ac.last_update = now.getTime() - ( ac.per % 1 ) * ac.time;
                const per = Math.floor( ac.per );
                update_click_rate(state, ac.rate, per);
                ac.per = 1;
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

