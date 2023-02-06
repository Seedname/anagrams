//<a href="https://www.freepik.com/free-vector/underground-with-lawn-dirt_4931663.htm#query=earth%20crust&position=28&from_view=search&track=sph">Image by brgfx</a> on Freepik
function Letter(letter, x, y, s) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.s = s;
    
    this.newPos = createVector(0, height-2*s);
    this.move = false;
    this.shake = false;
    this.angle = 0;

    var phase1 = false;
    this.animation = function() {
        if(this.angle > -10 && this.angle <= 0 && phase1 === false) {
            this.angle -= 5;
            if(this.angle <= -10) {
                phase1 = true;
            }
        } else if(this.angle < 10 && phase1 === true) {
            this.angle += 5;
            if(this.angle >= 10) {
                phase1 = false;
            }
        } else if(this.angle > 0 && phase1 === false) {
            this.angle -= 5;
            if(this.angle <= 0) {
                this.angle = 0;
                this.shake = false;
            }
        }
        
    };
    
    this.display = function(hover, num) {
        noStroke();
        // fill(255, 232, 130);
        // if(this.click() && hover) {
            // fill(255-20, 232-20, 130-20);
        // }
        noFill();
        stroke(255);
        
        if(this.shake) {
            this.animation();
        }
        push();
        translate(this.x, this.y);
        rotate(radians(this.angle));
        rect(-this.s/2, -this.s/2, this.s, this.s, 5);
        textSize(3/5 * this.s);
        // fill(255-130, 232-130, 130-130);
        fill(255);
        textAlign(CENTER, CENTER);
        text(this.letter.toUpperCase(), 0, 0);
        
        textAlign(CENTER, TOP);
        fill(128);
        textSize(1/5 * this.s);
        text(num, 0, this.s/2+5);
        
        textAlign(CENTER, CENTER);
        pop();
    };
    
    this.click = function() {
        return (mouseX >= this.x - this.s/2 && mouseX <= this.x + this.s/2 && mouseY >= this.y - this.s/2 && mouseY <= this.y + this.s/2);
    };
    
    this.moveTo = function() {
        var x = this.newPos.x;
        var y = this.newPos.y;

        var dx = x - this.x;
        var dy = y - this.y;
        
        this.x += dx/5;
        this.y += dy/5;
    
        if(sqrt(sq(dx) + sq(dy)) < 0.5) {
            this.move = false;
        }
    };
}
function isInside(x, y, w , h) {
    return (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h);
}
function inCircle(x, y, s) {
    return dist(mouseX, mouseY, x, y) <= s/2;
}

function scramble(word) {
    var scrambled = "";
    var word = word.split("");
    var len = word.length;
    for(var i = 0; i < len; i++) {
        var j = floor(Math.random() * word.length);
        scrambled += word[j];
        word.splice(j, 1);
    }
    return scrambled;
}
function shuffleIcon(x, y, s) {
    push();
    translate(x-s/8, y);
    
    s = s/3;
    noStroke();
    ellipse(s/8, 0, 3*s, 3*s);
    
    stroke(0);
    noFill();
    beginShape();
    vertex(-s, -s/2);
    vertex(-s/2, -s/2);
    vertex(s/2, s/2);
    vertex(s, s/2);
    endShape();
    
    beginShape();
    vertex(s, -s/2);
    vertex(s/2, -s/2);
    vertex(-s/2, s/2);
    vertex(-s, s/2);
    endShape();
    
    fill(0);
    triangle(s, -s/2-s/8, s+s/4, -s/2, s, -s/2+s/8);
    triangle(s, s/2+s/8, s+s/4, s/2, s, s/2-s/8);
    pop();

}

let right, wrong, tick;
let a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z;
let a1, b1, c1, d1, e1, f1, g1, h1, i1, j1, k1, l1, m1, n1, o1, p1, q1, r1, s1, t1, u1, v1, w1, x1, y1, z1;
let lists;
let lists2;
let images = []

var rocket0, rocket1, rocket2;
var socket;
var roundWords = [];
var leadRocket = 0;

