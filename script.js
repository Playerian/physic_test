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

//utility functions
function arrayRemove(array, index){
    array.splice(index, 1);
}

function rotate(CX, CY, X, Y, angle) {
    var rad = angle * Math.PI / 180.0;
    var nx = Math.cos(rad) * (X-CX) - Math.sin(rad) * (Y-CY) + CX;
    var ny = Math.sin(rad) * (X-CX) + Math.cos(rad) * (Y-CY) + CY;
    return [parseFloat(nx.toFixed(4)),parseFloat(ny.toFixed(4))];
}

//trig functinos
function sinDeg(angleDegrees) {
    return Math.sin(angleDegrees*Math.PI/180);
}

function cosDeg(angleDegrees) {
    return Math.cos(angleDegrees*Math.PI/180);
}

function tanDeg(angleDegrees) {
    return Math.tan(angleDegrees*Math.PI/180);
}

//collision function
//edge return
function shapeEdge(shape, edge){
    if (!shape.type){
        let p1 = shape;
        return [[p1[0], p1[1], p1[2], p1[3]], [p1[0], p1[1], p1[4], p1[5]], [p1[6], p1[7], p1[2], p1[3]], [p1[6], p1[7], p1[4], p1[5]]];
    }
    let d1 = shape.rotation;
    let rotate1 = rotate(shape.x, shape.y, shape.x + shape.width, shape.y + shape.height, d1);
    let rotate2 =  rotate(shape.x, shape.y, shape.x + shape.width, shape.y, d1);
    let rotate3 = rotate(shape.x, shape.y, shape.x, shape.y + shape.height, d1);
    let p1 = [shape.x, shape.y, 
                rotate2[0], rotate2[1],
                rotate3[0], rotate3[1],
                rotate1[0], rotate1[1]
             ];
    if (edge){
        return [[p1[0], p1[1], p1[2], p1[3]], [p1[0], p1[1], p1[4], p1[5]], [p1[6], p1[7], p1[2], p1[3]], [p1[6], p1[7], p1[4], p1[5]]];
    }else{
        return p1;
    }
}

//rectangle collision
function collisionRect(shape1, shape2){
    let p1;
    let p2;
    if (shape1.edges){
        p1 = shape1.edges;
    }else{
        p1 = shapeEdge(shape1);
    }
    if (shape2.edges){
        p2 = shape2.edges;
    }else{
        p2 = shapeEdge(shape2);
    }
    //16 side check
    //should connect topleft-topright topleft-bottomleft topright-bottomright bottomleft-bottomright
    //p1[0], p1[1]-p1[2], p1[3] && p1[0], p1[1]-p1[4], p1[5] && p1[6], p1[7]- p1[2], p1[3] && p1[6], p1[7]- p1[4], p1[5]
    let p1sides = [[p1[0], p1[1], p1[2], p1[3]], [p1[0], p1[1], p1[4], p1[5]], [p1[6], p1[7], p1[2], p1[3]], [p1[6], p1[7], p1[4], p1[5]]];
    let p2sides = [[p2[0], p2[1], p2[2], p2[3]], [p2[0], p2[1], p2[4], p2[5]], [p2[6], p2[7], p2[2], p2[3]], [p2[6], p2[7], p2[4], p2[5]]];
    //for every side of shape1
    for (let i = 0; i < p1sides.length; i ++){
        let points = p1sides[i];
        //check if line touch the line of other shape
        for (let i2 = 0; i2 < p2sides.length; i2 ++){
            let points2 = p2sides[i2];
            if (collisionLine(points[0], points[1], points[2], points[3], points2[0], points2[1], points2[2], points2[3])){
                return [[points[0], points[1], points[2], points[3]], [points2[0], points2[1], points2[2], points2[3]]];
            }
        }
    }
    //passing 16 side check?
    //make top-left, bot-right check 
    //in case of containment
    //check which one is more left
    let p1Minx = Math.min(p1[0], p1[2], p1[4], p1[6]);
    let p1Maxx = Math.max(p1[0], p1[2], p1[4], p1[6]);
    let p1Miny = Math.min(p1[1], p1[3], p1[5], p1[7]);
    //let p1Maxy = Math.max(p1[1], p1[3], p1[5], p1[7]);
    let p2Minx = Math.min(p2[0], p2[2], p2[4], p2[6]);
    let p2Maxx = Math.max(p2[0], p2[2], p2[4], p2[6]);
    let p2Miny = Math.min(p2[1], p2[3], p2[5], p2[7]);
    //let p2Maxy = Math.max(p2[1], p2[3], p2[5], p2[7]);
    if (p1Minx > p2Minx){
        //if p1 is to the right of p2
        //check if p1 is inside p2
        if (p1Maxx < p2Maxx){
            //if y-axis contains
            if (p1Miny > p2Miny && p1.Maxy < p2.Maxy){
                return 'contain';
            }
        }
    }else{
        //if p1 is to the left of p2
        //check if p2 is inside p1
        if (p1Maxx > p2Maxx){
            //if y-axis contains
            if (p1Miny < p2Miny && p1.Maxy > p2.Maxy){
                return 'contain';
            }
        }
    }
    return false;
}

