/*global $*/
//vars
const c = document.getElementById("canvas");
const screen = c.getContext("2d");
const runtime = 50;
const canvasSize = 1000;
var folder = new Collector();
var tree = new QuadTree(0, 0, canvasSize);
c.width = canvasSize;
c.height = canvasSize;

//handy functions
function arrayRemove(array, index){
    array.splice(index, 1);
}

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
    screen.clearRect(0, 0, c.width, c.height);
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

//object functions
//quadtree function
function QuadTree(x, y, size, level){
    //x y is from top-left point of the square
    //size is both length and height since all 
    //trees are square
    //vars
    this.x = x;
    this.y = y;
    this.size = size;
    this.level = level + 1 || 0;
    this.max = 5;
    this.objects = [];
    //methods
    this.addRegion = function(){
        //counterclockwise, top-right is i
        this.nodes = [new QuadTree(this.x + this.size / 2, this.y, this.size / 2, this.level),
        new QuadTree(this.x, this.y, this.size / 2, this.level),
        new QuadTree(this.x, this.y + this.size / 2, this.size / 2, this.level),
        new QuadTree(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, this.level)
        ];
        return this.nodes;
    };
    this.deleteRegion = function(){
        //actually delete all sub-region of father
        delete this.nodes;
    };
    this.getRegion = function(object){
        //check if object is object
        if (typeof(object) !== "object"){
            return "nil";
        }
        //get one of the region i ii iii iv from x,y 
        //return accordingly, 0 1 2 3
        //halfpoint of quadtree, both x and y
        let halfPoint = size / 2;
        //check if object x is more than halfpoint
        if (object.x > halfPoint){
            //check if y is larger than halfpoint
            if (object.y > halfPoint){
                //if so, belong to iv
                return 3;
            }else{//if y is not larger than halfpoint
                //if y plus height is larget than halfpoint
                if (object.y + object.height > halfPoint){
                    //belongs to both i and iv
                    return "both";
                }else{//else, belongs to i
                    return 0;
                }
            }
        }else{//x is less than halfpoint
            //check if length cross the halfpoint
            if (object.x + object.length > halfPoint){
                //if so, it belongs to both
                return "both";
            }else{//if doesn't cross halfpoint
                //check if y larger than halfpoint
                if (object.y > halfPoint){
                    //if so, belongs to iii
                    return 2;
                }else{//y is not larget than halfpoint
                    //check if y and height is larger than half point
                    if (object.y + object.height > halfPoint){
                        //belongs to both ii and iii
                        return "both";
                    }else {//not crossing halfpoint at all
                        //belongs to ii
                        return 1;
                    }
                }
            }
        }
    };
    //separate into 4 regions if primal
    if (this.level === 0){
        this.addRegion();
        //update objects in region
        this.addAllObject = function(collector){
            //clear objects first
            this.clearObject();
            //collect all the objects
            if (!collector.getAll){
                return "nil";
            }
            let objList = collector.getAll();
            //loop throught all the objects
            for(let i = 0; i < objList.length; i ++){
                let obj = objList[i];
                let region = this;
                let end = false;
                //looping through stems to find a region to fit in
                while(end === false){
                    //get location
                    let location = region.getRegion(obj);
                    //check if obj can be sort into a location
                    console.log(obj);
                    console.log(location);
                    if (typeof(location) === "number"){
                        //if so, then find the next location/region
                        //if smaller region exist
                        if (region.nodes){
                            region = region.nodes[location];
                        }else{//smaller region doesn't exist
                            //end the while loop
                            end = true;
                        }
                    }else{//if not, then push it into the array
                        //end the while loop
                        end = true;
                    }
                    //if match found
                    if (end === true){
                        //push into this region
                        region.objects.push(obj);
                        //check if region is overflowing max # of objects
                        if (region.objects.length > region.max){
                            //split region
                            let nodes = region.addRegion();
                            //store and clear region objects
                            let objArr = region.objects;
                            region.objects = [];
                            //loop through the objs
                            for (let ii = 0; ii < objArr.length; ii ++){
                                let obj = objArr[ii];
                                let loc = region.getRegion(obj);
                                if (loc === "both"){//if both region
                                    //push to this region
                                    region.objects.push(obj);
                                }else{
                                    //push to corresponding subregion
                                    region.nodes[loc].objects.push(obj);
                                }
                            }
                        }
                    }
                }
            }
        };
        this.clearObject = function(){
            //clean up everything in this object
            this.deleteRegion();
            this.addRegion();
            this.objects = [];
        };
    }
}

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
    this.getAll = function(){
        let holder = Object.entries(this);
        let origin = holder;
        for (var i = 0; i < holder.length; i ++){
            holder[i] = holder[i][0];
        }
        holder = holder.filter(function(value){
            return parseInt(value) || false;
        });
        for (var i = 0; i < holder.length; i ++){
            holder[i] = this[holder[i]];
        }
        return holder;
    };
    this.getRigid = function(){
        var objs = this.getAll();
        return objs.filter(function(value){
            return value.rigid || false;
        });
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
        this.x = x || this.x;
        this.y = y || this.y;
        //where collision kicks in
    };
    //folder
    if (type === 'rigid'){
        this.rigid = new RigidBody();
    }
    objectAdd(this);
}

