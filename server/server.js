const io = require('socket.io')({
    cors: {
        origin: "https://snake-royale.netlify.app",
        methods: ["GET", "POST"]
    }
});

const { initGameState, gameLoop, getUpdatedVelocity } = require('./game.js')
const { makeId } = require('./utils.js');
const { FPS } = require('./constants.js')

const state = {};
const clientRooms = {};

io.on('connection', client => {
    client.on('keydown', handleKeyDown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(gameCode){
        const room = io.sockets.adapter.rooms.get(gameCode);

        let numClients;
        if(!room){
            numClients = 0;
        }else{
            numClients = room.size;
        }

        if(numClients === 0){
            client.emit('unknownGame');
            return;
        }else if(numClients > 1){
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = gameCode;
        
        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(gameCode);
    }

    function handleNewGame(){
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGameState();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    function handleKeyDown(keyCode){
        const roomName = clientRooms[client.id];
        
        if(!roomName){
            return;
        }

        try{
            keyCode = parseInt(keyCode);
        }catch(e){
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if(vel){
            if(state[roomName]){
                state[roomName].players[client.number-1].vel = vel;
            }
        }
    }
});

function startGameInterval(roomName){
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if(!winner){
            emitGameState(roomName, state[roomName]);
        }else{
            emitGameOver(roomName, winner); 
            state[roomName] = null;
            clearInterval(intervalId);
        }

    }, 1000/FPS)
}

function emitGameState(roomName, state){
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner){
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
