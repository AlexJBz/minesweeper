let settings = {
    gridSize: 9,
    bombCount: 10,
    squareSize: 32
}

// My personal purple
let colours = {
    black: 0x000000,
    gray: 0x999999,
    lightgray: 0xDDDDDD,
    purple: 0x740574,
    red: 0XFC0303,
    green: 0x167D32
}

// The map class the inherits from the PIXI.Graphics class
class Map extends PIXI.Graphics {
    constructor (limit) {
        super();
        this.limit = limit;
        this.x = 0;
        this.y = 0;
        this.draw();
        this.setBombs();
    }

    setBombs () {
        let chosenTiles = [];
        // We have to temporarily remove the tile from the children array to make sure we dont choose the same tile twice
        // Doing it this way round stops from iterating again and again if it keeps picking tiles that are already chosen
        for (let i = 0; i < settings.bombCount; i++) {
            let randomIndex = Math.floor(Math.random() * this.children.length);
            this.children[randomIndex].bomb = true;
            chosenTiles.push(this.children.splice(randomIndex, 1)[0]);
        }
        // Now we just put them back as if nothing ever happened now that they're happy little bombs!
        chosenTiles.forEach(tile => {
            this.children.push(tile);
        });
    }

    draw () {
        for (let x = 0; x < this.limit; x++) {
            for (let y = 0; y < this.limit; y++) {   
                let startPointX = x * settings.squareSize;
                let startPointY = y * settings.squareSize;
                this.addChild(new Tile(startPointX, startPointY));
            }
        }
    }
}

class Tile extends PIXI.Graphics {
    constructor (posX, posY) {
        super();
        this.interactive = true;
        this.x = posX;
        this.y = posY;
        this.idX = posX / settings.squareSize;
        this.idY = posY / settings.squareSize;
        this.playState = 0; // 0 = Unclicked, 1 = cleared, 2 = Flagged
        this.bomb = false;
        this.draw(colours.gray);
        this.click = () => { game.click(this); }
    }

    draw (colour) {
        // Renders the tile
        this.moveTo(-1, 0)
            .beginFill(colour)
            .lineStyle(1, colours.black)
            .lineTo(0 + settings.squareSize, 0)
            .lineTo(settings.squareSize, settings.squareSize)
            .lineTo(0, settings.squareSize)
            .lineTo(0, 0);
    }

    countNearbyBombs () {
        let bombCount = 0;
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                let tile = game.getTileByPosition(this.idX + x, this.idY + y);
                if (tile && tile != this) {
                    if (tile.bomb == true) {
                        bombCount++;
                    }
                }
            }
        }
        return bombCount;
    }

    flag () {
        if (this.playState == 2) {
            this.playState = 0;
            this.children.shift();
        } else {
            this.playState = 2;
            let flag = new PIXI.Text('F', { 
                fontFamily: 'sans-serif', 
                fontSize: settings.squareSize - 10, 
                fill: colours.red 
            });
            flag.anchor.set(0.5);
            flag.x = settings.squareSize / 2;
            flag.y = settings.squareSize / 2;
            this.addChild(flag);
        }
    }

    blowUp (win) {
        this.clear();
        if (!win) {
            this.draw(colours.red);
        } else {
            this.draw(colours.green);
        }
    }

    tileClear () {
        if (this.playState == 0) {
            if (!this.bomb) {
                game.clearedTotal++;
                this.playState = 1;
                this.clear();
                this.draw(colours.lightgray);
                let bombs = this.countNearbyBombs();
                if (bombs > 0) {
                    let bombText = new PIXI.Text(bombs, { 
                        fontFamily: 'sans-serif', 
                        fontSize:settings.squareSize - 10, 
                        fill: 0x000000 
                    });
                    this.addChild(bombText);
                    bombText.anchor.set(0.5);
                    bombText.x = settings.squareSize / 2;
                    bombText.y = settings.squareSize / 2;
                } else {
                    try {
                        game.getTileByPosition(this.idX - 1, this.idY).tileClear();
                    } catch {}
                        for (let y = -1; y <= 1; y++) {
                            for (let x = -1; x <= 1; x++) {
                                let tile = game.getTileByPosition(this.idX + x, this.idY + y);
                                if (tile && tile != this) {
                                    tile.tileClear();
                                }
                            }
                        }
                }
            } else {
                game.end();
            }
        }
    }

}

// The game object
let game = {
    pixi: new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: colours.purple,
        resolution: 1   
    }),
    clearedTotal: 0,
    playEnabled: true,
    map: new Map(settings.gridSize),
    getTileByPosition (x, y) {
        let correctTile = false;
        this.map.children.forEach((tile) => {
            if (tile.idX == x && tile.idY == y) {
                correctTile = tile;
                return;
            }
        });
        return correctTile;
    },
    positionStage () {
        // Sets the stage in the center of the screen instead of top left, this works better in my head when doing coordinates.
        this.pixi.stage.x = window.innerWidth / 2;
        this.pixi.stage.y = window.innerHeight / 2;
        this.map.x = -this.map.width / 2;
        this.map.y = -this.map.height / 2;
    },
    rightClick (pos) {
        // Got to have a fancy rightclick function because its not properly supported
        let xTileID = Math.floor(((pos.x - (window.innerWidth / 2)) / settings.squareSize) + settings.gridSize / 2);
        let yTileID = Math.floor(((pos.y - (window.innerHeight / 2)) / settings.squareSize) + settings.gridSize / 2);
        if (xTileID < settings.gridSize && yTileID < settings.gridSize) {
            if (xTileID >= 0 && yTileID >= 0) {
                this.click(this.getTileByPosition(xTileID, yTileID), true);
            }
        }
    },
    click (tile, right = false) {
        if (this.playEnabled) {
            console.log('Tile clicked:', tile.idX, tile.idY);
            if (!right) {
                tile.tileClear();
            } else {
                // Toggle the flag on whatever tile providing that it is not already cleared
                if (tile.playState != 1) {
                    tile.flag();
                }
            }
        }
        if (this.clearedTotal == ((settings.gridSize * settings.gridSize) - settings.bombCount)) {
            this.end(true);
        }
    },
    end (win = false) {
        this.playEnabled = false;
        this.map.children.forEach(tile => {
            if (tile.bomb) {
                tile.blowUp(win);
            }
        });
    },
    init () {
        // Adds the canvas to the body
        document.body.appendChild(this.pixi.renderer.view);
        this.positionStage();
        // Adds an event listener that automatically resizes the renderer if the screen size were to change
        window.addEventListener('resize', () => {
            this.pixi.renderer.resize(window.innerWidth, window.innerHeight);
            this.positionStage();
        });
        disableContextMenu(this.pixi.renderer.view);
        this.pixi.stage.addChild(this.map);
    }
}

game.init();

// Disable context menu
function disableContextMenu (canvas) {
    canvas.addEventListener('contextmenu', (e) => {
        game.rightClick({ x: e.x, y: e.y });
        e.preventDefault();
    });
}