function RigidBody(){
    this.forces = [];
    this.addForce = function(key, speed, direction, type){
        this.forces.push(new Force(key, speed, direction, type));
    };
    this.deleteForce = function(key){
        for (let i = 0; i < this.forces.length; i ++){
            if (this.forces[i].key === key){
                arrayRemove(this.forces, i);
                break;
            }
        }
    };
    
}

function Force(key, speed, direction, type){
    //direction
    //0 is right 90 is down 180 is left 270 is top
    //speed
    //equal to object move at "x pixels per second"
    this.key = key || "nil";
    this.speed = speed || 0;
    this.direction = direction || 0;
    this.type = type || 'normal';
}

function objectAdd(object){
    if (!typeof(object) === "object"){
        return;
    }
    folder.addObject(object);
}
//force function
var forceCalculate = function(direction, speed){
    //given force, calculate xmove and ymove
    var xMove = 0;
    var yMove = 0;
    let turn = Math.floor(direction / 90) % 4;
    //turn 0 = right
    //turn 1 = down
    //turn 2 = left
    //turn 3 = up
    if (turn % 2 === 1){//up n down
        if (turn === 1){
            yMove += speed;
        }else{
            yMove -= speed;
        }
    }else{//left n right
        if (turn === 0){
            xMove += speed;
        }else{
            xMove -= speed;
        }
    }
    return [xMove, yMove];
};

//timed function
setInterval(function(){
    //check forces
    let objList = folder.getRigid();
    for (let i = 0; i < objList.length; i ++){
        //for object get rigid force
        var obj = objList[i];
        var forces = obj.rigid.forces;
        //if force empty then break
        if (forces.length === 0){
            break;
        }
        //record how many pixel should move in total
        let xMove = 0;
        let yMove = 0;
        //loop through all forces
        for (let i2 = 0; i2 < forces.length; i2 ++){
            let force = forces[i2];
            //change force into two subforce if not in a direction
            if (force.direction % 90 !== 0){
                //store at first hand
                let direction = force.direction % 360;
                let speed = force.speed;
                //split force into two
                //check for direction for the splitting force
                let dir = 0;
                while(dir < direction){
                    dir += 90;
                }
                let dir2 = dir - 90;
                //percent 1 = force direction in range of 90 / 90
                //if direction is 155, dir = 180 dir2 = 90
                //which means that dir - dir2 always = 90
                //percent 1 = 155 - 90 / 90
                //get speed closer to dir
                let s1 = (direction - dir2) / 90 * speed;
                //get speed closer to dir2
                let s2 = (dir - direction) / 90 * speed;
                //check corresponding side
                if (dir - direction < 45){//if closer to dir
                    //s1 = dir
                    let result = forceCalculate(dir, s1);
                    xMove += result[0]; 
                    yMove += result[1];
                    result = forceCalculate(dir2, s2);
                    xMove += result[0]; 
                    yMove += result[1];
                }else if(dir - direction > 45){//if closer to dir2
                    let result = forceCalculate(dir, s2);
                    xMove += result[0]; 
                    yMove += result[1];
                    result = forceCalculate(dir2, s1);
                    xMove += result[0]; 
                    yMove += result[1];
                }else{//if multiply of 45
                    //just calculate it and multiply by 2
                    xMove += speed * 0.5;
                    yMove += speed * 0.5;
                }
            }else{//if 0,90,180,270,360 degree
                let holder = forceCalculate(force.direction, force.speed);
                xMove += holder[0];
                yMove += holder[1];
            }
        }
        //push result into object
        obj.jumpTo(obj.x + xMove * runtime / 1000);
        obj.jumpTo(null, obj.y + yMove * runtime / 1000);
    }
    //finish check force, rendering
    render();
}, runtime);

//initialization
function init(){
    var ball1 = new ObjectBase('ball', 'rigid', 0, 100, 100);
    ball1.jumpTo(100,100);
    var platform = new ObjectBase('platform', 'static', 0, 500, 200);
    platform.jumpTo(10, 500);
    render();
    console.log(folder);
    console.log(tree);
}

init();