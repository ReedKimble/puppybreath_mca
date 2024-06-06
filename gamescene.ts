//% blockNamespace="gameScreen"
class GameScreen {
    static emptyMap: tiles.TileMapData = tilemap`empty`

    _gameObjects: GameObject[] = []
    _destroyQueue: GameObject[] = []
    _initialized: boolean
    _name: string
    _backgroundImage: Image
    _backgroundMusic: music.Playable
    _musicVolume: number
    _tilemap: tiles.TileMapData
    _isSuspended: boolean
    _suspendedSprites: Dictionary<GameObject, SpriteState> = new Dictionary<GameObject, SpriteState>()
    _backgroundSprite: Sprite
    _spriteKind: number = SpriteKind.create()
    _onLoad: () => void
    _onShow: () => void
    _onSuspend: () => void
    _onGameUpdate: () => void
    
    constructor(name: string) {
        this._initialized = false
        this._name = name
        this._isSuspended = false
        this._musicVolume = 128
    }

    addGameObject(value: GameObject): void {
        this._gameObjects.push(value)
    }

    destroyGameObject(value: GameObject): void {
        this._destroyQueue.push(value)
    }

    //% block="get %gamescreen(myScreen) all game objects"
    //% group="Access"
    gameObjects(): GameObject[] { return this._gameObjects }

    //% block="get %gamescreen(myScreen) all game objects of $kind=spritekind"
    //% group="Access"
    gameObjectsOf(kind: number): GameObject[] {
        return this._gameObjects.filter((value: GameObject) => {
            return (value._blueprint.getKind() == kind)
        })
    }

    //% block="%gamescreen(myScreen) destroy all game objects"
    //% group="Runtime"
    destroyAllGameObjects(): void {
        this._gameObjects.forEach((item: GameObject) => { this._destroyQueue.push(item) })
    }

    //% block="get %gamescreen(myScreen) name"
    //% group="Modify"
    getName(): string { return this._name }

    //% block="get %gamescreen(myScreen) background image"
    //% group="Modify"
    getBackgroundImage(): Image { return this._backgroundImage }
    //% block="set %gamescreen(myScreen) background image to $value"
    //% value.shadow=screen_image_picker
    //% group="Modify"
    setBackgroundImage(value: Image): void { this._backgroundImage = value }

    //% block="get %gamescreen(myScreen) background music"
    //% group="Modify"
    getBackgroundMuisc(): music.Playable { return this._backgroundMusic }
    //% block="set %gamescreen(myScreen) background music to $value"
    //% value.shadow=music_song_field_editor
    //% group="Modify"
    setBackgroundMusic(value: music.Playable): void { this._backgroundMusic = value }

    //% block="get %gamescreen(myScreen) background music volume"
    //% group="Modify"
    getMusicVolume(): number { return this._musicVolume }
    //% block="set %gamescreen(myScreen) background music volume to $value"
    //% group="Modify"
    setMusicVolume(value: number): void { this._musicVolume = value }

    //% block="get %gamescreen(myScreen) tilemap"
    //% group="Modify"
    getTileMap(): tiles.TileMapData { return this._tilemap }
    //% block="set %gamescreen(myScreen) tilemap to $value=tiles_tilemap_editor"
    //% value.shadow=tiles_tilemap_editor
    //% group="Modify"
    setTileMap(value: tiles.TileMapData): void { this._tilemap = value }

    updateDestroyQueue() {
        while (this._destroyQueue.length > 0) {
            let _item = this._destroyQueue.pop()
            this._gameObjects.removeElement(_item)
            if (_item._sprite) {
                animation.stopAnimation(animation.AnimationTypes.All, _item._sprite)
                sprites.destroy(_item._sprite)
                _item._sprite = null;
            }
        }
    }

    playBackground(): void {
        if (this._backgroundMusic) {
            const v = music.volume()
            music.setVolume(this._musicVolume)
            this._backgroundMusic.play(music.PlaybackMode.LoopingInBackground)
            music.setVolume(v)
        }
    }

    suspend(): void {
        if (!this._isSuspended) {
            if (this._onSuspend) { this._onSuspend() } 
            if (this._backgroundMusic) { music.stopAllSounds() }
            if (this._tilemap) { tiles.setCurrentTilemap(GameScreen.emptyMap) }
            if (this._backgroundImage) { sprites.destroy(this._backgroundSprite) }
            this.updateDestroyQueue()
            this._gameObjects.forEach((item: GameObject) => {
                this._suspendedSprites.setItem(item, new SpriteState(item._sprite))
                item._sprite.destroy()
            })
            this._isSuspended = true
        }
    }

