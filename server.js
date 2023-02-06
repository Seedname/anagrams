const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
      filePath = './index.html';
    }
  
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
    }
  
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(err.message);
        return;
      }
  
      res.writeHead(200, { 'Content-Type': 'contentType' });
      res.end(content, 'utf-8');
    });

});
  
  server.listen(80);

function getTxt(location) {
    return fs.readFileSync(location, 'utf8').split(/\r\n|\n/);
}
function scramble(word) {
    var scrambled = "";
    var word = word.split("");
    var len = word.length;
    for(var i = 0; i < len; i++) {
        var j = ~~(Math.random() * word.length);
        scrambled += word[j];
        word.splice(j, 1);
    }
    return scrambled;
}
function allAnagrams(word) {
    let anaWord = word;
    
    var all = [];
    for(var i = 0; i < words.length; i++) {
        var currentWord = words[i];
        anaWord = word;
        
        if(currentWord.length <= anaWord.length) {
            var isAnagram = true;
            for(var k = 0; k < currentWord.length; k++) {
                var current = currentWord.substring(k, k+1);
                var indOf = anaWord.indexOf(current);
                
                
                if(indOf > -1) {
                    anaWord = anaWord.split("");
                    anaWord.splice(indOf, 1);
                    anaWord = anaWord.join('');
                } else {
                    isAnagram = false;
                }
            }
                
            if (isAnagram) {
                all.push(currentWord);
            }
        }
    }
    return all;
}

const words = getTxt('./words/all.txt');
const usable =  getTxt('./words/usable.txt');

// const wss = new WebSocketServer({ port: 9091 });

class Room {
    constructor(code) {
        this.code = code;
        this.roundWords = new Array(4);
        this.answerArrays = new Array(4);
        this.startRound();
        this.clients = [];
    }

    startRound() {    
        for(let i = 0; i < this.roundWords.length; i++) {
            this.roundWords[i] = scramble(usable[~~(Math.random()* usable.length)]);
            this.answerArrays[i] = allAnagrams(this.roundWords[i]);
        }
    }

    getPoints() {
        let points = [];
        for(let i = 0; i < this.clients.length; i++) {
            points.push(this.clients[i].score);
        }
        return points;
    }
    
    getNames() {
        let names = [];
        for(let i = 0; i < this.clients.length; i++) {
            names.push(this.clients[i].name);
        }
        return names;
    }
    
    getRockets() {
        let rockets = [];
        for(let i = 0; i < this.clients.length; i++) {
            rockets.push(this.clients[i].rocket);
        }
        return rockets;
    }

    updateLb(ws) {
        const namesReturn = { type : "updateNames", data : JSON.stringify(this.getNames()) };
        const pointsReturn = { type: 'updatePoints', data: JSON.stringify(this.getPoints()) };
        
        ws.send(JSON.stringify(namesReturn));
        ws.send(JSON.stringify(pointsReturn));
    }
    
    onConnection(ws) {
        ws.score = 0;
        ws.name = "loading...";
        ws.rocket = ~~(Math.random()*3);
        ws.used = [];
        ws.currentWord = 0;
        this.clients.push(ws);
    }

    onMessage(ws, message) {
        const packet = JSON.parse(message);
        
        switch (packet.type) {
            case 'name':
                let nameUsed = false;
                for(let i = 0; i < this.clients.length; i++) {
                    if(this.clients[i].name == packet.data) {
                        nameUsed = true;
                    }
                }

                if(nameUsed) {
                    const messagePacket = { type : 'message', data: 1 };
                    ws.send(JSON.stringify(messagePacket));
                } else {
                    ws.name = packet.data;

                    for (let i = 0; i < this.clients.length; i++) {
                        if(this.clients[i] == ws) {
                            const namePacketReturn = { type: 'message', data: 0 };
                            this.clients[i].send(JSON.stringify(namePacketReturn));
                        } 

                            this.updateLb(this.clients[i]);
                            const rocketsReturn = { type: 'updateRockets', data: JSON.stringify(this.getRockets()) };
                            for(let j = 0; j < this.clients.length; j++) {
                                this.clients[j].send(JSON.stringify(rocketsReturn));
                            }
                        
                        
                    }
                }
                break;
            case 'getWords':
                const wordsForRound = { type: 'updateWords', data: JSON.stringify(this.roundWords) };
                ws.send(JSON.stringify(wordsForRound));
                break;
            case 'retrieve':
                this.updateLb(ws);
                break;
            case 'checkWord':
                let used = false;
                for (let i = 0; i < ws.used.length; i++) {
                    if (packet.data == ws.used[i]) {
                        used = true;
                        break;
                    }
                }

                if(used) {
                    const messagePacket = { type : 'message', data: 2 };
                    ws.send(JSON.stringify(messagePacket));   
                } else {
                    let valid = false;
                    for (let i = 0; i < this.answerArrays[ws.currentWord].length; i++) {
                        if (packet.data == this.answerArrays[ws.currentWord][i]) {
                            valid = true;
                            
                            if(ws.currentWord > 0) {
                                const points = packet.data.length * 100;
                                ws.score += points;

                                for(let i = 0; i < this.clients.length; i++) {
                                    this.updateLb(this.clients[i]);
                                }
                            }
                            
                            const messagePacket = { type : 'message', data: 4 }; 
                            ws.send(JSON.stringify(messagePacket));
                            ws.used.push(packet.data);
                            break;
                        }
                    }
                    if(!valid) {
                        const messagePacket = { type : 'message', data: 3 };
                        ws.send(JSON.stringify(messagePacket));   
                    }

                }
                break;
            case 'phaseChange':
                ws.currentWord = packet.data;
                ws.used = [];
                break;
        }
    }

    onClose(ws) {
        if (this.clients.length > 0) {
            for(let i = 0; i < this.clients.length; i++) {
                if (this.clients[i] == ws) {
                    const rmRocket = { type: 'delRocket', data: ws.name };
                    for (let j = 0; j < this.clients.length; j++) {
                        if(i != j) {
                            this.clients[j].send(JSON.stringify(rmRocket));
                        }
                        
                    }
                    this.clients.splice(i, 1);
                    const rocketsReturn = { type: 'updateRockets', data: JSON.stringify(this.getRockets()) };
                    for (let j = 0; j < this.clients.length; j++) {
                        this.updateLb(this.clients[j]);
                        this.clients[j].send(JSON.stringify(rocketsReturn));
                    }
                    break;
                }
            }
        }
    }
}

const wss = new WebSocket.Server({ port: 9091 });
let room = new Room("");
wss.on('connection', (ws, req) => {
    // const path = new URL(`http://${req.headers.host}${req.url}`).pathname;
    // console.log(`Received request for path: ${path}`);

    // const query = url.parse(req.url, true).query;
    // console.log(query);

    room.onConnection(ws);
    ws.on('message', (message) => {
        room.onMessage(ws, message);
     });
 
     ws.on('close', () => {
         room.onClose(ws);
     });
});