//line collision
function collisionLine(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    //same slope
    //check y-int y-mx = b
    if (b - det * a === q - det * p){
        //same y-int
        if (Math.max(a,c) > Math.min(p,r)){
            return true;
        }
    }
    //if on vertical
    if (a === c && c === p && p === r){
        if ((Math.max(b,d) > Math.min(q,s)) || (Math.max(q,s) < Math.min(b,d))){
            return true;
        }
    }
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}

//rectline
function collisionRectLine(rect, a, b, c, d){
    let edges;
    if (!rect.edges){
        rect.edges = shapeEdge(rect.edges);
    }
    edges = shapeEdge(rect.edges);
    //for every side of shape1
    for (let i = 0; i < edges.length; i ++){
        let points = edges[i];
        if (collisionLine(points[0], points[1], points[2], points[3], a, b, c, d)){
            return [[points[0], points[1], points[2], points[3]], [a, b, c, d]];
        }
    }
    return false;
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
    screen.translate(x1, y1);
    screen.rotate(rotation * Math.PI / 180);
    screen.rect(0, 0, width, height);
    screen.fillStyle = color;
    screen.fill();
    screen.translate(-x1, -y1);
    screen.restore();
}

function rectangle(x1,y1,width,height,color, thick, rotation){
    screen.save();
    screen.strokeStyle = color;
    screen.lineWidth = thick || 1;
    screen.translate(x1, y1);
    screen.rotate(rotation * Math.PI / 180);
    screen.rect(0, 0, width, height);
    screen.stroke();
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
function QuadTree(x, y, size, level, father){
    //x y is from top-left point of the square
    //size is both length and height since all 
    //trees are square
    //vars
    this.x = x;
    this.y = y;
    this.size = size;
    this.level = level + 1 || 0;
    this.max = 3;
    this.objects = [];
    this.father = father;
    //methods
    this.splitRegion = function(){
        //counterclockwise, top-right is i
        this.nodes = [new QuadTree(this.x + this.size / 2, this.y, this.size / 2, this.level, this),
        new QuadTree(this.x, this.y, this.size / 2, this.level, this),
        new QuadTree(this.x, this.y + this.size / 2, this.size / 2, this.level, this),
        new QuadTree(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, this.level, this)
        ];
        return this.nodes;
    };
    this.deleteRegion = function(){
        //actually delete all sub-region of father
        delete this.nodes;
    };
    this.sortRegion = function(object){
        //check if object is object
        if (typeof(object) !== "object"){
            return "nil";
        }
        //get one of the region i ii iii iv from x,y 
        //return accordingly, 0 1 2 3
        //halfpoint of quadtree, both x and y
        let halfPoint = x + size / 2;
        //check collision
        let colliXAxis = collisionRectLine(object, 0, halfPoint, canvasSize, halfPoint);
        let colliYAxis = collisionRectLine(object, halfPoint, 0, halfPoint, canvasSize);
        if (colliXAxis || colliYAxis){
            return 'both';
        }
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
    //add object into tree
    this.addObject = function(object, region){
        //default region
        if (!region){
            region = this;
        }
        let obj = object;
        let end = false;
        //looping through stems to find a region to fit in
        while(end === false){
            //get location
            let location = region.sortRegion(obj);
            //check if obj can be sort into a location
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
                obj.stem = region;
                //check if region is overflowing max # of objects
                if (region.objects.length > region.max){
                    //split region
                    region.splitRegion();
                    //store and clear region objects
                    let objArr = region.objects;
                    region.objects = [];
                    //loop through the objs
                    for (let ii = 0; ii < objArr.length; ii ++){
                        let obj = objArr[ii];
                        let loc = region.sortRegion(obj);
                        if (loc === "both"){//if both region
                            //push to this region
                            region.objects.push(obj);
                            obj.stem = region;
                        }else{
                            //push to corresponding subregion
                            region.nodes[loc].objects.push(obj);
                            obj.stem = region.nodes[loc];
                        }
                    }
                }
            }
        }
    };
    //separate into 4 regions if primal
    if (this.level === 0){
        this.splitRegion();
        //update objects in region method
        this.addAllObject = function(collector){
            //clear objects first
            this.clearObject();
            //collect all the objects
            collector = collector || folder;
            let objList = collector.getAll();
            //loop throught all the objects
            for(let i = 0; i < objList.length; i ++){
                let obj = objList[i];
                let region = this;
                region.addObject(obj, region);
            }
        };
        this.clearObject = function(){
            //clean up everything in this object
            this.deleteRegion();
            this.splitRegion();
            this.objects = [];
        };
    }
}

//collector function
function Collector(){
    //Methods
    this.delete = function(key, name){
        if (key){
            let property = this[key];
            if (this[key]){
                delete this[key];
                return property;
            }
        }
        if (name){
            let property;
            let obj = this.getAll();
            obj.forEach(function(value, index){
                if (value.name === name){
                    property = value;
                    delete this[value.id];
                    return property;
                }
            });
        }
        return "object not found";
    };
    this.newObject = function(object){
        for (let i = 100000; i <= 999999; i ++){
            if (!this[i]){
                object.id = i;
                tree.addObject(object);
                this[i] = object;
                return object;
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

//object constructor functions
function ObjectBase(object, name, type, rotation, width, height, friction, bouncy, color, background, borderWidth, shape){
    if (!object){
        object = {};
    }
    var obj = object;
    this.name = obj.name || this.name;
    //types of physical objects
    //static, doesn't move, but able to be collided by other object
    //rigid, act like real object
    //float, same as rigid, but not affected by gravity
    this.type = obj.type || type || 'static';
    this.x = obj.x || this.x || 0;
    this.y = obj.y || this.y || 0;
    this.rotation = obj.rotation || this.rotation || rotation || 0;
    this.width = obj.width || this.width || width || 100;
    this.height = obj.height || this.height || height || 100;
    this.friction = obj.friction || this.friction || friction || 0;
    this.bouncy = obj.bouncy || this.bouncy || bouncy || 0;
    this.color = obj.color || this.color || color || "black";
    this.background = obj.background || this.background || background || "white";
    this.borderWidth = obj.borderWidth || this.borderWidth || borderWidth || 1;
    this.shape = obj.shape || this.shape || shape || 'rect';
    this.stem = obj.stem || this.stem;
    this.edges = shapeEdge(this);
    this.frame = [];
    //methods
    this.jumpTo = function(x, y){
        let oriX = this.x;
        let oriY = this.y;
        this.x = x;
        this.y = y;
        let movedX = this.x - oriX;
        let movedY = this.y - oriY;
        //redefine edges
        this.edges = shapeEdge(this);
        //where collision kicks in
        let colliList = this.isCollide('all');
        if (colliList.length > 0){
            for (let i = 0; i < colliList.length; i ++){
                //displacement function
                let colli = colliList[i];
                let obj2 = colli[0];
                let result = colli[1];
                let objSegment = result[0];
                let obj2Segment = result[1];
                function moveSeg(x, y){
                    objSegment[0] += x;
                    objSegment[1] += y;
                    objSegment[2] += x;
                    objSegment[3] += y;
                }
                function checkSeg(x, y){
                    return collisionLine(objSegment[0] + x, objSegment[1] + y, objSegment[2] + x, objSegment[3] + y, obj2Segment[0], obj2Segment[1], obj2Segment[2], obj2Segment[3]);
                }
                //rect only
                let xMove = movedX;
                let yMove = movedY;
                if (this.shape === 'rect' && obj2.shape === 'rect'){
                    //moving back to test
                    moveSeg(movedX * -1, movedY * -1);
                    //shrinking line algorithm
                    for (let i = 0; i < 10; i ++){
                        let multiplier = (1 / Math.pow(2, i)).toFixed(4);
                        //move shape to half way, see if collide
                        //doesn't change objSegment, only change x/y move
                        let adderX = movedX * multiplier;
                        let adderY = movedY * multiplier;
                        if (checkSeg(xMove, yMove)){
                            //if collide
                            //lower movement
                            xMove -= adderX;
                            yMove -= adderY;
                        }else{
                            //if doesn't collide
                            //increase movement
                            xMove += adderX;
                            yMove += adderY;
                            //decrement i
                            i --;
                        }
                    }
                    //move the object
                    this.x = oriX + xMove;
                    this.y = oriY + yMove;
                    console.log(this.x);
                    console.log(this.y);
                }
                //force adjustment
                //if rigid
                if (this.rigid){
                    //return[direction, speed]
                    let force = forceInverse(movedX, movedY);
                    //reverse direction
                    force[0] *= -1;
                    //adjust direction
                    force[0] += obj2.rotation;
                    //adjust speed
                    force[1] *= obj2.bouncy;
                }
                //if not then nvm
            }
        }
    };
    this.isCollide = function(object2){
        if (typeof(object2) !== 'object'){
            if (object2 !== 'all'){
                return "nil object";
            }
        }
        let obj = this;
        let obj2 = object2;
        //update quadtree
        tree.addAllObject(folder);
        if (this.stem === undefined){
            return "nil stem";
        }
        //part1, sort objects base on quadtree
        //only gather objects that have same node
        //or in father the node
        //a list of objects that 'might' collide with this
        let objList = [];
        let stem = this.stem;
        let level = stem.level;
        while(stem !== undefined){
            objList = objList.concat(stem.objects);
            stem = stem.father;
        }
        if (obj2 !== 'all'){
            //check only one object
            //early release
            if (!objList.includes(obj2)){
                return false;
            }
            //part2, check for collision
            //pretend to be rectangle
            if (obj.shape === 'rect' && obj2.shape === 'rect'){
                return collisionRect(obj, obj2);
            }
        }else{
            //check all collision
            let colliList = [];
            //loop through object list
            for (let i = 0; i < objList.length; i ++){
                let value = objList[i];
                if (value === obj) {continue;}
                if (value.shape === 'rect' && obj.shape === 'rect'){
                    let result = collisionRect(obj, value);
                    if (result !== false){
                        colliList.push([value, result]);
                    }
                }
            }
            return colliList;
        }
    };
    this.addKey = function(key, callback){
        let object = this;
        $(document).keydown(function(key1){
            if (key1.key === key){
                if (typeof(callback) === "function"){
                    callback(object);
                }
            }
        });
    };
    //folder
    if (type !== 'static'){
        this.rigid = new RigidBody(this);
    }
}

function RigidBody(parent){
    this.parent = parent || null;
    this.forces = [];
    this.addForce = function(object, key, speed, direction, type){
        this.forces.push(new Force(this, object, key, speed, direction, type));
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

function Force(parent, object, key, speed, direction, type){
    //direction
    //0 is right 90 is down 180 is left 270 is top
    //speed
    //equal to object move at "x pixels per second"
    //type
    //linear: normal linear, would stack up
    //rotational: move along an axis
    //gravity: speed = acceleration
    if (!object){
        object = {};
    }
    this.parent = parent;
    this.key = object.key || key || "nil";
    this.speed = object.speed || speed || 0;
    this.direction = object.direction || direction || 0;
    this.type = object.type || type || 'linear';
    //force methods
    this.fuse = function(force){
        //check if force is same type
        if (force.type !== this.type){
            return 'different type of force';
        }
        let xMove = 0;
        let yMove = 0;
        if (force.type === "linear"){
            let moves = forceCalculate(force.direction, force.speed);
            force.xMove = moves[0];
            force.yMove = moves[1];
            xMove += force.xMove;
            yMove += force.yMove;
            let moves2 = forceCalculate(this.direction, this.speed);
            this.xMove = moves2[0];
            this.yMove = moves2[1];
            xMove += this.xMove;
            yMove += this.yMove;
        }
        this.xMove = xMove;
        this.yMove = yMove;
        let dir = forceInverse(xMove, yMove);
        this.direction = dir[0];
        this.speed = dir[1];
        return this;
    };
    //special type attributes
    if (this.type === 'linear'){
        this.xMove = 0;
        this.yMove = 0;
        //precalculation
        if (!object.xMove && !object.yMove){
            let moves = forceCalculate(this.direction, this.speed);
            this.xMove = moves[0];
            this.yMove = moves[1];
            // let force = this;
            // //determine xMove and yMove
            // //change force into two subforce if not in a direction
            // if (force.direction % 90 !== 0){
            //     //store at first hand
            //     let direction = force.direction % 360;
            //     let speed = force.speed;
            //     //split force into two
            //     //check for direction for the splitting force
            //     let dir = 0;
            //     while(dir < direction){
            //         dir += 90;
            //     }
            //     let dir2 = dir - 90;
            //     //percent 1 = force direction in range of 90 / 90
            //     //if direction is 155, dir = 180 dir2 = 90
            //     //which means that dir - dir2 always = 90
            //     //percent 1 = 155 - 90 / 90
            //     //get speed closer to dir
            //     let s1 = (direction - dir2) / 90 * speed;
            //     //get speed closer to dir2
            //     let s2 = (dir - direction) / 90 * speed;
            //     //check corresponding side
            //     if (dir - direction < 45){//if closer to dir
            //         //s1 = dir
            //         let result = forceCalculate(dir, s1);
            //         force.xMove += result[0]; 
            //         force.yMove += result[1];
            //         result = forceCalculate(dir2, s2);
            //         force.xMove += result[0]; 
            //         force.yMove += result[1];
            //     }else if(dir - direction > 45){//if closer to dir2
            //         let result = forceCalculate(dir, s2);
            //         force.xMove += result[0]; 
            //         force.yMove += result[1];
            //         result = forceCalculate(dir2, s1);
            //         force.xMove += result[0]; 
            //         force.yMove += result[1];
            //     }else{//if multiply of 45
            //         //just calculate it and multiply by 2
            //         force.xMove += speed * 0.5;
            //         force.yMove += speed * 0.5;
            //     }
            // }else{//if 0,90,180,270,360 degree
            //     let holder = forceCalculate(force.direction, force.speed);
            //     force.xMove += holder[0];
            //     force.yMove += holder[1];
            // }
        }else{
            this.xMove = object.xMove;
            this.yMove = object.yMove;
        }
    }
    if (this.type === "rotational"){
        this.centerX = object.centerX;
        this.centerY = object.centerY;
    }
}

function Anchor(x, y){
    
}

//force functions
function forceCalculate(direction, speed){
    if (direction < 0){
        direction = direction % 360 + 360;
    }
    //90 degree algorithm
    function force90(direction, speed){
        let turn = Math.floor(direction / 90) % 4;
        //turn 0 = right
        //turn 1 = down
        //turn 2 = left
        //turn 3 = up
        if (turn % 2 === 1){//up n down
            if (turn === 1){
                yMoveLinear += speed;
            }else{
                yMoveLinear -= speed;
            }
        }else{//left n right
            if (turn === 0){
                xMoveLinear += speed;
            }else{
                xMoveLinear -= speed;
            }
        }
        return [xMoveLinear, yMoveLinear];
    }
    //given force in direction and speed, calculate xmove and ymove
    var xMoveLinear = 0;
    var yMoveLinear = 0;
    //if 90
    if (direction % 90 === 0){
        return force90(direction, speed);
    }
    //if not 90
    //do splitting angle
    let floor = Math.floor(direction / 90) * 90;
    var d;
    if (floor === 0 && floor === 180){
        d = 90 - (direction - floor);
    }else{
        d = (direction - floor);
    }
    xMoveLinear = speed * sinDeg(d);
    yMoveLinear = speed * cosDeg(d);
    //bottom right
    if (floor === 0){
        return [yMoveLinear,xMoveLinear];
    }
    //bottom left
    if (floor === 90){
        return [-1 * xMoveLinear, yMoveLinear];
    }
    //top left
    if (floor === 180){
        return [-1 * yMoveLinear, -1 * xMoveLinear];
    }
    //top right
    if (floor === 270){
        return [xMoveLinear,-1 * yMoveLinear];
    }
}

function forceInverse(xMove, yMove){
    let direction, speed = Math.hypot(xMove, yMove);
    //if y is 0
    if (yMove === 0){
        //if moving left
        if (xMove < 0){
            direction = 180;
        }else{
            //moving right
            direction = 0;
        }
        return [direction, speed];
    }
    //if x is 0
    if (xMove === 0){
        //if x is 0
        //if moving down
        if (yMove > 0){
            direction = 90;
        }else{
            //if moving up
            direction = 270;
        }
        return [direction, speed];
    }
    //if not, go arctan
    direction = Math.atan2(yMove, xMove) * 180 / Math.PI;
    return [direction, speed];
}

//handy function
function create(object, name, type, rotation, width, height, friction, bouncy, color, background, borderWidth, shape){
    return folder.newObject(new ObjectBase(object, name, type, rotation, width, height, friction, bouncy, color, background, borderWidth, shape));
}

//timed function
setInterval(function(){
    //check forces
    let objList = folder.getRigid();
    //loop through all rigid bodies in folder
    for (let i = 0; i < objList.length; i ++){
        //for object get rigid force
        var obj = objList[i];
        var rigid = obj.rigid;
        var forces = obj.rigid.forces;
        //if force empty then break
        if (forces.length === 0){
            break;
        }
        //record how many pixel should move in total
        let xMoveLinear = 0;
        let yMoveLinear = 0;
        //loop through all forces
        for (let i2 = 0; i2 < forces.length; i2 ++){
            let force = forces[i2];
            //linear force check
            if (force.type === "linear"){
                let moves = forceCalculate(force.direction, force.speed);
                force.xMove = moves[0];
                force.yMove = moves[1];
                xMoveLinear += force.xMove;
                yMoveLinear += force.yMove;
                //pop it from force list
                arrayRemove(forces, i2);
                i2 --;
            }
            //end of if linear
            //gravity force check
            if (force.type === 'gravity'){
                //insert a new linear force base on gravity's speed and dir
                forces.push(new Force(forces, {type: 'linear',
                    direction: force.direction, 
                    speed: force.speed}));
            }
        }
        //combining linear forces
        //make a new force
        let inverse = forceInverse(xMoveLinear, yMoveLinear);
        let newForce = new Force(rigid, {
            direction: inverse[0],
            speed: inverse[1],
            type: 'linear',
            xMove: xMoveLinear,
            yMove: yMoveLinear
        });
        //insert new force
        rigid.forces.push(newForce);
        //done with linear force
        //push result into object
        obj.jumpTo(obj.x + xMoveLinear * runtime / 1000);
        obj.jumpTo(null, obj.y + yMoveLinear * runtime / 1000);
    }
    //finish check force, rendering
    render();
}, runtime);

//initialization
function init(){
    
}

init();

var ball1 = create({}, 'ball', 'rigid', 0, 100, 100);
ball1.jumpTo(100,100);
//add keys to ball
ball1.addKey('w', function(){
    ball1.jumpTo(ball1.x, ball1.y - 5);
});
ball1.addKey('a', function(){
    ball1.jumpTo(ball1.x - 5, ball1.y);
});
ball1.addKey('s', function(){
    ball1.jumpTo(ball1.x, ball1.y + 5);
});
ball1.addKey('d', function(){
    ball1.jumpTo(ball1.x + 5, ball1.y);
});
var platform = create({}, 'platform', 'static', 0, 500, 200);
platform.jumpTo(10, 500);
render();
console.log(folder);
console.log(tree);