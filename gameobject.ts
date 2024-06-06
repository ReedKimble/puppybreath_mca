//% block
//% blockNamespace="gameObjects"
class GameObject {
    _id: string
    _blueprint: Blueprint
    _sprite: Sprite
    _animation: animation.ImageAnimation
    _facing: FacingDirection
    _wasFacing: FacingDirection
    _action: number
    _lastAction: number
    _dataBank: DataBank
    _isMoving: boolean
    _initialized: boolean
    _animateWhenIdle: boolean
    _autoWalk: boolean
    _actionChanged: boolean

    constructor(fromBlueprint: Blueprint) {
        this._id = fromBlueprint.getName()
        this._blueprint = fromBlueprint
        this._sprite = sprites.create(this._blueprint.getDefaultImage(), this._blueprint.getKind())
        this._facing = fromBlueprint.getDefaultFacing()
        this._action = fromBlueprint.getDefaultAction()
        this._lastAction = this._action
        this._dataBank = fromBlueprint.getDataBank().clone()
        this._animateWhenIdle = fromBlueprint.getAnimateWhenIdle()
        this._isMoving = false
        this._initialized = false
        this._autoWalk = true
        this._actionChanged = true
    }

    //% block="get %gameobject(myGameObject) id" group="Modify"
    getId(): string { return this._id }
    //% block="set %gameobject(myGameObject) id to $value" group="Modify"
    setId(value: string): void { this._id = value }

    //% block="get %gameobject(myGameObject) blueprint" group="Modify"
    getBlueprint(): Blueprint { return this._blueprint }

    //% block="get %gameobject(myGameObject) sprite" group="Modify"
    getSprite(): Sprite { return this._sprite }

    //% block="get %gameobject(myGameObject) moving" group="Modify"
    getIsMoving(): boolean { return this._isMoving }

    //% block="get %gameobject(myGameObject) initialized" group="Modify"
    getInitialized(): boolean { return this._initialized }

    //% block="get %gameobject(myGameObject) facing" group="Modify"
    getFacing(): FacingDirection { return this._facing }
    //% block="set %gameobject(myGameObject) facing to $value" group="Modify"
    setFacing(value: FacingDirection): void { this._facing = value }

    //% block="get %gameobject(myGameObject) action" group="Modify"
    getAction(): number { return this._action }
    //% block="set %gameobject(myGameObject) action to %value=actionkind" group="Modify"
    setAction(value: number): void { 
        this._lastAction = this._action
        this._action = value 
        this._actionChanged = true
    }

    //% block="get %gameobject(myGameObject) animate when idle" group="Modify"
    getAnimateWhenIdle(): boolean { return this._animateWhenIdle }
    //% block="set %gameobject(myGameObject) animate when idle to $value" group="Modify"
    //% value.defl="false"
    setAnimateWhenIdle(value: boolean): void { this._animateWhenIdle = value }

    //% block="get %gameobject(myGameObject) auto walk" group="Modify"
    getAutoWalk(): boolean { return this._autoWalk }
    //% block="set %gameobject(myGameObject) auto walk to $value" group="Modify"
    //% value.defl="true"
    setAutoWalk(value: boolean): void { this._autoWalk = value }

    //% block="get %gameobject(myGameObject) data %dataName=datakind"
    //% group="Data"
    //% dataName.shadow=datakind
    getDataValue(dataName: number): number {
        if (this._dataBank.data.contains(dataName)) { return this._dataBank.data.getItem(dataName) }
        return 0
    }
    //% block="set %gameobject(myGameObject) data %dataName=datakind to $value"
    //% group="Data"
    //% dataName.shadow=datakind
    setDataValue(dataName: number, value: number): void {
        this._dataBank.data.setItem(dataName, value)
    }
    //% block="change %gameobject(myGameObject) data %dataName=datakind by $value"
    //% group="Data"
    //% dataName.shadow=datakind
    changeDataValue(dataName: number, value: number): void {
        const d = this._dataBank.data.getItem(dataName)
        this._dataBank.data.setItem(dataName, (d + value))
    }
    //% block="get %gameobject(myGameObject) text %dataName=datakind"
    //% group="Data"
    //% dataName.shadow=datakind
    getTextValue(dataName: number): string {
        if (this._dataBank.text.contains(dataName)) { return this._dataBank.text.getItem(dataName) }
        return ""
    }
    //% block="set %gameobject(myGameObject) text %dataName=datakind to $value"
    //% group="Data"
    //% dataName.shadow=datakind
    setTextValue(dataName: number, value: string): void {
        this._dataBank.text.setItem(dataName, value)
    }
    //% block="get %gameobject(myGameObject) flag %dataName=datakind"
    //% group="Data"
    //% dataName.shadow=datakind
    getFlagValue(dataName: number): boolean {
        if (this._dataBank.flag.contains(dataName)) { return this._dataBank.flag.getItem(dataName) }
        return false
    }
    //% block="set %gameobject(myGameObject) flag %dataName=datakind to $value"
    //% group="Data"
    //% dataName.shadow=datakind
    setFlagValue(dataName: number, value: boolean): void {
        this._dataBank.flag.setItem(dataName, value)
    }

    updateCooldowns(): void {
        if (this._dataBank.data.contains(DataKind.DamageCooldown)) {
            let coolDown: number = this._dataBank.data.getItem(DataKind.DamageCooldown)
            if (coolDown > 0) {
                coolDown = coolDown - engine.frameTime()
                if (isNaN(coolDown)) { coolDown = 0 }
                this._dataBank.data.setItem(DataKind.DamageCooldown, coolDown)
            }
        }
        if (this._dataBank.data.contains(DataKind.AttackCooldown)) {
            let coolDown: number = this._dataBank.data.getItem(DataKind.AttackCooldown)
            if (coolDown > 0) {
                coolDown = coolDown - engine.frameTime()
                if (isNaN(coolDown)) { coolDown = 0 }
                this._dataBank.data.setItem(DataKind.AttackCooldown, coolDown)
            } else if (this._action == ActionKind.Attack) {
                this._dataBank.data.setItem(DataKind.AttackCooldown, 0)
                this.setAction(ActionKind.None)
            }
        }
    }