function preload() {
    socket = new WebSocket('ws://127.0.0.1:9091');    

    rocket0 = [loadImage('assets/rocket0-t.png'), loadImage('assets/rocket0-b.png')]
    rocket1 = [loadImage('assets/rocket1-m.png'), loadImage('assets/rocket1-m2.png'), loadImage('assets/rocket1-l.png'), loadImage('assets/rocket1-r.png')]
    rocket2 = [loadImage('assets/rocket2-m.png'), loadImage('assets/rocket2-l.png'), loadImage('assets/rocket2-r.png')]
    ground = [loadImage('assets/earth-crust-10x.png')];

    right = loadSound('assets/metal-small2.wav');
    wrong = loadSound('assets/interface1.wav');
    tick = loadSound('assets/interface6.wav');

}


function Particle(x, y, vx, vy, s, life) {
    this.x = x;
    this.y = y;

    this.vx = vx;
    this.vy = vy;

    this.c = [random(200, 230), random(75, 200), 0];
    let ay = 30/60;
    
    this.lifespan = 0;

    let rotateVel = random(0, 10);
    this.angle = 0;
    this.update = function() {
        this.x += this.vx;
        this.y += this.vy;

        this.lifespan ++;
        
        this.vy += ay;
        // this.angle += rotateVel;
    };

    this.display = function() {
        fill(this.c[0], this.c[1], this.c[2], map(this.lifespan, 0, life, 255, 0));
        // push();
            // translate(this.x, this.y);
            // rotate(this.angle);
            // rect(0, 0, this.s, this.s);
        // pop();
        rect(this.x, this.y, s, s);
    };

    this.run = function() {
        this.update();
        this.display();
    };
}
function RocketNode(x, y, lifespan) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.particles = [];

    this.run = function() {
        for(let i = 0; i < this.speed; i++) {
            // if(this.particles.length > maxParticles) {
            //     this.particles.shift();
            // }

            this.particles.push(new Particle(this.x, this.y, random(-2, 2), this.speed/2 + random(this.speed/5), random(3,5), lifespan));

        }

        for(let i = this.particles.length-1; i >= 0; i--) {
            this.particles[i].run();
            if(this.particles[i].lifespan > lifespan) {
                this.particles.splice(i, 1);
            }
        }
    }
}
function Rocket(type, x, y, s, lead, name) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.vy = 0;
    this.s = s;
    this.lead = lead;
    this.name = name;

    switch (type) {
        case 0:
            this.s = s*3;
            this.offsets = [[0, -10.5*this.s/20-1.4*this.s], [0, 10.5*this.s/20-1.4*this.s]]

            this.boosterPoses = [[this.x-4*this.s/20, this.y+this.s], [this.x+4*this.s/20, this.y+this.s]];
            this.boosters = new Array(this.boosterPoses.length);
            
            for(let i = 0; i < this.boosterPoses.length; i++) {
                let pos = this.boosterPoses[i];
                this.boosters[i] = new RocketNode(pos[0], pos[1], 10);
            }
            // this.boosters = [new RocketNode(this.x-100, this.y-s, 20)];

            this.parts = rocket0;
            break;
        case 1:
            this.offsets = [[0, 10*s/20-4*s], [0, -34*s/20-4*s], [-27*s/20, 8*s/20-4*s], [27*s/20, 8*s/20-4*s]];

            this.boosterPoses = [[this.x, this.y+68*s/20], [this.x-9*s/20, this.y+65*s/20], [this.x+9*s/20, this.y+65*s/20], [this.x-27*s/20, this.y+65*s/20], [this.x+27*s/20, this.y+65*s/20]];
            this.boosters = new Array(this.boosterPoses.length);
            
            for(let i = 0; i < this.boosterPoses.length; i++) {
                let pos = this.boosterPoses[i];
                this.boosters[i] = new RocketNode(pos[0], pos[1], 10);
            }

            this.parts = rocket1;
            break;
        case 2:
            this.offsets = [[0, -39*s/20-5*s], [-15*s/20, 39*s/20-5*s], [15*s/20, 39*s/20-5*s]]

            this.boosterPoses = [[this.x, this.y+80*s/20], [this.x+16*s/20, this.y+80*s/20], [this.x-16*s/20, this.y+80*s/20]];
            this.boosters = new Array(this.boosterPoses.length);
            
            for(let i = 0; i < this.boosterPoses.length; i++) {
                let pos = this.boosterPoses[i];
                this.boosters[i] = new RocketNode(pos[0], pos[1], 10);
            }

            this.parts = rocket2;
            break;
        
    }

    this.minWidth = Infinity;
    for (let i = 0; i < this.parts.length; i++) {
        if (this.parts[i].width < this.minWidth) {
            this.minWidth = this.parts[i].width;
        }
    }

    this.phase = 0;
    // let offsets2 = new Array(this.boosters.length);
    // for (let i = 0; i < this.boosters.length; i++) {
    //     offsets2[i] = [0, 0];
    // }
    var vx = [];
    var vy = [];
    for(let i = 0; i < this.parts.length-1; i++) {
        vy.push(10);
        // va.push(0);
    }


    this.move = false;
    this.newPos = 0;

    this.moveTo = function(y) {
        this.move = true;
        this.newPos = y;
    };

    this.animation = function() {
        if(this.type == 0) {
            this.offsets[1][1] += 5;
            // va[i] += 0.1;
            vy[i-1] += 6/60;
            if(this.boosters.length > 1) {
                this.boosters.pop();
            }
            this.boosters[0].x = this.x;
            this.boosters[0].y = y-20*this.s/20;
        } else if(this.type == 1) {
            for(let i = 1; i < this.offsets.length; i++) {
                // this.offsets[i][1] += vx[i-1];
                this.offsets[i][1] += 5;
                // va[i] += 0.1;
                // vy[i-1] += 6/60;
            }
            
            if(this.boosters.length > 3) {
                this.boosters.pop();
            }
            // if(this.y - s < height/2 && this.offsets[1][1] > height-3*s) {
            //     this.y ++;
            // }
            // this.boosters[0].x = this.x;
            
        } else if(this.type == 2) {
            for(let i = 1; i < this.offsets.length; i++) {
                // this.offsets[i][1] += vx[i-1];
                this.offsets[i][1] += 5;
                // va[i] += 0.1;
                // vy[i-1] += 6/60;
            }
            
            if(this.boosters.length > 1) {
                this.boosters.pop();
            }
            // if(this.y - s < height/2 && this.offsets[1][1] > height-3*s) {
            //     this.y ++;
            // }
            // this.boosters[0].x = this.x;
            // this.boosters[0].y = height;   
        }
    };

    this.strength = 0;

    this.display = function() {
        if(this.move) {
            let d = height/2-this.y - this.newPos;
            // if (!this.lead) {
            //     d -= height;
            // }
            // print(d);
            let vy = d/100;
            this.y += vy;
            this.vy = -vy;
            if(abs(d) < 1) {
                this.move = false;
            }
        }

        if(this.phase == 3) {
            // print(true);
            this.animation();
        } 

        // if(this.phase > 0 && this.vy > 0) {
        //     this.vy -= 0.05;
        // } else {
        //     this.vy = 0;
        // }

        if(this.lead) {
            translate(0, height-this.y);
        } 
        // this.y -= this.vy;

        if(this.phase > 0) {
            for(let i = 0; i < this.boosters.length; i++) {
                push();
                translate(0, -height+this.y)
                this.boosters[i].run();
                pop();
            }
        }

        if (this.type == 0 || this.type == 2) {
            // for(let i = this.parts.length-1; i >= 0; i--) {
            for(let i = 0; i < this.parts.length; i++) {
                const p = this.parts[i];
                const w = this.parts[i].width;
                const h = this.parts[i].height;
                
                const ratio = w/this.minWidth;

                // image(p, this.offsets[i][0]*ratio +this.x - s*ratio/2, this.offsets[i][1]*ratio +  this.y-this.s/2, s * ratio, s*h/w*ratio);
                push();
                    translate(this.offsets[i][0] +this.x - this.s*ratio/2, this.offsets[i][1] + this.y - height/2);
                    // if(this.phase2) {
                    //     rotate(va[i]);
                    // }
                    image(p, random(-this.strength, this.strength), random(-this.strength, this.strength), this.s * ratio, this.s*h/w*ratio);
                pop();
            }
        } else {
            for(let i = this.parts.length-1; i >= 0; i--) {
                // for(let i = 0; i < this.parts.length; i++) {
                    const p = this.parts[i];
                    const w = this.parts[i].width;
                    const h = this.parts[i].height;
                    
                    const ratio = w/this.minWidth;
    
                    push();
                        translate(this.offsets[i][0] +this.x - this.s*ratio/2, this.offsets[i][1] + this.y - height/2);
                        // if(this.phase2) {
                        //     rotate(va[i]);
                        // }
                        image(p,  random(-this.strength, this.strength), random(-this.strength, this.strength), this.s * ratio, this.s*h/w*ratio);
                    pop();
                    
                }
        }

        fill(255, 0, 0);
        if(this.lead) {
            fill(0, 255, 0);
        }
        textSize(25);
        textAlign(CENTER, BASELINE);
        switch (this.type) {
            case 0:
                text(this.name, this.x, this.y-height/2 + this.offsets[0][1] - 0.1*this.s);
                break;
            case 1:
                text(this.name, this.x, this.y-height/2 + this.offsets[0][1] - 2.5*this.s);
                break;
            case 2:
                text(this.name, this.x, this.y-height/2 + this.offsets[0][1] - 0.5*this.s);
                break;
        }
        // text(this.name, )

    };
}

