
class Upgrades {

    constructor ( config = {} ) {   
        //this.shared = config.shared || {};
        //this.upgrades = config.upgrades || {};
        this.config = config;
        this.objects = {}; 
        this.get_cost = config.get_cost || this.get_cost;
        this.for_level = config.for_level || this.for_level;
        const keys = Object.keys( this.config.upgrades );
        let ik = 0;
        while(ik < keys.length){
            const key = keys[ik];
            const ug = {}; //Object.assign({}, this.upgrades[key] ); //this.upgrades[key];
            ug.key = key;
            ug.index = ik;
            ug.type = key.match(/\D+/)[0];
            ug.type_index = parseInt(key.match(/\d+/)[0]);
            
            ug.level = 0;
            ug.cost = this.get_cost( ug, ug.level + 1, this.config );
            this.for_level(ug, ug.level, this.config );
            
            this.objects[key] = ug;
            
            ik += 1;
        }
    
    }

    get_ug_def ( a ){
        return this.config.upgrades[ typeof a === 'object' ? a.key : a ];
    }

    get_cost (ug, level, config) { return 0; }
    for_level (ug, level, config) { }
    
    // based on what I have for a diminishing-returns method. 
    // https://dustinpfister.github.io/2021/07/28/js-function-diminishing-returns/
    static dim_return (number=0, mid_point=30) {
        return 1 - 1 / (number / mid_point + 1);
    }

};

export { Upgrades };
