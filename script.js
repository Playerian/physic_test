/*global $*/
//vars
var c = document.getElementById("canvas");
var screen = c.getContext("2d");
var folder = new Collector();

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
    screen.save();
    screen.beginPath();
    screen.lineWidth = 1;
    screen.translate(x1 + width / 2, y1 + height / 2);
    screen.rotate(rotation * Math.PI / 180);
    screen.rect(-width / 2, -height / 2, width, height);
    screen.fillStyle = color;
    screen.fill();
    screen.translate(-x1, -y1);
    screen.restore();
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
    screen.save();
    screen.strokeStyle = color;
    screen.lineWidth = thick || 1;
    screen.translate(x1 + width / 2, y1 + height / 2);
    screen.rotate(rotation * Math.PI / 180);
    screen.rect(-width / 2, -height / 2, width, height);
    screen.stroke();
    screen.restore();
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
    //loop throughout folder
    var objList = Object.entries(folder);
    objList.forEach(function(value, index){
        var object = value[1];
        if (typeof(object) === "function"){
            return;
        }
        //rectangle
        rectangle(object.x,
        object.y,
        object.width,
        object.height,
        object.color,
        object.borderWidth,
        object.rotation);
        //filling
        fillColorRect(object.x + object.borderWidth / 2,
        object.y + object.borderWidth / 2,
        object.width - object.borderWidth,
        object.height - object.borderWidth,
        object.background,
        object.rotation);
    });
}

render();

//object functions
//collector function
function Collector(){
    //Methods
    this.delete = function(key){
        let property = this[key];
        if (this[key]){
            delete this[key];
        }
        return property;
    };
    this.addObject = function(object){
        for (let i = 100000; i <= 999999; i ++){
            if (!this[i]){
                object.id = i;
                this[i] = object;
                return i;
            }
        }
    };
}
//object function
function ObjectBase(name, type, rotation, width, height, friction, bouncy, color, background, borderWidth, shape){
    this.name = name;
    this.type = type || 'static';
    this.x = this.x || 0;
    this.y = this.y || 0;
    this.rotation = this. rotation || 0;
    this.width = this.width || width || 100;
    this.height = this.height || height || 100;
    this.friction = this.friction || friction || 0;
    this.bouncy = this.bouncy || bouncy || 0;
    this.color = this.color || color || "black";
    this.background = this.background || background || "white";
    this.borderWidth = this.borderWidth || borderWidth || 1;
    this.shape = this.shape || shape || 'rect';
    //methods
    this.jumpTo = function(x, y){
        this.x = x;
        this.y = y;
    };
    //folder
    if (type === 'rigid'){
        this.rigid = new RigidBody();
    }
    objectAdd(this);
}

function RigidBody(){
    this.forces = [];
    this.addForce = function(speed, direction){
        this.forces.push(new Force(speed, direction));
    };
    this.deleteForce = function(key){
        delete this.forces[key];
    };
    
}

function Force(speed, direction){
    this.speed = speed || 0;
    this.direction = direction || 0;
}

function objectAdd(object){
    if (!typeof(object) === "object"){
        return;
    }
    folder.addObject(object);
}

//initialization
function init(){
    var ball1 = new ObjectBase('ball', 'rigid', 0, 100, 100);
    ball1.jumpTo(100,100);
    ball1.borderWidth = 1;
    var ball2 = new ObjectBase('ball2', 'rigid', 0, 50, 50);
    ball2.jumpTo(50,50);
    var 
    render();
    console.log(folder);
}

init();