let choices;
let word;
let alphabet;
let letters;
let locations = [];
let answerArray;
let answerLetters;
let answer;
var points;
var used;

var time2;
var time3;
let endCard;
var notifText;
var isError;
let answers;
// let pointsPossible;
let foundWords;
let floorTime;
let reason;
let rockets = [];
var bg = [];
let rocketsArray = [];
let planet = 0;

function resetWord(word1) {
    // var w = choices[floor(random(choices.length))];
    // console.log(roundWords);
    var w = word1;
    // answers = allAnagrams(w);
    // pointsPossible = totalPoints(answers);
    w = scramble(w).split("");
    word = [];
    answerArray = [];
    used = [];
    answer = "";
    answerLetters = 0;

    for(var i = 0; i < 6; i++) {
        word.push(new Letter(w[i], i*(s+10)+width/2-(5*(s+10))/2, height-2*s, s));
    }
}

function setup() {
    createCanvas(document.body.clientWidth, window.innerHeight); 
    // pointsPossible = 0;
    resetWord('');
    // rockets.push(new Rocket(1, 0, height/2, 100/3, true, null));

    socket.onmessage = (event) => {
        const packet = JSON.parse(event.data);
    
        switch (packet.type) {
            case 'message':
                switch (packet.data) {
                    case 0:
                        const getWords = { type : "getWords", data : null };
                        socket.send(JSON.stringify(getWords));
                        scene ++;
                        break;
                    case 1:
                        nameError = "Name Taken";
                        nameErrorTime = 100;
                        break;
                    case 2:
                        //word already used
                        triggerShake("Word already used");
                        break;
                    case 3:
                        //invalid word
                        triggerShake("Word doesn't exist");
                        break;
                    case 4:
                        //correct word

                        if(phase == 0) {
                            blastoffTimer = 20;
                        } else {
                            points += answer.length*100;
                            // rockets[0].moveTo(points*5);
                        }
                        
                        right.play();
                        time3 = 254;
                        foundWords ++;
                        notifText = "+" + answer.length*100 + " points";
                        isError = false;
                        for(var k = 0; k < answerArray.length; k++) {
                            if(answerArray[k] >= 0) {
                                word[answerArray[k]].move = true;
                                word[answerArray[k]].newPos.set(locations[answerArray[k]], height-2*s);
                            }
                        }
                        answerArray = [];
                        answer = "";
                        answerLetters = 0;
                        
                        break;
                }
                break;                
            case 'updateNames':
                leaderBoardNames = JSON.parse(packet.data);
                // while (lbPoints.length < leaderBoardNames.length) {
                //     lbPoints.push(0);
                // }
                // for(let i = 0; i < lbPoints.length; i++) {
                //     if(!lbPoints[i]) {
                //         lbPoints[i] = 0;
                //     }
                // }
                break;
            case 'updatePoints':
                // const before = JSON.parse(JSON.stringify(lbPoints));
                lbPoints = JSON.parse(packet.data);

                for(let i = 0; i < leaderBoardNames.length; i++) {
                    for(let j = 0; j < rockets.length; j++) {
                        if(rockets[j].name == leaderBoardNames[i]) {
                            rockets[j].moveTo(lbPoints[i]*5);
                            if(rockets[j].phase < 3 && lbPoints[j] >= 10000) {
                                rockets[j].phase = 3;
                                rockets[j].strength = 0;
                            }
                            if(rockets[j].phase == 0 && lbPoints[j] > 0) {
                                rockets[j].strength = 3;
                                rockets[j].phase = 1;
                            }
                        }
                    }
                }

                
                break;
            case 'updateRockets':
                console.log(true);
                rocketsArray = JSON.parse(packet.data);
                
                for (let i = 0; i < rocketsArray.length; i++) {
                    if (i < rockets.length) {
                        if(rockets[i].name !== leaderBoardNames[i]) {
                            rockets[i].name = leaderBoardNames[i];
                            if(leaderBoardNames[i] == username) {
                                rockets[0].lead = false;
                                rockets[i].lead = true;
                                leadRocket = i;
                            }
                        }
                    } else {
                        rockets.push(new Rocket(rocketsArray[i], (i+1)*5*s, height/2, 100/3, false, leaderBoardNames[i]));
                    }
                }

                for (let i = 0; i < rockets.length; i++) {
                    rockets[i].name = leaderBoardNames[i];
                    if(leaderBoardNames[i] == username) {
                        rockets[i].lead = true;
                        leadRocket = i;
                    } else {
                        rockets[i].lead = false;
                    }
                }

                break;
            case 'updateWords':
                roundWords = JSON.parse(packet.data);
                resetWord(roundWords[0]);
                break;
            case 'delRocket':
                for(let i = 0; i < rockets.length; i++) {
                    if(rockets[i].name == packet.data) {
                        rockets.splice(i, 1);
                        for (let j = 0; j < rockets.length; j++) {
                            rockets[j].name = leaderBoardNames[j];
                            rockets[j].x = j*5*s;
                            if(leaderBoardNames[j] == username) {
                                rockets[j].lead = true;
                                leadRocket = j;
                            }
                        }
                        break;
                    }
                }

        }
      };
    
      
    // choices = [];
    // word = [];
    // for(let i = 0; i < lists2.length; i++) {
    //     for(let j = 0; j < lists2[i].length; j++) {
    //         choices.push(lists2[i][j]);
    //     }
    // }
    
    alphabet = "abcdefghijklmnopqrstuvwxyz";
    letters = alphabet.split("");
    s = 55;

    
    locations = [];
    // w = choices[floor(random(choices.length))];
    // answers = allAnagrams(w);
    // pointsPossible = totalPoints(answers);
    // w = scramble(w).split("");
    
    for(let i = 0; i < 6; i++) {
        // word.push(new Letter(w[i], i*(s+10)+width/2-(5*(s+10))/2, height-2*s, s));    
        locations.push(i*(s+10)+width/2-(5*(s+10))/2);
    }
    
    // answerArray = new Array(6);
    // for(var i = 0; i < 6; i++) {
    //     answerArray[i] = -1;
    // }
    // answerLetters = 0;
    // answer = "";
    
    points = 0;
    used = [];
    // startTime = Date.now();
    // time = 60;
    time2 = 0;
    time3 = 255;
    floorTime = 60;
    notifText = "";
    isError = true;
    endCard = -3/4*height;
    foundWords = 0;
    reason = "Time's Up!";

    
    // rockets.push(new Rocket(0, width/2-300, height/2, 100, false));
    // rockets.push(new Rocket(2, width/2+300, height/2, 100/3.5, false));
    // rockets[0].vy = 6;
    // rockets[1].vy = 5;


    for(let i = 0; i < 100; i++) {
        bg.push([random(width), random(height)]);
    }


}

