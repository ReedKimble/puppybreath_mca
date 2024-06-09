
/**
 * Game processing
 **/
//% color="#C44FFF" weight=230 icon="\uf1b9" block="Engine"
//% groups='["Time","Access","Dictionary","Named Value"]'
namespace engine {

    //const _gameObjects: GameObject[] = []
    //const _destroyQueue: GameObject[] = []

    const _screens: Dictionary<string, GameScreen> = new Dictionary<string, GameScreen>()
    let _currentScreen: string
    let _timeLastUpdate: number
    let _lastFrameTime: number

    export function updateGameTime() {
        _lastFrameTime = game.runtime() - _timeLastUpdate
        _timeLastUpdate = game.runtime()
    }

    export function updateDestroyQueue() {
        if (_screens.contains(_currentScreen)) {
            const curScreen = _screens.getItem(_currentScreen)
            curScreen.updateDestroyQueue()
        }
        /*
        while (_destroyQueue.length > 0) {
            let _item = _destroyQueue.pop()
            _gameObjects.removeElement(_item)
            if (_item._sprite) {
                animation.stopAnimation(animation.AnimationTypes.All, _item._sprite)
                sprites.destroy(_item._sprite)
                _item._sprite = null;
            }
        }
        */
    }

    export function getCurrentScreen(): string {
        return _currentScreen
    }
    export function setCurrentScreen(name: string): void {
        if (_currentScreen != name) {
            if (_screens.contains(_currentScreen)) { _screens.getItem(_currentScreen).suspend() }
            _currentScreen = name
            _screens.getItem(_currentScreen).resume()
        }
    }
    export function updateCurrentScreen(): void {
        if (_screens.contains(_currentScreen)) {
            const curScreen = _screens.getItem(_currentScreen)
            if (curScreen._onGameUpdate) { curScreen._onGameUpdate() }
        }
    }

    export function addGameScreen(value: GameScreen): void {
        _screens.setItem(value._name, value)
        //if (_currentScreen.isEmpty()) { _currentScreen = value._name }
    }

    export function getGameScreen(name: string): GameScreen {
        if (_screens.contains(name)) { return _screens.getItem(name) }
        return null
    }

    export function addGameObject(value: GameObject): void {
        if (_screens.contains(_currentScreen)) {
            const curScreen = _screens.getItem(_currentScreen)
            curScreen._gameObjects.push(value)
        }
        
    }

    export function destroyGameObject(value: GameObject): void {
        if (_screens.contains(_currentScreen)) {
            const curScreen = _screens.getItem(_currentScreen)
            curScreen._destroyQueue.push(value)
        }
    }

    //% block="get all game objects"
    //% group="Access"
    export function getGameObjects(): GameObject[] { 
        if (_screens.contains(_currentScreen)) {
            const curScreen = _screens.getItem(_currentScreen)
            return curScreen._gameObjects
        }
        return []
    }

    //% block="get all game objects of $kind=spritekind"
    //% group="Access"
    export function _getGameObjects(kind: number): GameObject[] {
        if (_screens.contains(_currentScreen)) {
            const curScreen = _screens.getItem(_currentScreen)
            return curScreen._gameObjects.filter((value: GameObject) => {
                return (value._blueprint.getKind() == kind)
            })
        }
        return []
    }

    //% draggableParameters
    //% block="for each $other overlapping $target=variables_get(myGameObject) of $kind=spritekind do actions"
    //% group="Access"
    //% handlerStatement
    export function getOverlappingKind(target: GameObject, kind: number, action: (other: GameObject) => {}): void {
        if (_screens.contains(_currentScreen)) {
            const result: GameObject[] = []
            const curScreen = _screens.getItem(_currentScreen)
            curScreen._gameObjects.forEach((g: GameObject) => {
                if (target._sprite.overlapsWith(g._sprite)) {
                    action(g)
                }
            })
            //return result
        }
        //return []
    }

    //% block="destroy all game objects"
    //% group="Access"
    export function destroyAllGameObjects(): void {
        if (_screens.contains(_currentScreen)) {
            const curScreen = _screens.getItem(_currentScreen)
            curScreen._gameObjects.forEach((item: GameObject) => { curScreen._destroyQueue.push(item) })
        }
        
    }