    resume(): void {       
        if (this._backgroundImage) {
            this._backgroundSprite = sprites.create(this._backgroundImage, this._spriteKind)
            this._backgroundSprite.z = -1
        }
        if (this._tilemap) { tiles.setCurrentTilemap(this._tilemap) }
        if (!this._initialized) {
            if (this._onLoad) { this._onLoad() }
            this._initialized = true
        }
        if (this._isSuspended) {
            this._gameObjects.forEach((item: GameObject) => {
                let sd = this._suspendedSprites.getItem(item)
                item._sprite = sprites.create(sd.image(), item._blueprint.getKind())
                sd.restore(item._sprite)
            })
            this._suspendedSprites.clear()
            this._isSuspended = false
        }
        if (!this._initialized) {
            if (this._onLoad) { 
                this._onLoad() 
            }
            this._initialized = true
        }
        this.playBackground()
        
        if (this._onShow) { this._onShow() }
    }
}

/**
 * Manage game screens
 **/
//% color="#0BBC4C" weight=210 icon="\uf108" block="GameScreens"
//% groups='["Access","Modify","Runtime"]'
namespace gameScreen {

    //% block="create new screen named $name"
    //% group="Access"
    export function createScreen(name: string): GameScreen {
        let result = new GameScreen(name)
        engine.addGameScreen(result)
        return result
    }

    //% block="get screen named $name"
    //% group="Access"
    export function getScreen(name: string): GameScreen {
        return engine.getGameScreen(name)
    }

    //% block="add screen $value=variables_get(myScreen)"
    //% group="Access"
    export function addScreen(value: GameScreen): void {
        engine.addGameScreen(value)
    }

    //% block="set current screen to $name"
    //% group="Runtime"
    export function setCurrentScreen(name: string): void {
        engine.setCurrentScreen(name)
    }

    //% block="get current screen name"
    //% group="Runtime"
    export function getCurrentScreen(): string {
        return engine.getCurrentScreen()
    }

    //% block="current screen is $name"
    //% group="Runtime"
    export function currentScreenIs(name: string): boolean {
        return (name == engine.getCurrentScreen())
    }

    //% block="pause screen named $name"
    //% group="Runtime"
    //% hidden
    export function pauseScreen(name: string): void {
        engine.getGameScreen(name).suspend()
    }

    //% block="resume screen named $name"
    //% group="Runtime"
    //% hidden
    export function resumeScreen(name: string): void {
        engine.getGameScreen(name).resume()
    }

     //% block="on $_screen=variables_get(myScreen) load" group="Modify"
    //% handlerStatement
    export function onLoad(_screen: GameScreen, value: () => void): void {
        _screen._onLoad = value
    }

    //% block="on $_screen=variables_get(myScreen) show" group="Modify"
    //% handlerStatement
    export function onShow(_screen: GameScreen, value: () => void): void {
        _screen._onShow = value
    }

    //% block="on $_screen=variables_get(myScreen) suspend" group="Modify"
    //% handlerStatement
    export function onSuspend(_screen: GameScreen, value: () => void): void {
        _screen._onSuspend = value
    }

    //% block="on $_screen=variables_get(myScreen) game update" group="Modify"
    //% handlerStatement
    export function onGameUpdate(_screen: GameScreen, value: () => void): void {
        _screen._onGameUpdate = value
    }
}

class SpriteState {
    _data: Dictionary<string, any> = new Dictionary<string, any>()
    constructor(target: Sprite) {
        this._data.setItem("x", target.x)
        this._data.setItem("vx", target.vx)
        this._data.setItem("y", target.y)
        this._data.setItem("vy", target.vy)
        this._data.setItem("ax", target.ax)
        this._data.setItem("fx", target.fx)
        this._data.setItem("ay", target.ay)
        this._data.setItem("fy", target.fy)
        this._data.setItem("sx", target.sx)
        this._data.setItem("sy", target.sy)
        this._data.setItem("scale", target.scale)
        this._data.setItem("lifespan", target.lifespan)
        this._data.setItem("width", target.width)
        this._data.setItem("height", target.height)
        this._data.setItem("left", target.left)
        this._data.setItem("right", target.right)
        this._data.setItem("top", target.top)
        this._data.setItem("bottom", target.bottom)
        this._data.setItem("z", target.z)
        this._data.setItem("image", target.image)
        this._data.setItem("layer", target.layer)
        this._data.setItem("flags", target.flags)
        this._data.setItem("id", target.id)
    }

    image(): Image { return this._data.getItem("image") }

    restore(target: Sprite): void {
        target.x = this._data.getItem("x")
        target.y = this._data.getItem("y")
        target.vx = this._data.getItem("vx")
        target.vy = this._data.getItem("vy")
        target.ax = this._data.getItem("ax")
        target.ay = this._data.getItem("ay")
        target.fx = this._data.getItem("fx")
        target.fy = this._data.getItem("fy")
        target.sx = this._data.getItem("sx")
        target.sy = this._data.getItem("sy")
        target.scale = this._data.getItem("scale")
        target.lifespan = this._data.getItem("lifespan")
        target.left = this._data.getItem("left")
        target.right = this._data.getItem("right")
        target.top = this._data.getItem("top")
        target.bottom = this._data.getItem("bottom")
        target.z = this._data.getItem("z")
        target.layer = this._data.getItem("layer")
        target.flags = this._data.getItem("flags")
        target.id = this._data.getItem("id")
    }
}
