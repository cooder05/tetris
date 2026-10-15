
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
    shape2: [[-2,0],[-1,0],[0,0],[1,0]],
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


const blocks = [I,O,T,L,J,S,Z];
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
lingrad.addColorStop(0, "white");
lingrad.addColorStop(0.7, "transparent");

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

/**
 * Creates a deterministic 32-bit pseudo-random number generator.
 * @param {number} seed - An integer seed to initialize the generator.
 * @returns {function} A function that outputs a float between [0, 1) when called.
 */
function mulberry32(seed) {
    return function() {
        // 1. Advance the state using a large constant and force 32-bit integer addition
        let t = seed += 0x6D2B79F5;
        
        // 2. First bit-scrambling layer using 32-bit integer multiplication
        t = Math.imul(t ^ (t >>> 15), t | 1);
        
        // 3. Second mixing layer to spread entropy across the bit space
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        
        // 4. Final XOR shift, force back to a positive unsigned int, and scale to [0, 1)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}


class game{

    //block stack implementation
    //need to check if it can be optmised
    static stack = Array.from({ length: 20 }, () => Array(10).fill('*'));
    bag;
    bag_index;
    next_que;
    player_block = new tetriminos(blocks[5]);
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
    update_stack(){
        for (let i = 0; i < game.stack.length; i++) {
            var isfull = true;
            for (let j = 0; j < game.stack[i].length; j++) {
                if (game.stack[i][j] == '*') {
                    isfull = false;
                    break;
                }
            }
            if (isfull) {
                // Clear the row
                console.log("row cleared",i);
                for (let ri = i; ri >0; ri--) {
                    game.stack[ri] = game.stack[ri-1];
                }
                game.stack[0] = Array(10).fill('*'); // Fill the top row with empty cells
            }
        }
    }

    draw_stack(){
        for(var i=0;i<20;i++){
            for(var j=0;j<10;j++){
                if (game.stack[i][j] != '*'){
                    ctx.save();
                    ctx.fillStyle = game.stack[i][j];
                    ctx.fillRect(j*unit.px,i*unit.px,unit.px,unit.px);
                    ctx.restore();
                }
                
            }    
        }
    }
    //clear stack logic
    bag_generator(){
        
    }    
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

const drop_tick = 500;
let start_time;
randomgenerator = mulberry32(123456789);

function main(timestamp){
    start_time = start_time ? start_time: timestamp;
    if (timestamp-start_time > drop_tick){
        Gcode.player_block.drop();
        start_time = timestamp;
    }
    if(timestamp-Gcode.player_block.start_lock_time >= tetriminos.lock_time || Gcode.player_block.lock_moves >= tetriminos.max_lock_moves){
        for (block of Gcode.player_block.block_shape){
            Gcode.player_block.lock_moves = 0;
            game.stack[Gcode.player_block.curr_block_Y+block[1]][Gcode.player_block.curr_block_X+block[0]] = Gcode.player_block.block_type.color;
        }
        console.log("block locked");
        //check for row clears
        Gcode.update_stack();
        //Gcode.player_block.block_type = S;
        Gcode.player_block.block_type = blocks[randomgenerator() * blocks.length | 0];
        Gcode.player_block.reset();
        Gcode.player_block.start_lock_time = undefined;//reset lockdown timer
    }
    if(Gcode.PLAY){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        DrawGrid();
        Gcode.draw_stack();
        Gcode.player_block.update(timestamp);
        Gcode.player_block.draw_shape();
        reqid = window.requestAnimationFrame(main);
    }
}