    updateFacing(): void {
        this._wasFacing = this._facing
        this._isMoving = false
        if (this._sprite.vx > 0) {
            this._facing = FacingDirection.Right
            this._isMoving = true
        } else if (this._sprite.vx < 0) {
            this._facing = FacingDirection.Left
            this._isMoving = true
        } else if (this._sprite.vy < 0) {
            this._facing = FacingDirection.Up
            this._isMoving = true
        } else if (this._sprite.vy > 0) {
            this._facing = FacingDirection.Down
            this._isMoving = true
        }
    }

    updateAnimation(): void {
        const attackAnimated = this._blueprint._images.getItem(this._facing).contains(ActionKind.Attack)
        const isAttacking = (this._action == ActionKind.Attack && attackAnimated)
        let doStop = false;

        if (this._autoWalk && !isAttacking) {
            if (this._isMoving) {
                if (this._action != ActionKind.Walk) { this.setAction(ActionKind.Walk) }
            } else {
                if (this._action != ActionKind.None) { this.setAction(ActionKind.None) }
            }
        }
        if (this._animateWhenIdle || this._isMoving || isAttacking) {
            let b1 = (this._lastAction == ActionKind.Attack)
            if (!this._animation || (this._wasFacing != this._facing) || (this._actionChanged && attackAnimated)) {
                if (this._animation) { animation.stopAnimation(animation.AnimationTypes.ImageAnimation, this._sprite) }
                const frames = this._blueprint.getImages(this._facing, this._action)
                const spd = this.getDataValue(DataKind.Speed)
                const rate = this.getDataValue(DataKind.AnimateRate)
                let frameint = ((1 / frames.length) * 1000) * (rate / spd)
                this._animation = new animation.ImageAnimation(this._sprite, frames, frameint, true);
                this._animation.init();
            } else if (attackAnimated && b1 && (this._action == ActionKind.Walk)) {
                doStop = true
            }
        } else {
            if (this._animation) { doStop = true }
        }
        if (doStop) {
            animation.stopAnimation(animation.AnimationTypes.ImageAnimation, this._sprite)
            this._sprite.setImage(this._blueprint.getImages(this._facing, this._action)[0])
            this._animation = null
        }
        this._actionChanged = false
    }
}

/**
 * Game object creation and manipulation
 **/
//% color="#FF823F" weight=200 icon="\uf29a" block="GameObjects"
//% groups='["Access","Modify","Data","Logic"]'
namespace gameObjects {
    //const emptyObject: GameObject = new GameObject(blueprints.blankBlueprint())

    //% block="create game object from $blueprint=variables_get(myBlueprint)"
    //% group="Access"
    export function createGameObject(blueprint: Blueprint): GameObject {
        if (blueprint) {
            const result: GameObject = new GameObject(blueprint)
            engine.addGameObject(result)
            return result
        }
        return null //emptyObject
    }

    //% block="create game object from $blueprint=variables_get(myBlueprint)"
    //% group="Access"
    export function _createGameObject(blueprint: Blueprint): void {
        if (blueprint) {
            const result: GameObject = new GameObject(blueprint)
            engine.addGameObject(result)
        }
    }

    //% block="destroy $obj=variables_get(myGameObject)"
    //% group="Access"
    export function destroyGameObject(obj: GameObject) {
        engine.destroyGameObject(obj)
    }

    //% block="$source=variables_get(myGameObject) blueprint is named $name"
    //% group="Logic"
    export function blockNameIs(source: GameObject, name: string): boolean {
        return (source.getBlueprint().getName() == name)
    }

    //% block="$source=variables_get(myGameObject) apply damage to $target=variables_get(myGameObject)"
    //% group="Logic"
    export function applyDamage(source: GameObject, target: GameObject): boolean {
        if (target.getDataValue(DataKind.DamageCooldown) <= 0) {
            let dmg: number = source.getDataValue(DataKind.Damage)
            let life: number = target.getDataValue(DataKind.Life)
            target.setDataValue(DataKind.Life, life - dmg)
            target.setDataValue(DataKind.DamageCooldown, target._blueprint.getDataValue(DataKind.DamageCooldown))
            return true
        }
        return false
    }

    //% block="$source=variables_get(myGameObject) can attack" group="Logic"
    export function canAttack(source: GameObject): boolean {
        return (source.getDataValue(DataKind.AttackCooldown) <= 0)
    }

    //%block="$source=variables_get(myGameObject) perform attack"
    export function performAttack(source: GameObject): void {
        source.setAction(ActionKind.Attack)
        source.setDataValue(DataKind.AttackCooldown, source._blueprint.getDataValue(DataKind.AttackCooldown))
    }

    export function doUpdate() {
        const g: GameObject[] = engine.getGameObjects()
        if (g) {
            g.forEach((go: GameObject) => {
                // Update damage and attack cooldowns
                go.updateCooldowns()
                // Update facing direction based on velocity
                go.updateFacing()
                // Update AI if any
                if (go.getBlueprint()._aiUpdate) go.getBlueprint()._aiUpdate(go)
                // Update animation and action
                go.updateAnimation()
                // Flag as initialized on first pass
                if (!go._initialized) { go._initialized = true }
            })
        }

    }
}