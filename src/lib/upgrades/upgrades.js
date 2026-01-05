
class Upgrades {

    constructor ( config = {} ) {
        this.config = config;
        this.objects = {}; 
        this.get_cost = config.get_cost || this.get_cost;
        this.for_level = config.for_level || this.for_level;
        const keys = Object.keys( this.config.upgrades );
        let ik = 0;
        while(ik < keys.length){
            const key = keys[ik];
            const ug = {};
            ug.key = key;
            ug.index = ik;
            ug.type = key.match(/\D+/)[0];
            ug.type_index = parseInt(key.match(/\d+/)[0]);
            this.setUG(ug, 0);          
            ik += 1;
        }
    }

    for_level (ug, level, config) { }

    get_ug_def ( a ){
        return this.config.upgrades[ typeof a === 'object' ? a.key : a ];
    }

    get_cost (ug, level, config) { return 0; }

    reset () {
        const keys = Object.keys(this.objects);
        let i = 0;
        while( i < keys.length ){
            this.setUG( this.objects[ keys[i] ], 0 );
            i += 1;
        }
    }

    save_load (save={}) {
        const keys = Object.keys(this.objects);
        let i = 0;
        while( i < keys.length ){
            const ug = this.objects[ keys[ i ] ];
            const ug_save = save[ ug.key ];
            this.setUG(ug, 0);
            if(ug_save){
                this.setUG(ug, ug_save);
            }
            i += 1;
        }
    }

    save_get () {
        const keys = Object.keys(this.objects);
        const save = {};
        let i = 0;
        while( i < keys.length ){
            const ug = this.objects[ keys[i] ];
            save[ ug.key ] = ug.level;
            i += 1;
        }
        return save;
    }

    setUG (ug, level=0) {
        ug.level = level;
        ug.cost = this.get_cost( ug, ug.level + 1 );
        this.for_level(ug, ug.level, this.config );        
        this.objects[ug.key] = ug;
    }

    tabulate_cost () {
        let cost = 0;
        let level = this.objects[key].level;
        while(level > 0){
            cost += this.get_cost();
            level -= 1;
        }
        return cost;
    }

    // based on what I have for a diminishing-returns method. 
    // https://dustinpfister.github.io/2021/07/28/js-function-diminishing-returns/
    static dim_return (number=0, mid_point=30) {
        return 1 - 1 / (number / mid_point + 1);
    }

};

export { Upgrades };
