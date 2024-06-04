
/**
 * Game processing
 **/
//% color="#C44FFF" weight=200 icon="\uf1b9" block="Engine"
//% groups='["Time","Action Name","Data Name"]'
namespace engine {

    const _gameObjects: GameObject[] = []
    const _destroyQueue: GameObject[] = []

    let _timeLastUpdate: number
    let _lastFrameTime: number

    export function updateGameTime() {
        _lastFrameTime = game.runtime() - _timeLastUpdate
        _timeLastUpdate = game.runtime()
    }

    export function updateDestroyQueue() {
        while (_destroyQueue.length > 0) {
            let _item = _destroyQueue.pop()
            _gameObjects.removeElement(_item)
            if (_item._sprite) {
                animation.stopAnimation(animation.AnimationTypes.All, _item._sprite)
                sprites.destroy(_item._sprite)
                _item._sprite = null;
            }
        }
    }

    export function addGameObject(value: GameObject): void {
        _gameObjects.push(value)
    }

    export function destroyGameObject(value: GameObject): void {
        _destroyQueue.push(value)
    }

    //% block="Get All Game Objects"
    //% group="Access"
    export function getGameObjects(): GameObject[] { return _gameObjects }

    //% block="Get All Game Objects of $kind=spritekind"
    //% group="Access"
    export function _getGameObjects(kind: number): GameObject[] {
        return _gameObjects.filter((value: GameObject) => {
            return (value._blueprint.getKind() == kind)
        })
    }

    //% block="frame time"
    //% group="Time"
    export function frameTime(): number {
        return _lastFrameTime
    }

    //% block="facing $value"
    //% group="Data"
    export function getFacing(value: FacingDirection): FacingDirection { return value }

    //% shim=ENUM_GET
    //% blockId=actionName_enum_shim
    //% block="$arg" group="Action Name"
    //% enumName="ActionName"
    //% enumMemberName="action"
    //% enumPromptHint="e.g. Walk, Attack, ..."
    //% enumInitialMembers="None, Walk, Run, Attack, Damage, Death"
    export function _actionNameEnumShim(arg: number) {
        return arg;
    }

    //% shim=ENUM_GET
    //% blockId=dataName_enum_shim
    //% block="$arg" group="Data Name"
    //% enumName="DataName"
    //% enumMemberName="data"
    //% enumPromptHint="e.g. Life, Damage, ..."
    //% enumInitialMembers="Life, Damage, Score, Speed, DamageCooldown, AttackCooldown, AttackDuration"
    export function _dataNameEnumShim(arg: number) {
        return arg;
    }
}

game.onUpdate(() => {
    engine.updateGameTime()
    gameObjects.doUpdate()
    engine.updateDestroyQueue()
})

enum InitialActionName {
    None, Walk, Run, Attack, Damage, Death
}

enum InitialDataName {
    Life, Damage, Score, Speed, DamageCooldown, AttackCooldown, AttackDuration
}