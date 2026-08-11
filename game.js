
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* a 0.5 pixel offset to aligne with the display pixel in laptop so no blurry edges*/
/*minos*/
const unit = {
    width: 50,
    height: 50,
    color: "#00ffcc"
};
/*Tetriminos */
const I ={
    shape: new Path2D(),
    color: "#00ffea",
    centers: {
        0:[0,-1],
        1:[2,0],
        2:[1,2],
        3:[-1,1]
    }
};
I.shape.rect(0,0,unit.width,4*unit.height);
const O ={
    shape: new Path2D(),
    color: "#ffee00",
    centers: {
        0:[0,0],
        1:[2,0],
        2:[2,2],
        3:[0,2]
    }
};
O.shape.rect(0,0,2*unit.width,2*unit.height);
const T ={
    shape: new Path2D(),
    color: "#ff00ee",
    centers: {
        0:[-1,0],
        1:[1,-1],
        2:[2,1],
        3:[0,2]
    }
};
T.shape.rect(0,0,3*unit.width,unit.height);
T.shape.rect(unit.width,unit.height,unit.width,unit.height);
const L ={
    shape: new Path2D(),
    color: "#ffb700",
    centers: {
        0:[0,-1],
        1:[2,0],
        2:[1,2],
        3:[-1,1]
    }
};
L.shape.rect(0,0,unit.width,3*unit.height);
L.shape.rect(unit.width,2*unit.height,unit.width,unit.height);
const J ={
    shape: new Path2D(),
    color: "#0099ff",
    centers: {
        0:[-1,-1],
        1:[2,-1],
        2:[2,2],
        3:[-1,2]
    }
};
J.shape.rect(unit.width,0,unit.width,3*unit.height);
J.shape.rect(0,2*unit.height,unit.width,unit.height);
const S ={
    shape: new Path2D(),
    color: "#00ff37",
    centers: {
        0:[-1,0],
        1:[1,-1],
        2:[2,1],
        3:[0,2]
    }
};
S.shape.rect(0,unit.height,2*unit.width,unit.height);
S.shape.rect(unit.width,0,2*unit.width,unit.height);
const Z ={
    shape: new Path2D(),
    color: "#ff1100",
    centers: {
        0:[-1,0],
        1:[1,-1],
        2:[2,1],
        3:[0,2]
    }
};
Z.shape.rect(0,0,2*unit.width,unit.height);
Z.shape.rect(unit.width,unit.height,2*unit.width,unit.height);

canvas.width = unit.width*6;
canvas.height = unit.height*12; 

function DrawGrid(){
    
    ctx.save();

    for(var x=0; x<=canvas.width; x+= unit.width){
        ctx.moveTo(0.5 + x + unit.width, 0);
        ctx.lineTo(0.5 + x + unit.width, canvas.height);
    }

    for(var y=0; y<=canvas.height; y+= unit.height){
        ctx.moveTo(0 ,0.5 + y + unit.height);
        ctx.lineTo(canvas.width,0.5 + y + unit.height);
    }
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.restore();
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let block_X = 2;
let block_Y = 0;
let block_type = Z;
let block_Speed = 1000;
let block_Direction = 0;

function draw_shape(x,y,shape){
    ctx.save();
    /*ctx.translate(-shape.center[0]*unit.width,-shape.center[1]*unit.height);*/
    ctx.translate((x+shape.centers[block_Direction][0])*unit.width+0.5,(y+shape.centers[block_Direction][1])*unit.height+0.5);
    ctx.rotate((Math.PI/2)*block_Direction);
    ctx.fillStyle = shape.color;
    ctx.fill(shape.shape);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "#ff0000";
    ctx.strokeRect(x*unit.width+0.5,y*unit.width+0.5,20,20);
    ctx.restore();
}


async function drop(){
    
    while(block_Y<8){
        await delay(block_Speed);
        block_Y += 1;
    }
}

let PLAY = false;

function toggleGame() {
    PLAY = !PLAY;
    if (PLAY) {
        Game(); // Kickstart the loop only when turning ON
    }
}

async function Game(){
    console.log("game.start");
    drop();
    while (PLAY){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        DrawGrid();
        draw_shape(block_X,block_Y,block_type);
        await delay(100);
    }
};

function HandleKeys(event){
    if (event.key === "ArrowDown"){
        block_Speed = 500;
    }else if (event.key === "ArrowUp"){
        block_Direction = (block_Direction+1)%4;
    }else if (event.key === "r"){
        block_Speed = 1000;
        drop();
    }else if (event.key === "ArrowRight"){
        if (block_X <5){
            block_X +=1;
        }
    }else if (event.key === "ArrowLeft"){
        if (block_X > 1){
            block_X -=1;
        }
    }else if (event.key === ""){
        if (block_X > 2){
            block_X -=1;
        }
    }else{
        block_Speed = 1000;
    }
}
document.addEventListener("keydown",HandleKeys)

/*
ctx.save();
ctx.translate(2*unit.width,0);
ctx.fillStyle = O.color;
ctx.fill(O.shape);
ctx.restore();

ctx.save();
ctx.translate(4*unit.width,0);
ctx.fillStyle = T.color;
ctx.fill(T.shape);
ctx.restore();

ctx.save();
ctx.translate(0,3*unit.height);
ctx.fillStyle = L.color;
ctx.fill(L.shape);
ctx.restore();

ctx.save();
ctx.translate(2*unit.width,3*unit.height);
ctx.fillStyle = J.color;
ctx.fill(J.shape);
ctx.restore();

ctx.save();
ctx.translate(4*unit.width,3*unit.height);
ctx.fillStyle = S.color;
ctx.fill(S.shape);
ctx.restore();

ctx.save();
ctx.translate(0,6*unit.height);
ctx.fillStyle = Z.color;
ctx.fill(Z.shape);
ctx.restore();

ctx.save();
ctx.translate(3*unit.width,6*unit.height);
ctx.fillStyle = I.color;
ctx.fill(I.shape);
ctx.restore();
*/