
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//a 0.5 pixel offset to aligne with the display pixel in laptop so no blurry edges
//minos
const unit = {
    px : 30,
    width: 40,
    height: 40,
    color: "#00ffcc"
};
//Tetriminos
const I ={
    shape: new Path2D(),
    start_pos: [3,-1],
    shape2: [[0,0],[1,0],[2,0],[3,0],],
    color: "#00ffcc",
    centers: {
        0:[0,-1],
        1:[2,0],
        2:[1,2],
        3:[-1,1]
    }
};
I.shape.rect(0,0,unit.px,4*unit.px);
const O ={
    shape: new Path2D(),
    start_pos: [4,-2],
    shape2: [[0,0],[0,1],[1,0],[1,1]],
    color: "#ffee00",
    centers: {
        0:[0,0],
        1:[2,0],
        2:[2,2],
        3:[0,2]
    }
};
O.shape.rect(0,0,2*unit.px,2*unit.px);
const T ={
    shape: new Path2D(),
    start_pos: [4,-1],
    shape2: [[0,0],[-1,0],[1,0],[0,-1],],
    color: "#ff00ee",
    centers: {
        0:[-1,0],
        1:[1,-1],
        2:[2,1],
        3:[0,2]
    }
};
T.shape.rect(0,0,3*unit.px,unit.px  );
T.shape.rect(unit.px,unit.px,unit.px,unit.px);
const L ={
    shape: new Path2D(),
    start_pos: [4,-1],
    shape2: [[0,0],[-1,0],[1,0],[1,-1]],
    color: "#ffb700",
    centers: {
        0:[0,-1],
        1:[2,0],
        2:[1,2],
        3:[-1,1]
    }
};
L.shape.rect(0,0,unit.px,3*unit.px  );
L.shape.rect(unit.px,2*unit.px  ,unit.px,unit.px  );
const J ={
    shape: new Path2D(),
    start_pos: [4,-1],
    shape2: [[0,0],[-1,0],[1,0],[-1,-1]],
    color: "#0099ff",
    centers: {
        0:[-1,-1],
        1:[2,-1],
        2:[2,2],
        3:[-1,2]
    }
};
J.shape.rect(unit.px,0,unit.px,3*unit.px);
J.shape.rect(0,2*unit.px,unit.px,unit.px);
const S ={
    shape: new Path2D(),
    start_pos: [4,-1],
    shape2: [[0,0],[-1,0],[0,-1],[1,-1]],
    color: "#00ff37",
    centers: {
        0:[-1,0],
        1:[1,-1],
        2:[2,1],
        3:[0,2]
    }
};
S.shape.rect(0,unit.px,2*unit.px,unit.px);
S.shape.rect(unit.px,0,2*unit.px,unit.px);
const Z ={
    shape: new Path2D(),
    start_pos: [4,-1],
    shape2: [[0,0],[-1,-1],[0,-1],[1,0]],
    color: "#ff1100",
    centers: {
        0:[-1,0],
        1:[1,-1],
        2:[2,1],
        3:[0,2]
    }
};
Z.shape.rect(0,0,2*unit.px,unit.px);
Z.shape.rect(unit.px,unit.px,2*unit.px,unit.px);


const Shape_arr = [I,O,T,L,J,S,Z];
//Rotation kick-back/centers for SRS system N:north E:east S:south W:west
//the order of elements in the list must be correct
const Directions = {
    'N':0,
    'E':1,
    'S':2,
    'W':3
}

const TLJSZ_OFFSET = {
    [Directions.N]: {
        [Directions.E]: [[0,0], [1,0], [1,1], [0,-2], [1,-2]]
    },
    [Directions.E]: {
        [Directions.S]: [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]]
    },
    [Directions.S]: {
        [Directions.W]: [[0,0], [1,0], [1,-1], [0,2], [1,2]]
    },
    [Directions.W]: {
        [Directions.N]: [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]]
    }
}


canvas.width = unit.px*10;
canvas.height = unit.px*20;


const lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
lingrad.addColorStop(1, "white");
lingrad.addColorStop(0, "transparent");

