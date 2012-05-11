var canvas;
var ctx; //canvas 2d context
var WIDTH;
var HEIGHT;
var canvasMinX;
var canvasMaxX;
var canvasMinY;
var canvasMaxY;
var mouseX;
var mouseY;
var npcs;
var nextId;
var recordKbs;
var recordHolder;
function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    canvasMinX = canvas.offsetLeft;
    canvasMaxX = canvasMinX + WIDTH;
    canvasMinY = canvas.offsetTop;
    canvasMaxY = canvasMinY + HEIGHT;
    mouseX = 1;
    mouseY = 1;
    npcs = {};
	nextId = 1;
	recordKbs = 0;
	recordHolder = '';
    document.addEventListener('mousemove', onMouseMove);
    return setInterval(draw, 10);
}
function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
function onMouseMove(evt) {
    if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
        mouseX = evt.pageX - canvasMinX;
    }
    if (evt.pageY > canvasMinY && evt.pageY < canvasMaxY) {
        mouseY = evt.pageY - canvasMinY;
    }
}

function drawMouseCoords(){
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText( 'X: '+mouseX, 5, 10 );
    ctx.fillText( 'Y: '+mouseY, 5, 24 );
}
function drawRecordMessage(){
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText( 'Records KBs: '+recordKbs+', by '+recordHolder, 5, HEIGHT-10 );
}
function generateNewNpc(){
	npcs[nextId] = new npc(nextId, (Math.random()*(WIDTH-80))+40, (Math.random()*(HEIGHT-80))+40);
	nextId++;
}
function draw(){
    clear();
    drawMouseCoords();
	if(recordKbs>0){drawRecordMessage()};
	count=0;
    for(i in npcs){
        npcs[i].draw();
		count++;
    }
	if(count<4){generateNewNpc();}
//    npcs.forEach( function(npc){
//        npc.draw();
//    });
}