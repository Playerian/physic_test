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

function fillColorRect(a,b,c,d,e){
    //fillColor(start x, start y, end x, end y, color in string)
    screen.beginPath();
    screen.rect(a, b, c, d);
    screen.fillStyle = e;
    screen.fill();
}

function circle(a,b,c,color){
    //circle(x,y,radius,color)
    screen.beginPath();
    screen.arc(a,b,c,0,2*Math.PI);
    screen.strokeStyle = color;
    screen.stroke();
}

function rectangle(x1,y1,width,height,color,rotation){
    screen.strokeStyle = color;
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
}

render();

//object functions
function ObjectBase(name, type, direction, length, width, friction, bouncy){
    this.name = name;
    this.x = this.x || 0;
    this.y = this.y || 0;
    this.direction = this. direction || 0;
    this.length = this.length || length || 0;
    this.width = this.width || width || 0;
    this.friction = this.friction || friction || 0;
    this.bouncy = this.bouncy || bouncy || 0;
    this.jumpTo = function(x, y){
        this.x = x;
        this.y = y;
    };
    if (type === 'rigid'){
        this.rigid = new RigidBody();
    }
    objectAdd(this);
}

function RigidBody(){
    this.speed = 0;
    this.velocity = 0;
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