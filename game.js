
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


/*minos*/
const unit = {
    width: 50,
    height: 50,
    color: "#00ffcc"
};
/*Tetriminos */
const I ={
    shape: new Path2D(),
    color: "#00ffea"
};
I.shape.rect(0,0,unit.width,4*unit.height);
const O ={
    shape: new Path2D(),
    color: "#ffee00"
};
O.shape.rect(0,0,2*unit.width,2*unit.height);
const T ={
    shape: new Path2D(),
    color: "#ff00ee"
};
T.shape.rect(0,0,3*unit.width,unit.height);
T.shape.rect(unit.width,unit.height,unit.width,unit.height);
const L ={
    shape: new Path2D(),
    color: "#ffb700"
};
L.shape.rect(0,0,unit.width,3*unit.height);
L.shape.rect(unit.width,2*unit.height,unit.width,unit.height);
const J ={
    shape: new Path2D(),
    color: "#0099ff"
};
J.shape.rect(unit.width,0,unit.width,3*unit.height);
J.shape.rect(0,2*unit.height,unit.width,unit.height);
const S ={
    shape: new Path2D(),
    color: "#00ff37"
};
S.shape.rect(0,unit.height,2*unit.width,unit.height);
S.shape.rect(unit.width,0,2*unit.width,unit.height);
const Z ={
    shape: new Path2D(),
    color: "#ff1100"
};
Z.shape.rect(0,0,2*unit.width,unit.height);
Z.shape.rect(unit.width,unit.height,2*unit.width,unit.height);

canvas.width = unit.width*7;
canvas.height = unit.height*12; 

function DrawGrid(){
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
}

DrawGrid();

canvas.addEventListener("click",async (e) => {
        if (!document.fullscreenElement) {
        try {
            // Request full screen specifically for the canvas
            await canvas.requestFullscreen();
            } catch (err) {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
                }
        } else {
            // Exit full screen if it is already active
            document.exitFullscreen();
        }
});

function player(){

};

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