function updatePhase(phase) {
    const updateMessage = {type : 'phaseChange', data : phase};
    socket.send(JSON.stringify(updateMessage));
}

function joinAnswer() {
    var s = "";
    for(var i = 0; i < answerArray.length; i++) {
        if(answerArray[i] > -1) {
            s += word[answerArray[i]].letter;
        }
    }
    return s;
}

let phase = 0;
var dotFill = 0;

var blastoffTimer = 0;
var phaseReqs = [6, 6, 6, 6];

var scene = 0;
var username = "";

var leaderBoardNames = [];
var lbPoints = [];

var nameError = "";
var nameErrorTime = 0;
draw = function() {
    
    // for (let i = 0; i < rockets.length; i++) {
    //     if(rockets[i].name !== leaderBoardNames[i]) {
    //         rockets[i].name = leaderBoardNames[i];
    //         if(leaderBoardNames[i] == username) {
    //             rockets[i].lead = true;
    //             leadRocket = i;
    //         } else {
    //             rockets[i].lead = false;
    //         }
    //     }
    // }

    if(nameErrorTime > 0) {
        nameErrorTime --;
    } else {
        nameErrorTime = 0;
    }
    if(scene == 0) {
        background(0);
        fill(255);
        noStroke();
        for(let i = 0; i < bg.length; i++) {
            bg[i][1] += 5;
            bg[i][1] %= height;
            ellipse(bg[i][0], bg[i][1], 2, 2);
        }

        fill(255);
        textSize(70);
        textAlign(CENTER, CENTER);
        text("Enter your name:", width/2, height/2-3*s);

        if(frameCount % 100 > 50) {
            fill(255);
            rect(width/2-5*s + username.length*50, height/2, 50, 7);
        }
        textAlign(CORNER, BASELINE);
        let n = username.split("");
        for(let i = 0; i < n.length; i++) {
            text(n[i], width/2-5*s+50*i, height/2)
        }

        if(nameErrorTime > 0) {
            textSize(30);
            fill(255, 0, 0, 255*nameErrorTime/100);
            textAlign(CENTER, BOTTOM);
            text(nameError, width/2, height/2-1.5*s);
        }
        
    } else {
        if(phase > 1) {
            background(0);
            noStroke();
            fill(dotFill);
            if(dotFill < 255) { dotFill ++; }
            let num = 5;
            if (rockets.length > 0 && rockets.length == leaderBoardNames.length) {
                num = max(5, rockets[leadRocket].vy);
            }
            for(let i = 0; i < bg.length; i++) {
                bg[i][1] += num;
                bg[i][1] %= height;
                ellipse(bg[i][0], bg[i][1], 2, 2);
            }
        } else if(rockets.length > 0 && rockets.length == leaderBoardNames.length) {
            noStroke();
            if(-rockets[leadRocket].y/10000 < 1) {
                for(let i = 0; i < 100; i++) {
                    let c = lerpColor(color(0, 150, 255), color(0, 255, 255), i/100 + rockets[leadRocket].y/10000)
                    
                    fill(c)
                    rect(0, i*height/100, width, height/100)
                }
            } else {
                background(0)
                let c = map(-rockets[leadRocket].y/10000-1, 0, 1, 255, 0);
                fill(0, 150, 255,c);
                if(c <= 1) {
                    phase ++;
                    rockets[leadRocket].strength = 0;
                    resetWord(roundWords[phase]);
                    updatePhase(phase);
                }
                rect(-1, -1, width+1, height+1);
            }
        }
        


        // print(height/2-rockets[0].y)

        if(rockets.length > 0 && rockets.length == leaderBoardNames.length) {
            if(phase == 2 && points >= 10000) {
                phase = 3;
                resetWord(roundWords[phase]);
                updatePhase(phase);
            }
            
            // for (let i = 0; i < rockets.length; i++) {
            //     rockets[i].name = leaderBoardNames[i];
            //     if(leaderBoardNames[i] == username) {
            //         rockets[i].lead = true;
            //         leadRocket = i;
            //     } else {
            //         rockets[i].lead = false;
            //     }
            // }

            for(let i = 0; i < leaderBoardNames.length; i++) {
                for(let j = 0; j < rockets.length; j++) {
                    if(rockets[j].name == leaderBoardNames[i]) {
                        rockets[j].moveTo(lbPoints[i]*5);
                    }
                    
                }
            }
            push();
                rockets[leadRocket].display();
                if(phase == 0) {
                    rockets[leadRocket].y = height/2;
                }
                for(let i = 0; i < rockets.length; i++) {
                    // rockets[i].vy = random(10, 20);
                    rockets[i].x = (i+1)*5*s;
                    if(i != leadRocket) {
                        rockets[i].display();
                    }
                }
                
                noStroke();
                // fill(255);
                // rect(0, height-7*s-height/2, width, height-4*s);
                // let s1 = width/ground[planet].width;
                let s1 = (height/2)/ground[planet].height;
                for (let i = 0; i < width/(ground[planet].width*s1); i++) {
                    image(ground[planet], i*~~(ground[planet].width*s1), 2*s, ground[planet].width*s1, ground[planet].height*s1);
                }
                
            pop();
        }
        
        if(time3 < 255) {
            time3 -= 5;
            fill(0, 189, 0, time3);
            
            if(isError) {
                fill(255, 0, 0, time3);
            }
            textAlign(CENTER, CENTER);
            textSize(20);
            text(notifText, width/2, height-4*s-50+25);
            
            if(time3 < 0) {
                time3 = 255;
            }
        }
        // if(word.length > 0) {}
        for(var i = 0; i < word.length; i++) {
            fill(100);
            rect(i*(s+10)+width/2-(5*(s+10))/2 - s/2, height-4*s, s, s, 5);
        }
        
        for(var i = 0; i < word.length; i++) {
            if(word[i].move) {
                word[i].moveTo();
            }
            word[i].display(true, i + 1);
        }
        
        rectMode(CORNER);
        
        fill(255);
        rect(width/2-100*s/100, height-s, 100 * s/50 , 35 * s/50, 5);
        fill(30);
        
        textAlign(CENTER, CENTER);
        textSize(25 * s/50);
        text("Submit", width/2,height-s + 35 * s/100);
        
        textAlign(CENTER, TOP);
        textSize(s/5);
        fill(128);
        text("Enter", width/2, height-s +  (35 * s/50) + 5);
        
        fill(0);
        textSize(25 * s/50);
        textAlign(CENTER, TOP);
        text(points + " points", width/2, height-2*s-200);

        
        fill(255);

        
        shuffleIcon(width/2-(s+7)*3-40, height-2*s, 30);
        
        textAlign(CENTER, TOP);
        textSize(s/5);
        fill(128);
        text("Shift", width/2-(s+7)*3-40-30/12, height-2*s + 20);
        
        noStroke();

        textSize(20);
        fill(255);
        textAlign(LEFT, TOP);
        for(let i = 0; i < leaderBoardNames.length; i++) {
            text(leaderBoardNames[i] + ": " + lbPoints[i], 0, i*25);
        }
        if(blastoffTimer > 0 && phase == 0) {
            blastoffTimer-=0.2;
            fill(0, 0, 0, blastoffTimer*255/20);
            textSize(100);
            textAlign(CENTER, CENTER);
            text(phaseReqs[phase]-foundWords, width/2, height/2);
            if(foundWords == phaseReqs[phase]) {
                phase ++;
                resetWord(roundWords[phase]);
                updatePhase(phase);
            }
        }
        if(rockets.length > 0 && rockets.length == leaderBoardNames.length) {
            if(phase == 0 && foundWords > 2) {
                rockets[leadRocket].strength = 1;
            } 
            if(phase == 1) {
                rockets[leadRocket].strength = 3;
            }
            rockets[leadRocket].phase = phase;
        }
    }
    
};