    //% block="frame time"
    //% group="Time"
    export function frameTime(): number {
        return _lastFrameTime
    }

    //% block="facing $value"
    //% group="Named Value"
    export function getFacing(value: FacingDirection): FacingDirection { return value }

    //% block="create new dictionary"
    //% group="Dictonary"
    export function createDictionary(): Dictionary<string, any> {
        return new Dictionary<string, any>()
    }

    //% block="$dict contains key $key"
    //% group="Dictonary"
    export function dictionaryContains(dict: Dictionary<string, any>, key: string): boolean {
        return dict.contains(key)
    }

    //% block="get value from $dict with key $key"
    //% group="Dictonary"
    export function dictionaryItem(dict: Dictionary<string, any>, key: string): any {
        if (dict.contains(key)) { return dict.getItem(key) }
        return null
    }

    //% block="set key $key in $dict to $value"
    //% group="Dictonary"
    export function setDictionaryItem(dict: Dictionary<string, any>, key: string, value: any): void {
        dict.setItem(key, value)
    }

    //% block="change key $key in $dict by $value"
    //% group="Dictonary"
    export function changeDictionaryItem(dict: Dictionary<string, any>, key: string, value: any): void {
        if (dict.contains(key))
        {
            const d = dict.getItem(key)
            value += d
        }
        dict.setItem(key, value)
    }
/*
    //% shim=ENUM_GET
    //% blockId=actionName_enum_shim
    //% block="$arg" group="Named Value"
    //% enumName="ActionName"
    //% enumMemberName="action"
    //% enumPromptHint="e.g. Walk, Attack, ..."
    //% enumInitialMembers="None, Walk, Run, Attack, Damage, Death"
    export function _actionNameEnumShim(arg: number) {
        return arg;
    }

    //% shim=ENUM_GET
    //% blockId=dataName_enum_shim
    //% block="$arg" group="Named Value"
    //% enumName="DataName"
    //% enumMemberName="data"
    //% enumPromptHint="e.g. Life, Damage, ..."
    //% enumInitialMembers="Life, Damage, Score, Speed, AnimateRate, DamageCooldown, AttackCooldown, AttackDuration"
    export function _dataNameEnumShim(arg: number) {
        return arg;
    }
*/

    /**
     * Gets the "kind" of action
     */
    //% shim=KIND_GET
    //% blockId=actionkind block="action $kind"
    //% kindNamespace=ActionKind kindMemberName=kind kindPromptHint="e.g. None, Walk, Attack..."
    export function _actionKind(kind: number): number {
        return kind;
    }

    /**
         * Gets the "kind" of data
         */
    //% shim=KIND_GET
    //% blockId=datakind block="stat $kind"
    //% kindNamespace=DataKind kindMemberName=kind kindPromptHint="e.g. Life, Speed, Damage..."
    export function _dataKind(kind: number): number {
        return kind;
    }
}

game.onUpdate(() => {
    
    engine.updateGameTime()
    engine.updateCurrentScreen()
    gameObjects.doUpdate()
    engine.updateDestroyQueue()
    controller._controllerState.update()
})

/*
enum InitialActionName {
    None, Walk, Run, Attack, Damage, Death
}

enum InitialDataName {
    Life, Damage, Score, Speed, AnimateRate, DamageCooldown, AttackCooldown, AttackDuration
}
*/

namespace ActionKind {
    let nextKind: number;

    export function create() {
        if (nextKind === undefined) nextKind = 1000;
        return nextKind++;
    }

    //% isKind
    export const None = create();
    //% isKind
    export const Walk = create();
    //% isKind
    export const Run = create();
    //% isKind
    export const Attack = create();
    //% isKind
    export const Damage = create();
    //% isKind
    export const Death = create();
}

namespace DataKind {
    let nextKind: number;

    export function create() {
        if (nextKind === undefined) nextKind = 1000;
        return nextKind++;
    }

    //% isKind
    export const Life = create();
    //% isKind
    export const Damage = create();
    //% isKind
    export const Score = create();
    //% isKind
    export const Speed = create();
    //% isKind
    export const AnimateRate = create();
    //% isKind
    export const DamageCooldown = create();
    //% isKind
    export const AttackCooldown = create();
    //% isKind
    export const AttackDuration = create();
}

