// My personal purple
let purple = 0x740574;

// The map class the inherits from the PIXI.Graphics class
class Map extends PIXI.Graphics {
    constructor() {
        super();

    }
}

// The game object
let game = {
    pixi: new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: purple,
        resolution: 1   
    }),
    positionStage () {
        // Sets the stage in the center of the screen instead of top left, this works better in my head when doing coordinates.
        this.pixi.stage.x = window.innerWidth / 2;
        this.pixi.stage.y = window.innerHeight / 2;
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
        let square = new PIXI.Graphics();
        square.beginFill(0x000000).drawRect(-50, -50, 100, 100).endFill();
        this.pixi.stage.addChild(square);
    }
}

game.init();