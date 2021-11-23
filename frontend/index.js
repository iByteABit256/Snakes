const BG_COLOUR = "#231f20"
const FOOD_COLOUR = "#ea3535"
const SNAKE_COLOURS = {};

const socket = io('http://peaceful-hamlet-35803.herokuapp.com/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameButton = document.getElementById('newGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);


function newGame(){
    socket.emit('newGame');
    init();
}

function joinGame(){
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init(){
    for(var i = 0; i < 2; i++){
        SNAKE_COLOURS[i] = rainbow(20, i);
        console.log(SNAKE_COLOURS[i]);
    }

    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    const dim = 800;
    canvas.width = dim;
    canvas.height = dim;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);

    gameActive = true;
}

function keydown(e){
    socket.emit('keydown', e.keyCode);
}

function drawGame(state){
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    for(var i = 0; i < 2; i++){
        drawPlayer(state.players[i], size, SNAKE_COLOURS[i]);
    }
}

function drawPlayer(player, size, snakeColour){
    ctx.fillStyle = snakeColour;
    for(let segment of player.snake){
        ctx.fillRect(segment.x * size, segment.y * size, size, size);
    }
}

function handleInit(number){
    playerNumber = number;
}

function handleGameState(state){
    if(!gameActive) return;

    state = JSON.parse(state);
    requestAnimationFrame(() => drawGame(state));
}

function handleGameOver(data){
    if(!gameActive) return;

    data = JSON.parse(data); 

    if(data.winner === playerNumber){
        alert("You win!");
    }else if(data.winner === -1){
        alert("Tie!");
    }else{
        alert("You lose!");
    }
    gameActive = false;
}

function handleGameCode(gamecode){
    gameCodeDisplay.innerText = gamecode;
}

function handleUnknownGame(){
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers(){
    reset();
    alert("Game is already in progress");
}

function reset(){
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

/**
 * @param numOfSteps: Total number steps to get color, means total colors
 * @param step: The step number, means the order of the color
 */
 function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 4);
    var f = h * 4 - i;
    var q = 1 - f;
    switch(i % 4){
        case 0: r = q; g = 1; b = 0; break;
        case 1: r = 0; g = 1; b = f; break;
        case 2: r = 0; g = q; b = 1; break;
        case 3: r = f; g = 0; b = 1; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}
