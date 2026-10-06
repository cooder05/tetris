class tetriminos{
    //TODO
    //change the way the blocks Path2D obj representation to simplify adding to the stack,
    block_type;
    block_shape;
    context;
    position = [];
    //curr: actual block state
    curr_block_Y = -1;
    curr_block_X = 5;
    curr_block_Direction = Directions.N;
    //next:(buffer) all movements stored here first to check if move is possible before changing the actual block state
    next_block_Direction = this.curr_block_Direction;
    next_block_Y = this.curr_block_Y;
    next_block_X = this.curr_block_X;
    static lock_time = 500;
    static max_lock_moves = 15;
    lock_moves = 0;
    start_lock_time;
    
    
    constructor(type){
        console.log("block created");
        this.block_type = type;
        this.block_shape = type.shape2;
        this.curr_block_Y = type.start_pos[1];
        this.curr_block_X = type.start_pos[0];

        this.next_block_Y = type.start_pos[1];
        this.next_block_X = type.start_pos[0];
    }

    reset(){
        this.context;
        this.position = [];
        this.block_shape = this.block_type.shape2;
        this.curr_block_Y = this.block_type.start_pos[1];
        this.curr_block_X = this.block_type.start_pos[0];
        this.curr_block_Direction = Directions.N;
        this.block_Speed = 1000;

        this.next_block_Direction = this.curr_block_Direction;
        this.next_block_Y = this.curr_block_Y;
        this.next_block_X = this.curr_block_X;
    }

    update(timestamp){
        var new_shape;
        var kick_shape;
        //movement check
        if (this.curr_block_X !== this.next_block_X){
            if(!this.is_colision(this.block_shape,[this.next_block_X,this.next_block_Y],timestamp)){
                this.curr_block_X = this.next_block_X;
                this.start_lock_time = undefined;//reset lockdown timer
            }else{
                this.next_block_X = this.curr_block_X;
            }
        }else if(this.curr_block_Y !== this.next_block_Y){
            if(!this.is_colision(this.block_shape,[this.next_block_X,this.next_block_Y],timestamp)){
                this.curr_block_Y = this.next_block_Y;
                this.start_lock_time = undefined;//reset lockdown timer
            }else{
                this.next_block_Y = this.curr_block_Y;
            }
        }
        //rotation check
        if (this.curr_block_Direction !== this.next_block_Direction){
            new_shape = this.block_shape.map(points =>[-points[1],points[0]]); //cw rotation
            //new_shape = this.block_shape.map(points =>[points[1],-points[0]]); ccw rotation

            //SRS check kickback
            for (const [x,y] of TLJSZ_OFFSET[this.curr_block_Direction][this.next_block_Direction]){
                kick_shape = new_shape.map(points => [points[0]+x,points[1]+y]);
                if (this.is_colision(kick_shape,[this.curr_block_X,this.curr_block_Y],timestamp)){
                    continue
                }else{
                    this.block_shape = new_shape;
                    this.curr_block_X += x;
                    this.curr_block_Y += y;
                    this.curr_block_Direction = this.next_block_Direction; //update direction
                    this.start_lock_time = undefined;//reset lockdown timer
                    break;
                }
                
            }
            this.next_block_Direction = this.curr_block_Direction; //reset direction if no center work
        }
        
    }

    
    draw_shape(){
        ctx.save();
        
        ctx.translate((this.curr_block_X)*unit.px,(this.curr_block_Y)*unit.px);
        ctx.fillStyle = this.block_type.color;
        ctx.strokeStyle = this.block_type.color;
        ctx.fillRect(this.block_shape[0][0]*unit.px ,this.block_shape[0][1]*unit.px, unit.px, unit.px);
        ctx.fillRect(this.block_shape[1][0]*unit.px ,this.block_shape[1][1]*unit.px, unit.px, unit.px);
        ctx.fillRect(this.block_shape[2][0]*unit.px ,this.block_shape[2][1]*unit.px, unit.px, unit.px);
        ctx.fillRect(this.block_shape[3][0]*unit.px ,this.block_shape[3][1]*unit.px, unit.px, unit.px);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(this.curr_block_X*unit.px+0.5,this.curr_block_Y*unit.px+0.5,20,20);
        ctx.restore();

    }
    //drop/movement()
    drop(){
        this.next_block_Y = this.curr_block_Y+1;
        }

    
    //code looks inefficent need to check if i can sreamline the calculation/check
    is_colision(shape,pos,timestamp){
        for (let block of shape){
            const [x,y] = block;
            if (y+pos[1]>19){
                if (!this.start_lock_time){
                    this.start_lock_time = timestamp;
                    this.lock_moves++;
                    console.log("lock dodge",this.lock_moves);
                    console.log(y+pos[1],"set",timestamp);
                }
                return true;
            }else if(!(0 <= x+pos[0] && x+pos[0]<=9)){
                return true;
            }else{ 
                if ((y+pos[1]>0) && game.stack[y+pos[1]][x+pos[0]] != "*"){
                    if (!this.start_lock_time){
                        this.start_lock_time = timestamp;
                        this.lock_moves++;
                        console.log("lock dodge",this.lock_moves);
                    }
                    return true;
                }
            }
        }
        return false;
    }
}