// ledgibility
// combos
// ending
// progress bar (altitude level)
// audio countdown
// fix copyright issues
// fix audio stuff
// 

let loc = window.location.href;
loc = loc.substring(loc.indexOf("//")+2);
loc = loc.substring(0, loc.indexOf("/"));
// const socket = new WebSocket('wss://'+loc+':443'); 
const socket = new WebSocket('ws://'+loc+':80'); 
socket.onopen = (event) => {
    const loaded = JSON.stringify( {type:'sendRooms', data:null} );
    socket.send(loaded);
};

socket.onmessage = (event) => {
    const packet = JSON.parse(event.data);

    switch (packet.type) {
        case 'changeRoom':
            location.href = window.location.href + packet.data;
            break;
        case 'publicRooms':
            const data = JSON.parse(packet.data);
            const names = data[0];
            const codes = data[1];
            const count = data[2];

            const selector = document.querySelector("body > div > div > div > div.listContainer > div");
            for (let i = 0; i < names.length; i++) {
                const entry = document.createElement("a");
                entry.className = "entry";
                entry.href = "/" + String(codes[i]);
                const c = [~~(Math.random()*255), ~~(Math.random()*255), ~~(Math.random()*255)]
                const sum = c[0] + c[1] + c[2];
                entry.style.background = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ",255)";

                const info = document.createElement("div");
                info.className = "info";

                const title = document.createElement("div");
                title.className = "title";

                const text = document.createElement("span");
                text.className = "text";
                text.textContent = String(names[i]) + "'s room";

                const roomCode = document.createElement("span");
                roomCode.className = "roomCode";
                roomCode.textContent = String(codes[i]);

                const playing = document.createElement("div");
                playing.className = "playing";
                playing.textContent = String(count[i]) + " playing";

                if(sum < 255*1.5) {
                    text.style.color = "#eee";
                    roomCode.style.color = "#eee";
                    playing.style.color = "#eee";
                }

                title.appendChild(text);
                title.appendChild(roomCode);

                info.appendChild(title);
                info.appendChild(playing);

                entry.appendChild(info);

                selector.appendChild(entry);
            }

            let text = "No";
            if(names.length > 0) {
                text = names.length;
            }

            document.querySelector("body > div > div > div > div.header > header").textContent = text + " available rooms";
    };
};

function createRoom() {
    const roomPacket = { type: 'createRoom', message: null };
    socket.send(JSON.stringify(roomPacket));
}
