import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { WebSocketServer } from 'ws';

import fetch from "node-fetch";

const wss = new WebSocketServer({ port: 9091 });

const clients = [];

var response = await fetch('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt');
var openedText = await response.text(); // <-- changed
var words = openedText.split(/\r\n|\n/);

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

wss.on('connection', (ws) => {
    ws.score = 0;
    ws.name = "";
    ws.rocket = -1;
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
                const errorPacket = { type : 'error', data: 1 }
                ws.send(JSON.stringify(errorPacket));
            } else {
                ws.name = packet.data;
                const names = getNames();
                for (let i = 0; i < clients.length; i++) {
                    var namePacketReturn = {};

                    if(clients[i] == ws) {
                        namePacketReturn = { type: 'error', data: 0}
                    } else {
                        namePacketReturn = { type: 'response', data: JSON.stringify(names)}
                    }
                    clients[i].send(JSON.stringify(namePacketReturn));
                }
            }
            break;
        case 'playerWord':
            ws.score = packet.data;

            const pointReturn = { type: 'update', data: JSON.stringify(getPoints())}
            for(let i = 0; i < clients.length; i++) {
                clients[i].send(JSON.stringify(pointReturn));
            }
            break;
        
        case 'retrieve':
            const namesPacketResponse = { type : "response", data : JSON.stringify(getNames()) };
            const pointsReturn = { type: 'update', data: JSON.stringify(getPoints())}
            ws.send(JSON.stringify(namesPacketResponse));
            ws.send(JSON.stringify(pointsReturn));
            break;
        case 'checkWord':
            break;
    }

  });

  ws.on('close', () => {
    if (clients.length > 0) {
        for(let i = 0; i < clients.length; i++) {
            if (clients[i] == ws) {
                clients.splice(i, 1);

                const namePacketReturn = { type: 'response', data: JSON.stringify(getNames())}
                const pointsReturn = { type: 'update', data: JSON.stringify(getPoints())}
                for (let j = 0; j < clients.length; j++) {
                    clients[j].send(JSON.stringify(namePacketReturn));
                    clients[j].send(JSON.stringify(pointsReturn));
                }
                
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


// function allAnagrams(word) {
    
//     var anaWord = word;
    
//     var all = [];
//     for(var i = 0; i < words.length; i++) {

//         var currentWord = words[i];
//         anaWord = word;
        
//         if(currentWord.length <= anaWord.length) {
//             var isAnagram = true;
//             for(var k = 0; k < currentWord.length; k++) {
//                 var current = currentWord.substring(k, k+1);
//                 var indOf = anaWord.indexOf(current);
                
                
//                 if(indOf > -1) {
//                     anaWord = anaWord.split("");
//                     anaWord.splice(indOf, 1);
//                     anaWord = anaWord.join('');
//                 } else {
//                     isAnagram = false;
//                 }
//             }
                
//             if (isAnagram) {
//                 all.push(currentWord);
//             }
//         }
//     }
//     return all;
// }

// function firstWord() {
//     let rand = Math.floor(Math.random()*potential.length);
//     let w = potential[rand];
//     answers = allAnagrams(w);
//     // console.log(potential.length);
//     // console.log('w: ' + w);
//     // console.log('answers: ' + answers);
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

// firstWord();