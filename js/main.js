let game = {
    pixi: new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: 1   
    }),
    init () {
        // Adds the canvas to the body
        document.body.appendChild(this.pixi.renderer.view);
        // Adds an event listener that automatically resizes the renderer if the screen size were to change
        window.addEventListener('resize', () => {
            this.pixi.renderer.resize(window.innerWidth, window.innerHeight);
        });
    }
}

game.init();