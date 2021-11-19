const { GRID_SIZE } = require('./constants');

module.exports = {
    initGameState,
    gameLoop,
    getUpdatedVelocity,
}

function initGameState(){
    const state = createGameState();
    randomFood(state);

    return state;
}

function createGameState(){
    return {
        players: [
            {
                pos: {
                    x: 3,
                    y: 10,
                },
                vel: {
                    x: 1,
                    y: 0,
                },
                snake: [
                    {x: 1, y: 10},
                    {x: 2, y: 10},
                    {x: 3, y: 10},
                ],
            },
            {
                pos: {
                    x: 10,
                    y: 3,
                },
                vel: {
                    x: 1,
                    y: 0,
                },
                snake: [
                    {x: 10, y: 5},
                    {x: 10, y: 4},
                    {x: 10, y: 3},
                ],
            },
        ],
        food: {},
        gridsize: GRID_SIZE,
    };
}

function gameLoop(state){
    if(!state){
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    walk(playerOne.pos, playerOne.vel);
    walk(playerTwo.pos, playerTwo.vel);

    if(playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE){
        return 2;
    }

    if(playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE){
        return 1;
    }

    if(state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y){
        playerOne.snake.push({ ...playerOne.pos });
        walk(playerOne.pos, playerOne.vel);
        randomFood(state);
    }

    if(state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y){
        playerTwo.snake.push({ ...playerTwo.pos });
        walk(playerTwo.pos, playerTwo.vel);
        randomFood(state);
    }
    
    if(playerOne.vel.x || playerOne.vel.y){
        for(let segment of playerOne.snake){
            if(segment.x === playerOne.pos.x && segment.y === playerOne.pos.y){
                return 2;
            }
        }

        for(let segment of playerTwo.snake){
            if(segment.x === playerOne.pos.x && segment.y === playerOne.pos.y){
                return 2;
            }
        }
    }

    if(playerTwo.vel.x || playerTwo.vel.y){
        for(let segment of playerOne.snake){
            if(segment.x === playerTwo.pos.x && segment.y === playerTwo.pos.y){
                return 1;
            }
        }

        for(let segment of playerTwo.snake){
            if(segment.x === playerTwo.pos.x && segment.y === playerTwo.pos.y){
                return 1;
            }
        }
    }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
}

function walk(pos, vel){
    pos.x += vel.x;
    pos.y += vel.y;
}

function randomFood(state){
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    for(var i = 0; i < 2; i++){
        for(let segment of state.players[i].snake){
            if(segment.x === food.x && segment.y === food.y){
                return randomFood(state);
            }
        }
    }

    state.food = food;
}

function getUpdatedVelocity(keyCode){
    switch(keyCode){
        case 37: { // Left
            return { x: -1, y: 0 };
        }
        case 38: { // Down 
            return { x: 0, y: -1 };
        }
        case 39: { // Right 
            return { x: 1, y: 0 };
        }
        case 40: { // Up 
            return { x: 0, y: 1 };
        }
    }
}