function reset() {
    var w = choices[floor(random(choices.length))];
    // answers = allAnagrams(w);
    // pointsPossible = totalPoints(answers);
    w = scramble(w).split("");
    word = [];
    answerArray = [];
    used = [];
    answer = "";
    answerLetters = 0;
    // time = 60;
    points = 0;
    time2 = 0;
    time3 = 255;
    startTime = Date.now();
    endCard = -3/4*height;
    foundWords = 0;
    reason = "Time's Up!";
    for(var i = 0; i < 6; i++) {
        word.push(new Letter(w[i], i*(s+10)+width/2-(5*(s+10))/2, height-2*s, s));
        
    }
    for(let i = 0; i < rockets.length; i++) {
        rockets[i].y = height/2;
        rockets[i].vy = 0;
    }
    phase = 0;

}
function triggerShake(error) {
    for(var k = 0; k < answerArray.length; k++) {
        if(answerArray[k] >= 0) {
            word[answerArray[k]].shake = true;
        }
    }
    
    time3 = 254;
    notifText = error;
    isError = true;
    wrong.play();
}

function keyPressed() {
    if(scene == 0) {
        if (keyCode >= 65 && keyCode <= 90 || keyCode === 8) {
            if(keyCode != 8) {
                var letter = letters[keyCode - 65];
                username += letter;
            } else {
                username = username.substring(0, username.length-1)
            }
        } else if(keyCode == 13) {
            const namePacket = { type: 'name', data: username };
            socket.send(JSON.stringify(namePacket));

            const newMessage = { type : "retrieve", data: null };
            socket.send(JSON.stringify(newMessage));

        }
    } else {
        if (keyCode >= 65 && keyCode <= 90 || keyCode === 8 || (keyCode >= 49 && keyCode <= 54)) {
            var letter = letters[keyCode - 65];
            for (var i = 0; i < word.length; i++) {
                var use = false;
                if (keyCode !== 8) {
                    for(var j = 0; j < answerArray.length; j++) {
                        if(i === answerArray[j]) {
                            use = true;
                        }
                    }
                }
                
                if (word[i].letter === letter && !use || keyCode === 8 || (keyCode >= 49 && keyCode <= 54)) {
                    if (keyCode === 8) {
                        i = answerArray[answerLetters - 1];
                    } else if(keyCode >= 49 && keyCode <= 54) {
                        i = keyCode - 49;
                    }
                    if (!(answerLetters == 0 && keyCode == 8)) {
                        word[i].move = true;
                    
                        if(word[i].newPos.y === height-2*s) {
                            word[i].newPos.set(locations[answerLetters], height-3.5*s);
                            answerArray[answerLetters] = i;
                            answerLetters ++;
                        } else {
                            answerLetters --;
                            word[i].newPos.set(locations[i], height-2*s);
            
                            var k = -1;
                            for(var j = 0; j < 6; j++) {
                                if(answerArray[j] === i) {
                                    k = j;
                                }
                            }
                            
                            if(k >= 0) {
                                for(var j = k+1; j < 7; j++) {
                                    answerArray[j-1] = answerArray[j];  
                                }
                                for(var j = 0; j < 6; j++) {
                                    if(answerArray[j] > -1) {
                                        word[answerArray[j]].move = true;
                                        word[answerArray[j]].newPos.set(locations[j], height-3.5*s);
                                    }
                                }
                            }
                        }
                    }
                    
                    return;
                }
            }
        }
        if(keyCode === 48 || (keyCode >= 55 && keyCode <= 57) || keyCode === 16) {
            for(var k = 0; k < answerArray.length; k++) {
                if(answerArray[k] >= 0) {
                    word[answerArray[k]].move = true;
                    word[answerArray[k]].newPos.set(locations[answerArray[k]], height-2*s);
                }
            }
            
            answerArray = [];
            answer = "";
            answerLetters = 0;
            
            var letters1 = [];
            for(var i = 0; i < word.length; i++) {
                letters1.push(word[i]);
            }
            
            var scrambled = [];
            var len = letters1.length;
            
            for(var i = 0; i < len; i++) {
                var j = floor(Math.random() * letters1.length);
                scrambled.push(letters1[j]);
                letters1.splice(j, 1);
            }
            
            word = scrambled;
            
            for(var i = 0; i < len; i++) {
                word[i].move = true;
                word[i].newPos.set(locations[i], height-2*s);
            }
        }
        if(keyCode === 13) {
            answer = joinAnswer(); 

            if(answer.length == 0) {
                triggerShake("No word entered");
            } else if(answer.length < 3) {
                triggerShake("Word too short");
            } else {
                const checkMessage = {type : 'checkWord', data : answer};
                socket.send(JSON.stringify(checkMessage));
            }
        }
    }   
}

