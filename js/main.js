// My personal purple
let colours = {
    black: 0x000000,
    purple: 0x740574
}

// The map class the inherits from the PIXI.Graphics class
class Map extends PIXI.Graphics {
    constructor(limit) {
        super();
        this.limit = limit;
        this.x = 0;
        this.y = 0;
        this.draw();
    }

    draw() {
        for (let x = 0; x < this.limit; x++) {
            for (let y = 0; y < this.limit; y++) {
                let squareSize = 48;
                let startPointX = x * squareSize;
                let startPointY = y * squareSize;
                this.moveTo(startPointX - 1, startPointY)
                    .lineStyle(1, colours.black)
                    .lineTo(startPointX + squareSize, startPointY)
                    .lineTo(startPointX + squareSize, startPointY + squareSize)
                    .lineTo(startPointX, startPointY + squareSize)
                    .lineTo(startPointX, startPointY);
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
    map: new Map(10),
    positionStage () {
        // Sets the stage in the center of the screen instead of top left, this works better in my head when doing coordinates.
        this.pixi.stage.x = window.innerWidth / 2;
        this.pixi.stage.y = window.innerHeight / 2;
        this.map.x = -this.map.width / 2;
        this.map.y = -this.map.height / 2;
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
        this.pixi.stage.addChild(this.map);
    }
}

game.init();