function DrawGrid(){
    
    ctx.save();
    ctx.lineWidth = 1;
    for(var x=0.5; x<=canvas.width; x+= unit.px){
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for(var y=0.5; y<=canvas.height; y+= unit.px  ){
        ctx.moveTo(0 ,y + unit.px);
        ctx.lineTo(canvas.width,y + unit.px);
    }
    ctx.strokeStyle = lingrad;
    ctx.stroke();
    ctx.restore();
}

/*    check canvas resolution on zoom py only drawing one pixel continously
function check(){

    ctx.save();
    for(var x=0; x<=255; x+=2){
        for(var y=0; y<=255;y+=2){
            ctx.fillStyle = `rgb(255 ${x} ${y})`;
            ctx.fillRect(x,y,1,1);
        }
    }
    ctx.restore();
}
*/

/*
let curr_block_X = 2;
let curr_block_Y = 0;
let block_type = L;
let block_Speed = 1000;
let block_Direction = 0;
*/

//stack implementation
//need to check if it can be optmised
var stack = [];

function DrawStack(){
    for (const block of stack){
        ctx.save();
        ctx.fillStyle = block[0];
        ctx.translate(block[1][0]*unit.px,block[1][1]*unit.px);
        for (const [x,y] of block[2]){
            ctx.fillRect(x*unit.px,y*unit.px,unit.px,unit.px);
        }
        ctx.restore();
    }
}
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
    static #lock_time = 500;
    static #max_lock_moves = 15;
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
            //ctx.rotate((Math.PI/2)*this.next_block_Direction);
            console.log("br",this.curr_block_X,this.curr_block_Y,this.curr_block_Direction,this.next_block_Direction,new_shape);

            //SRS check kickback
            for (const [x,y] of TLJSZ_OFFSET[this.curr_block_Direction][this.next_block_Direction]){
                kick_shape = new_shape.map(points => [points[0]+x,points[1]+y]);
                if (this.is_colision(kick_shape,[this.curr_block_X,this.curr_block_Y],timestamp)){
                    console.log("c",x,y,this.curr_block_Direction,this.next_block_Direction,kick_shape);
                }else{
                    this.block_shape = new_shape;
                    this.curr_block_X += x;
                    this.curr_block_Y += y;
                    this.curr_block_Direction = this.next_block_Direction; //update direction
                    this.start_lock_time = undefined;//reset lockdown timer
                    console.log("nc",x,y,this.curr_block_Direction,this.next_block_Direction,kick_shape);
                    break;
                }
                
            }
            this.next_block_Direction = this.curr_block_Direction; //reset direction if no center work
        }
        
    }

    
    draw2(){
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
    /*
    draw_shape(){
        ctx.save();
        //ctx.translate(-shape.center[0]*unit.px,-shape.center[1]*unit.px);
        ctx.translate((this.curr_block_X+this.block_type.centers[this.block_Direction][0])*unit.px+0.5,(this.curr_block_Y+this.block_type.centers[this.block_Direction][1])*unit.px   +0.5);
        ctx.rotate((Math.PI/2)*this.block_Direction);
        ctx.fillStyle = this.block_type.color;
        ctx.fill(this.block_type.shape);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(this.curr_block_X*unit.px+0.5,this.curr_block_Y*unit.px+0.5,20,20);
        ctx.restore();
    }
    */
    drop(){
        this.next_block_Y = this.curr_block_Y+1;
        }

    //drop/movement()
    
    //code looks inefficent need to check if i can sreamline the calculation/check
    is_colision(shape,pos,timestamp){
        for (let block of shape){
            const [x,y] = block;
            if (!((0 <= x+pos[0] && x+pos[0]<=9) && y+pos[1]<=19)){  //currently only check the 4 wall of the game

                if (!this.start_lock_time){
                    this.start_lock_time = timestamp;
                }else{
                    if (timestamp-this.start_lock_time > tetriminos.#lock_time){
                        //console.log("lock",timestamp-this.start_lock_time);
                        stack.push([this.block_type.color,[this.curr_block_X,this.curr_block_Y],this.block_shape]);
                        console.log("pushed",stack)
                        this.block_type = Shape_arr[Math.random() * Shape_arr.length | 0];
                        this.reset();
                        this.start_lock_time = undefined;//reset lockdown timer
                    }
                }
                return true;
            }else{ 
                for (const sblock of stack){
                    for (const [sx,sy] of sblock[2]){
                        //console.log(pos,[x,y],(x+pos[0] === sblock[1][0]+sx),(y+pos[1] === sblock[1][1]+sy));
                        if (x+pos[0] === sblock[1][0]+sx && y+pos[1] === sblock[1][1]+sy){
                            if (!this.start_lock_time){
                                this.start_lock_time = timestamp;
                            }else{
                                if (timestamp-this.start_lock_time > tetriminos.#lock_time){
                                    stack.push([this.block_type.color,[this.curr_block_X,this.curr_block_Y],this.block_shape]);
                                    //console.log("pushed",stack)
                                    this.block_type = Shape_arr[Math.random() * Shape_arr.length | 0];
                                    this.reset();
                                    this.start_lock_time = undefined;//reset lockdown timer
                                }
                            }
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
class game{
    
    player_block = new tetriminos(Shape_arr[5]);
    PLAY = false;

    constructor(){
        console.log("game created");
    }

    reset(){
        this.player_block.reset();
    }

    
    //score calculation
    //block queue(upto 3 blocks)
    //stack (how to save the blocks)
    //clear stack logic
}

Gcode = new game();

let reqid;

function toggleGame() {
    Gcode.PLAY = !Gcode.PLAY;
    if (Gcode.PLAY) {
        console.log("game.start");
        Gcode.reset();
        reqid = window.requestAnimationFrame(main);// Kickstart the loop only when turning ON
    }else{
        window.cancelAnimationFrame(reqid);
    }
}

function HandleKeys(event){
    if (event.key === "ArrowDown"){
    }else if (event.key === "ArrowUp"){
        Gcode.player_block.next_block_Direction = (Gcode.player_block.curr_block_Direction+1)%4;
    }else if (event.key === "r"){
        drop();
    }else if (event.key === "ArrowRight"){
            Gcode.player_block.next_block_X = Gcode.player_block.curr_block_X+1;
    }else if (event.key === "ArrowLeft"){
            Gcode.player_block.next_block_X = Gcode.player_block.curr_block_X-1;
    }else{
    }
}
document.addEventListener("keydown",HandleKeys);
//check();

const drop_tick = 1000;
let start_time;

function main(timestamp){
    start_time = start_time ? start_time: timestamp;
    if (timestamp-start_time > drop_tick){
        Gcode.player_block.drop();
        start_time = timestamp;
    }
    if(Gcode.PLAY){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        DrawGrid();
        DrawStack();
        //Gcode.player_block.draw_shape();
        Gcode.player_block.update(timestamp);
        Gcode.player_block.draw2();
        reqid = window.requestAnimationFrame(main);
    }
}