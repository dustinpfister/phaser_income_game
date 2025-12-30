const MANUAL_RATES = [
    0.05, 0.10, 0.25, 0.50, 0.75, 
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
    12, 15, 
    20, 25, 30, 35, 40, 45, 50, 55, 60, 64, 70, 75, 80, 85, 90, 95, 100
];

const create_state = ( date = new Date() ) => {
    return {
        cash: 0.00,
        clicks: [], 
        manual_rate_index: 0,
        auto_clickers: [
        
            { clicks: 1, rate:   0.01, time:      10000, per: 0, last_update: date.getTime() },
            { clicks: 1, rate:   0.25, time:     100000, per: 0, last_update: date.getTime() },
            { clicks: 1, rate:   3.00, time:    1000000, per: 0, last_update: date.getTime() },
            { clicks: 1, rate:  50.00, time:   10000000, per: 0, last_update: date.getTime() },
            { clicks: 1, rate: 750.00, time:  100000000, per: 0, last_update: date.getTime() },
            
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
    return ac.rate / ac.time * ( 1000 * 60 * 60 ) * ac.clicks;
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

const user_click = (state) => {
    const rate = MANUAL_RATES[ state.manual_rate_index ];
    update_click_rate(state, rate, 1);
};

const tabulate_clicks = (state) => {
    return state.clicks.reduce((acc, rec) => {
        const count = rec[0], amount_per = rec[1];
        return acc + count * amount_per;
    }, 0);
};


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

const update = function(){
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
            update_click_rate(state, ac.rate, ac.clicks * per);
            ac.per = 1;
            
        }
        i_ac += 1;
    }
    state.cash = tabulate_clicks(state);
    state.cash = clamp_cash(state.cash);
    
    localStorage.setItem('income_game_save', JSON.stringify( state ) );
    
};

const canvas = document.getElementById('canvas_game');
const ctx = canvas.getContext('2d');
const render = function(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);  
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top';
    ctx.font = '20px monospace';
    ctx.fillText(  format_cash( state.cash ), 10, 10);
    
    let i_ac = 0;
    const len_ac = state.auto_clickers.length;
    while(i_ac < len_ac){
        const ac = state.auto_clickers[i_ac];
        const x = 20, y = 100 + 25 * i_ac;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.fillRect(x, y, 200 * ac.per, 20);
        ctx.strokeRect( x, y, 200, 20);
        ctx.fillText( format_cash( ac.rate, 7 ) + ' ' + format_cash( get_per_hour( ac), 7 ) + '/hour', x + 225, y);
        
        i_ac += 1;
    }
    
};

canvas.addEventListener('click', () => {
   user_click(state);
});

// update loop
const loop = function(){
    update();
    render();
};

// render state
setInterval(loop, 33);

