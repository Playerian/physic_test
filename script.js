/*global $*/
//vars
var c = document.getElementById("canvas");
var screen = c.getContext("2d");
var objects = {};

//canvas functions
function drawLine(){
    //drawLine(color,start x, start y, end x, end y, go through x, go through y)
    screen.lineWidth = 1;
    screen.strokeStyle = "black";
    if (arguments[0]){
        screen.strokeStyle = arguments[0];
    }
    screen.beginPath();
    if (arguments.length >= 5){
        screen.moveTo(arguments[1],arguments[2]);
    }
    for (var i = 5; i < arguments.length - 1; i += 2){
        if (arguments[i+1] !== undefined){
            screen.lineTo(arguments[i],arguments[i+1]);
        }
    }
    screen.lineTo(arguments[3],arguments[4]);
    screen.stroke();
}

function fillColorRect(x1, y1, width, height, color, rotation){
    //fillColor(start x, start y, end x, end y, color in string)
    screen.beginPath();
    screen.lineWidth = 1;
    screen.translate(x1, y1);
    screen.rotate(rotation * Math.PI / 180);
    screen.rect(x1, y1, width, height);
    screen.fillStyle = color;
    screen.fill();
    screen.translate(-x1, -y1);
}

function circle(a,b,c,color, thick){
    //circle(x,y,radius,color)
    screen.beginPath();
    screen.lineWidth = thick || 1;
    screen.arc(a,b,c,0,2*Math.PI);
    screen.strokeStyle = color;
    screen.stroke();
}

function rectangle(x1,y1,width,height,color, thick, rotation){
    screen.strokeStyle = color;
    screen.lineWidth = thick || 1;
    screen.translate(x1, y1);
    screen.rotate(rotation * Math.PI / 180);
    screen.rect(0,0, width, height);
    screen.stroke();
    screen.translate(-x1, -y1);
}

function drawImage(image, x, y, scale, rotation){
    screen.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
    screen.rotate(rotation);
    screen.drawImage(image, -image.width / 2, -image.height / 2);
} 

//rendering function
function render(){
    //clear
    screen.clearRect(0, 0, screen.width, screen.height);
    //loop throughout objects
    var objList = Object.entries(objects);
    objList.forEach(function(value, index){
        var object = value[1];
        console.log(object);
        rectangle(object.x, object.y, object.width, object.height, object.color, object.borderWidth, object.rotation);
        //fillColorRect(object.x + object.borderWidth, object.y + object.borderWidth, object.width - object.borderWidth * 2, object.height - object.borderWidth * 2, object.background, object.rotation);
    });
}

render();

//object functions
function ObjectBase(name, type, rotation, width, height, friction, bouncy, color, background, borderWidth){
    this.name = name;
    this.x = this.x || 0;
    this.y = this.y || 0;
    this.rotation = this. rotation || 0;
    this.width = this.width || width || 100;
    this.height = this.height || height || 100;
    this.friction = this.friction || friction || 0;
    this.bouncy = this.bouncy || bouncy || 0;
    this.color = this.color || color || "black";
    this.background = this.background || background || "white";
    this.borderWidth = this.borderWidth || borderWidth || Math.min(height, width) * 0.1;
    //methods
    this.jumpTo = function(x, y){
        this.x = x;
        this.y = y;
    };
    //objects
    if (type === 'rigid'){
        this.rigid = new RigidBody();
    }
    objectAdd(this);
}

function RigidBody(){
    this.speed = 0;
    this.direction = 0;
}

function objectAdd(object){
    if (!typeof(object) === "object"){
        return;
    }
    for (var i = 100000; i <= 999999; i ++){
        if (!objects[i]){
            object.id = i;
            objects[i] = object;
            return;
        }
    }
}

//activation
function init(){
    var ball = new ObjectBase('ball', 'rigid', 0, 100, 1000);
    //render();
    //rectangle(100,100, 100,100);
    render();
}

init();