function windowResized() {
    let prevWidth = width;
    let prevHeight = height;
    resizeCanvas(document.body.clientWidth, window.innerHeight);
    let finalWidth = width;
    let finalHeight = height;
    for(let i = 0; i < 6; i++) { 
        locations[i] = (i*(s+10)+width/2-(5*(s+10))/2);
    }
    
    for(var k = 0; k < answerArray.length; k++) {
        if(answerArray[k] >= 0) {
            word[answerArray[k]].move = true;
            word[answerArray[k]].newPos.set(locations[answerArray[k]], height-2*s);
        }
    }

    answerArray = [];
    answer = "";
    answerLetters = 0;

    var letters1 = [];
    for(var i = 0; i < word.length; i++) {
        letters1.push(word[i]);
    }

    var scrambled = [];
    var len = letters1.length;

    for(var i = 0; i < len; i++) {
        var j = floor(Math.random() * letters1.length);
        scrambled.push(letters1[j]);
        letters1.splice(j, 1);
    }

    word = scrambled;

    for(var i = 0; i < len; i++) {
        word[i].move = true;
        word[i].newPos.set(locations[i], height-2*s);
    }
    for(let i = 0; i < rockets.length; i++) {
        rockets[i].x *= finalWidth/prevWidth;
        for(let j = 0; j < rockets[i].boosters.length; j++) {
            rockets[i].boosters[j].x *= finalWidth/prevWidth;
            rockets[i].boosters[j].y *= finalHeight/prevHeight;
        }
    }

    bg = [];
    for(let i = 0; i < 100; i++) {
        bg.push([random(width), random(height)]);
    }
    
}
