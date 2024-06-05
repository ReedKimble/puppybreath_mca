
/**
 * Game processing
 **/
//% color="#C44FFF" weight=200 icon="\uf1b9" block="Engine"
//% groups='["Time","Access","Named Value"]'
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

    //% block="get all game objects"
    //% group="Access"
    export function getGameObjects(): GameObject[] { return _gameObjects }

    //% block="get all game objects of $kind=spritekind"
    //% group="Access"
    export function _getGameObjects(kind: number): GameObject[] {
        return _gameObjects.filter((value: GameObject) => {
            return (value._blueprint.getKind() == kind)
        })
    }

    //% block="destroy all game objects"
    //% group="Access"
    export function destroyAllGameObjects(): void {
        _gameObjects.forEach((item: GameObject) => { _destroyQueue.push(item) })
    }

    //% block="frame time"
    //% group="Time"
    export function frameTime(): number {
        return _lastFrameTime
    }

    //% block="facing $value"
    //% group="Named Value"
    export function getFacing(value: FacingDirection): FacingDirection { return value }

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
    //% blockId=actionkind block="$kind"
    //% kindNamespace=ActionKind kindMemberName=kind kindPromptHint="e.g. None, Walk, Attack..."
    export function _actionKind(kind: number): number {
        return kind;
    }

    /**
         * Gets the "kind" of data
         */
    //% shim=KIND_GET
    //% blockId=datakind block="$kind"
    //% kindNamespace=DataKind kindMemberName=kind kindPromptHint="e.g. None, Walk, Attack..."
    export function _dataKind(kind: number): number {
        return kind;
    }
}

game.onUpdate(() => {
    engine.updateGameTime()
    gameObjects.doUpdate()
    engine.updateDestroyQueue()
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