var socket;
function preload() {
    let location = window.location.href;
    location = location.substring(location.indexOf("//")+2);
    location = location.substring(0, location.indexOf("/"));
    socket = new WebSocket('ws://'+location+':443'); 

//     rocket0 = [loadImage('assets/rocket0-t.png'), loadImage('assets/rocket0-b.png')]
//     rocket1 = [loadImage('assets/rocket1-m.png'), loadImage('assets/rocket1-m2.png'), loadImage('assets/rocket1-l.png'), loadImage('assets/rocket1-r.png')]
//     rocket2 = [loadImage('assets/rocket2-m.png'), loadImage('assets/rocket2-l.png'), loadImage('assets/rocket2-r.png')]
//     ground = [loadImage('assets/earth-crust-10x.png')];
}

function isInside(x, y, w, h) {
    return mouseX >= x && mouseX <= x+w && mouseY >= y && mouseY <= y+h;
}

var bg = [];
let scene = 0;
var code = "";
var codeErrorTime = 0;
var codeError = "";
var s = 55;

function setup() {
    createCanvas(document.body.clientWidth, window.innerHeight); 
    socket.onmessage = (event) => {
        const packet = JSON.parse(event.data);
    
        switch (packet.type) {
            case 'message':
                if(packet.data) {
                    location.replace(window.location.href + code);
                } else {
                    codeErrorTime = 100;
                    codeError = "Invalid Room Code";
                }
                break;
            case 'changeRoom':
                location.replace(window.location.href + packet.data);
        };
    };

    for(let i = 0; i < 100; i++) {
        bg.push([random(width), random(height)]);
    }
    
}

function draw() {
    background(0);
    fill(255);
    noStroke();
    for(let i = 0; i < bg.length; i++) {
        bg[i][1] += 5;
        bg[i][1] %= height;
        ellipse(bg[i][0], bg[i][1], 2, 2);
    }

    if(scene == 0) {
        fill(220);
        if(isInside(width/2-125, height/2-3*s, 250, 3*s/2)) {
            fill(150);
        }
        rect(width/2-125, height/2-3*s, 250, 3*s/2);

        fill(0);
        textAlign(CENTER, CENTER);
        textSize(35);

        text("Create Room", width/2, height/2 - 3*s + 3*s/4);

        fill(220);
        if(isInside(width/2-125, height/2+3*s/2, 250, 3*s/2)) {
            fill(150);
        }
        rect(width/2-125, height/2+3*s/2, 250, 3*s/2);

        fill(0);
        textAlign(CENTER, CENTER);
        textSize(35);

        text("Join Room", width/2, height/2+3*s/2+3*s/4);

        fill(255);
        text("OR", width/2, height/2);

    } else if (scene == 1) {
        fill(255);
        textSize(70);
        textAlign(CENTER, CENTER);
        text("Enter Room Code:", width/2, height/2-3*s);

        if(code.length < 4 && frameCount % 100 > 50) {
            fill(255);
            rect(width/2-1.5*s + code.length*50, height/2, 50, 7);
        }
        textAlign(CORNER, BASELINE);
        let n = code.split("");
        for(let i = 0; i < n.length; i++) {
            text(n[i], width/2-1.5*s+50*i, height/2)
        }

        if(codeErrorTime > 0) {
            codeErrorTime --;
            textSize(30);
            fill(255, 0, 0, 255*codeErrorTime/100);
            textAlign(CENTER, BOTTOM);
            text(codeError, width/2, height/2-1.5*s);
        } else {
            codeErrorTime = 0;
        }
    }
}

function mousePressed() {
    if(scene == 0) {
        if(isInside(width/2-125, height/2-3*s, 250, 3*s/2)) { 
            const roomPacket = { type: 'createRoom', message: null };
            socket.send(JSON.stringify(roomPacket));
        } else if(isInside(width/2-125, height/2+3*s/2, 250, 3*s/2)) {
            scene = 1;
        }
    } 
}
function keyPressed() {
    if(scene == 1) {
        if (keyCode >= 48 && keyCode <= 57 || keyCode === 8) {
            if(keyCode == 8) {
                code = code.substring(0, code.length-1);
            } else if(code.length < 4) {
                code += keyCode - 48;
            } 
        } else if(keyCode == 13) {
            const namePacket = { type: 'code', data: code };
            socket.send(JSON.stringify(namePacket));
        }
    }
}

function windowResized() {
    resizeCanvas(document.body.clientWidth, window.innerHeight);

    bg = [];
    for(let i = 0; i < 100; i++) {
        bg.push([random(width), random(height)]);
    }
    
}