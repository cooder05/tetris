
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//a 0.5 pixel offset to aligne with the display pixel in laptop so no blurry edges
//minos
const unit = {
    px : 40,
    width: 40,
    height: 40,
    color: "#00ffcc"
};
//Tetriminos
const I ={
    shape: new Path2D(),
    shape2: {
        A: [0,-1],
        B: [0,1],
        C: [0,2],
    },
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
    shape2: {
        A: [0,1],
        B: [1,0],
        C: [1,1],
    },
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
    shape2: {
        A: [-1,0],
        B: [1,0],
        C: [0,1],
    },
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
    shape2: {
        A: [-0.5,-1.5],
        B: [-0.5,0.5],
        C: [0.5,0.5],
    },
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
    shape2: {
        'A': [-1,0],
        'B': [1,0],
        'C': [-1,1],
    },
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
    shape2: {
        A: [1,0],
        B: [0,1],
        C: [-1,1],
    },
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
    shape2: {
        A: [-1,0],
        B: [0,1],
        C: [1,1],
    },
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

canvas.width = unit.px*6;
canvas.height = unit.px*12;

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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
/*
let block_X = 2;
let block_Y = 0;
let block_type = L;
let block_Speed = 1000;
let block_Direction = 0;
*/
class tetriminos{
    //TODO
    //change the way the blocks Path2D obj representation to simplify adding to the stack,
    block_type;
    context;
    position = [];
    block_Y = 1;
    block_X = 3;
    block_Direction = 0;
    block_Speed = 1000;
    
    constructor(type){
        console.log("block created");
        this.block_type = type
    }

    reset(){
        this.context;
        this.position = [];
        this.block_Y = 1;
        this.block_X = 2;
        this.block_Direction = 0;
        this.block_Speed = 1000;
    }

    /*
    draw2(){

        ctx.save();
        ctx.translate((this.block_X+0.5)*unit.px,(this.block_Y+0.5)*unit.px);
        ctx.rotate((Math.PI/2)*this.block_Direction);
        ctx.fillStyle = this.block_type.color;
        ctx.strokeStyle = this.block_type.color;
        ctx.fillRect(-0.5*unit.px, -0.5*unit.px, unit.px+1, unit.px+1);
        ctx.fillRect(this.block_type.shape2.A[0]*unit.px ,this.block_type.shape2.A[1]*unit.px, unit.px+1, unit.px+1);
        ctx.fillRect(this.block_type.shape2.B[0]*unit.px ,this.block_type.shape2.B[1]*unit.px, unit.px+1, unit.px+1);
        ctx.fillRect(this.block_type.shape2.C[0]*unit.px ,this.block_type.shape2.C[1]*unit.px, unit.px+1, unit.px+1);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(this.block_X*unit.px+0.5,this.block_Y*unit.px+0.5,20,20);
        ctx.restore();

    }
    */
    draw_shape(){
        ctx.save();
        //ctx.translate(-shape.center[0]*unit.px,-shape.center[1]*unit.px);
        ctx.translate((this.block_X+this.block_type.centers[this.block_Direction][0])*unit.px+0.5,(this.block_Y+this.block_type.centers[this.block_Direction][1])*unit.px   +0.5);
        ctx.rotate((Math.PI/2)*this.block_Direction);
        ctx.fillStyle = this.block_type.color;
        ctx.fill(this.block_type.shape);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(this.block_X*unit.px+0.5,this.block_Y*unit.px+0.5,20,20);
        ctx.restore();
    }

    async drop(){

        while(this.block_Y<8){
            await delay(this.block_Speed);
            this.block_Y += 1;
        }
    }

    //drop/movement()
    //colision()
}
class game{
    
    player_block = new tetriminos(L);
    PLAY = false;

    constructor(){
        console.log("game created");
        console.log(this.player_block);
    }

    reset(){
        this.player_block.reset();
    }

    async main(){
        console.log("game start in class");
        this.player_block.drop();
        while (this.PLAY){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            DrawGrid();
            this.player_block.draw_shape();
            //this.player_block.draw2();
            await delay(100);
        }
    }
    //score calculation
    //block queue(upto 3 blocks)
    //stack (how to save the blocks)
    //clear stack logic
}

Gcode = new game();

function toggleGame() {
    Gcode.PLAY = !Gcode.PLAY;
    console.log(Gcode.PLAY);
    if (Gcode.PLAY) {
        console.log("game.start");
        Gcode.reset();
        Gcode.main(); // Kickstart the loop only when turning ON
    }
}

function HandleKeys(event){
    if (event.key === "ArrowDown"){
        Gcode.player_block.block_Speed = 500;
    }else if (event.key === "ArrowUp"){
        Gcode.player_block.block_Direction = (Gcode.player_block.block_Direction+1)%4;
    }else if (event.key === "r"){
        Gcode.player_block.block_Speed = 1000;
        drop();
    }else if (event.key === "ArrowRight"){
        if (Gcode.player_block.block_X <5){
            Gcode.player_block.block_X +=1;
        }
    }else if (event.key === "ArrowLeft"){
        if (Gcode.player_block.block_X > 1){
            Gcode.player_block.block_X -=1;
        }
    }else if (event.key === ""){
        if (Gcode.player_block.block_X > 2){
            Gcode.player_block.block_X -=1;
        }
    }else{
        Gcode.player_block.block_Speed = 1000;
    }
}
document.addEventListener("keydown",HandleKeys)
//check();