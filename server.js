import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { WebSocketServer } from 'ws';

const fs = require('fs');

// async function getTxt(url) {
//     const response = await fetch(url);
//     return await response.text().then(result => { return result.split(/\r\n|\n/) });
//     // const words = openedText.split(/\r\n|\n/);
//     // return words;
// }

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

// const words = await getTxt('https://raw.githubusercontent.com/Seedname/anagrams/main/words/all.txt');
// const usable = await getTxt('https://raw.githubusercontent.com/Seedname/anagrams/main/words/usable.txt');
const words = getTxt('./words/all.txt');
const usable =  getTxt('./words/usable.txt');

var roundWords = new Array(4);
var answerArrays = new Array(4);

function startRound() {
    for(let i = 0; i < roundWords.length; i++) {
        roundWords[i] = scramble(usable[~~(Math.random()* usable.length)]);
        answerArrays[i] = allAnagrams(roundWords[i]);
    }
}

startRound();

const wss = new WebSocketServer({ port: 9091 });
const clients = [];

function getPoints() {
    let points = [];
    for(let i = 0; i < clients.length; i++) {
        points.push(clients[i].score);
    }
    return points;
}

function getNames() {
    let names = [];
    for(let i = 0; i < clients.length; i++) {
        names.push(clients[i].name);
    }
    return names;
}

function getRockets() {
    let rockets = [];
    for(let i = 0; i < clients.length; i++) {
        rockets.push(clients[i].rocket);
    }
    return rockets;
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

function updateLb(ws) {
    const namesReturn = { type : "updateNames", data : JSON.stringify(getNames()) };
    const pointsReturn = { type: 'updatePoints', data: JSON.stringify(getPoints()) };
    
    ws.send(JSON.stringify(namesReturn));
    ws.send(JSON.stringify(pointsReturn));
}

wss.on('connection', (ws) => {
    ws.score = 0;
    ws.name = "";
    ws.rocket = ~~(Math.random()*3);
    ws.used = [];
    ws.currentWord = 0;
    
    clients.push(ws);

    ws.on('message', (message) => {
        const packet = JSON.parse(message);

        switch (packet.type) {
            case 'name':
                let nameUsed = false;
                for(let i = 0; i < clients.length; i++) {
                    if(clients[i].name == packet.data) {
                        nameUsed = true;
                    }
                }

                if(nameUsed) {
                    const messagePacket = { type : 'message', data: 1 };
                    ws.send(JSON.stringify(messagePacket));
                } else {
                    ws.name = packet.data;

                    for (let i = 0; i < clients.length; i++) {
                        if(clients[i] == ws) {
                            const namePacketReturn = { type: 'message', data: 0 };
                            clients[i].send(JSON.stringify(namePacketReturn));
                        } 

                            updateLb(clients[i]);
                            const rocketsReturn = { type: 'updateRockets', data: JSON.stringify(getRockets()) };
                            for(let j = 0; j < clients.length; j++) {
                                clients[j].send(JSON.stringify(rocketsReturn));
                            }
                        
                        
                    }
                }
                break;
            case 'getWords':
                const wordsForRound = { type: 'updateWords', data: JSON.stringify(roundWords) };
                ws.send(JSON.stringify(wordsForRound));

            // case 'playerWord':
            //     ws.score = packet.data;

            //     const pointReturn = { type: 'update', data: JSON.stringify(getPoints()) };
            //     for(let i = 0; i < clients.length; i++) {
            //         clients[i].send(JSON.stringify(pointReturn));
            //     }
            //     break;
            case 'retrieve':
                updateLb(ws);
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
                    for (let i = 0; i < answerArrays[ws.currentWord].length; i++) {
                        if (packet.data == answerArrays[ws.currentWord][i]) {
                            valid = true;
                            
                            if(ws.currentWord > 0) {
                                const points = packet.data.length * 100;
                                ws.score += points;

                                

                                for(let i = 0; i < clients.length; i++) {
                                    updateLb(clients[i]);
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
        }
    });

  ws.on('close', () => {
    if (clients.length > 0) {
        for(let i = 0; i < clients.length; i++) {
            if (clients[i] == ws) {
                const rmRocket = { type: 'delRocket', data: ws.name };
                

                // if(clients.length > 0) {
                    for (let j = 0; j < clients.length; j++) {
                        if(i != j) {
                            clients[j].send(JSON.stringify(rmRocket));
                        }
                        
                    }
                    clients.splice(i, 1);
                    const rocketsReturn = { type: 'updateRockets', data: JSON.stringify(getRockets()) };
                    for (let j = 0; j < clients.length; j++) {
                        updateLb(clients[j]);
                        clients[j].send(JSON.stringify(rocketsReturn));
                    }
                // }
                break;
            }
        }
    }
  });
});

//read from file a list of words, save it in a list and and shuffle it (twice for good measure)

// for(var j = 0; j < words.length; j++) {
//     if (words[j].length === 6) {
//         potential.push(words[j]);
//     }
// }

// function processData(word) {
//     if(answers != null){
//         var pointsOut = 0
//         for(let k = 0; k < answers.length; k++) {
//             if (word == answers[k]) {
//                 pointsOut = word.length * 100;
//             }
//         }
//     }
//     return pointsOut;
// }
