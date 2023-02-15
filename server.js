const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

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
const banned =  getTxt('./words/banned.txt');

class Room {
    constructor(code) {
        this.code = code;

        this.roundWords = new Array(4);
        this.answerArrays = new Array(4);
        this.startRound();

        this.roundStart = false;
        this.public = false;
        
        this.clients = [];
    }

    startRound() {    
        for(let i = 0; i < this.roundWords.length; i++) {
            this.roundWords[i] = scramble(usable[~~(Math.random()* usable.length)]);
            this.answerArrays[i] = allAnagrams(this.roundWords[i]);
        }
    }

    getPoints() {
        const points = [];
        for(let i = 0; i < this.clients.length; i++) {
            points.push(this.clients[i].score);
        }
        return points;
    }
    
    getNames() {
        const names = [];
        for(let i = 0; i < this.clients.length; i++) {
            names.push(this.clients[i].name);
        }
        return names;
    }
    
    getRockets() {
        const rockets = [];
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

        const rocketsReturn = { type: 'updateRockets', data: JSON.stringify(this.getRockets()) };
        for(let i = 0; i < this.clients.length; i++) {
            this.updateLb(this.clients[i]);
            this.clients[i].send(JSON.stringify(rocketsReturn));
        }
    } 

    onMessage(ws, message) {
        const packet = JSON.parse(message);
        
        switch (packet.type) {
            case 'name':
                let nameUsed = false;
                for(let i = 0; i < this.clients.length; i++) {
                    if(this.clients[i].name === packet.data) {
                        nameUsed = true;
                    }
                }

                if(nameUsed) {
                    const messagePacket = { type : 'message', data: 1 };
                    ws.send(JSON.stringify(messagePacket));
                } else {
                    let innapropriate = false;
                    for(let i = 0; i < banned.length; i++) {
                        if(packet.data.indexOf(banned[i]) >= 0) {
                            innapropriate = true;
                        }
                    }

                    if (innapropriate) {
                        const messagePacket = { type : 'message', data: 5 };
                        ws.send(JSON.stringify(messagePacket));
                    } else {
                        ws.name = packet.data;

                        for (let i = 0; i < this.clients.length; i++) {
                            if(this.clients[i] == ws) {
                                const namePacketReturn = { type: 'message', data: 0 };
                                this.clients[i].send(JSON.stringify(namePacketReturn));

                                const rocketsReturn = { type: 'updateRockets', data: JSON.stringify(this.getRockets()) };
                                for(let j = 0; j < this.clients.length; j++) {
                                    this.updateLb(this.clients[j]);
                                    this.clients[j].send(JSON.stringify(rocketsReturn));
                                }
                                break;
                            } 
                        }
                    }
                }
                break;
            case 'getWords':
                if(this.roundStart) {
                    const wordsForRound = { type: 'updateWords', data: JSON.stringify(this.roundWords) };
                    ws.send(JSON.stringify(wordsForRound));
                }
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
                                const points = 100*Math.pow(packet.data.length-2, 2);
                                ws.score += points;

                                for(let j = 0; j < this.clients.length; j++) {
                                    this.updateLb(this.clients[j]);
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
            case 'startRound':
                if (ws == this.clients[0]) {
                    // const startPacket = JSON.stringify({type: "begin", data: null});
                    const wordsForRound = { type: 'updateWords', data: JSON.stringify(this.roundWords) };
                    this.roundStart = true;
                    for (let i = 0; i < this.clients.length; i++) {
                        this.clients[i].send(JSON.stringify(wordsForRound));
                    }
                }
                break;
            case 'switchState':
                if (ws == this.clients[0]) {
                    if(packet.data === true) {
                        this.public = true;
                    } else if(packet.data === false) {
                        this.public = false;
                    }
                }
                break;
        }
    }

    onClose(ws) {
        if (this.clients.length > 0) {
            for(let i = 0; i < this.clients.length; i++) {
                if (this.clients[i] == ws) {
                    const rmRocket = JSON.stringify({ type: 'delRocket', data: ws.name });
                    for (let j = 0; j < this.clients.length; j++) {
                        if(i != j) {
                            this.clients[j].send(rmRocket);
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
            if(this.clients.length <= 0) {
                rooms[parseInt(this.code, 10)] = undefined;
            }
        }
    }
}

const rooms = new Array(10000);

const server = http.createServer((req, res) => {
    let filePath = "." + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
  
    let extname = path.extname(filePath);

    if(extname == '') {
        const room = String(filePath).trim().substring(2);
        const current = rooms[parseInt(room, 10)];
        if(current) {
            filePath = './game.html';
            extname = path.extname(filePath);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end("No room with code " + room);
            return;
        }
    }

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
  
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });

});
  
server.listen(80);

function addLeading(num) {
    const str = num + "";
    return "000".substring(str.length-1) + str;
}

const wss = new WebSocket.Server({ port: 443 });

wss.on('connection', (ws, req) => {
    const parsedUrl = url.parse(req.url);
    const usePath = parsedUrl.pathname !== "/";

    if(usePath) {
        try {
            ws.room = parseInt(String(parsedUrl.pathname).substring(1), 10);
            rooms[ws.room].onConnection(ws);
        } catch {
            console.log(String(parsedUrl.pathname).substring(1) + " failed to parse");
            ws.close();
            return;
        }
    }

    ws.on('message', (message) => {
        if(usePath) {
            rooms[ws.room].onMessage(ws, message);
        } else {
            const packet = JSON.parse(message);
    
            switch (packet.type) {
                case 'code':
                    let open = false;
                    if(rooms[parseInt(packet.data,10)]) {open = true;}
                    const roomOpen = { type: 'message', data: open };
                    ws.send(JSON.stringify(roomOpen));
                    break;
                case 'createRoom':
                    let num = ~~(Math.random() * rooms.length);
                    let tries = 0;
                    while (rooms[num] && tries < 100) {
                        num = ~~(Math.random() * rooms.length);
                        tries ++;
                    }
    
                    if(tries >= 100) {
                        ws.close();
                    } else {
                        if(!rooms[num]) {
                            rooms[num] = new Room(addLeading(num));
                        }
                        const change = { type: 'changeRoom', data: addLeading(num) };
                        ws.send(JSON.stringify(change));
                    }
                    break;
                case 'sendRooms':
                    const names = [];
                    const codes = [];
                    const players = [];
                    for (let i = 0; i < rooms.length; i++) {
                        if(rooms[i]) {
                            let name = String(rooms[i].clients[0].name);
                            
                            if(name === "loading...") {
                                name = "unnamed";
                            }
                            names.push(name);
                            codes.push(String(rooms[i].code));
                            players.push(String(rooms[i].clients.length));
                        
                        }
                    }

                    const sendPacket = {type: 'publicRooms', data: JSON.stringify([names, codes, players])};
                    ws.send(JSON.stringify(sendPacket));
                    break;
            }
        }
    });
    

     ws.on('close', () => {
        if(usePath) {
            rooms[ws.room].onClose(ws);
            // ws.close();
        }
     });
});