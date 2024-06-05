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
    //% block="set %gameobject(myGameObject) action to %value=actionName_enum_shim" group="Modify"
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

    //% block="get %gameobject(myGameObject) data value named %dataName=dataName_enum_shim"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    getDataValue(dataName: number): number {
        if (this._dataBank.data.contains(dataName)) { return this._dataBank.data.getItem(dataName) }
        return 0
    }
    //% block="set %gameobject(myGameObject) data value named %dataName=dataName_enum_shim to $value"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    setDataValue(dataName: number, value: number): void {
        this._dataBank.data.setItem(dataName, value)
    }
    //% block="get %gameobject(myGameObject) text value named %dataName=dataName_enum_shim"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    getTextValue(dataName: number): string {
        if (this._dataBank.text.contains(dataName)) { return this._dataBank.text.getItem(dataName) }
        return ""
    }
    //% block="set %gameobject(myGameObject) text value named %dataName=dataName_enum_shim to $value"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    setTextValue(dataName: number, value: string): void {
        this._dataBank.text.setItem(dataName, value)
    }
    //% block="get %gameobject(myGameObject) flag value named %dataName=dataName_enum_shim"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    getFlagValue(dataName: number): boolean {
        if (this._dataBank.flag.contains(dataName)) { return this._dataBank.flag.getItem(dataName) }
        return false
    }
    //% block="set %gameobject(myGameObject) flag value named %dataName=dataName_enum_shim to $value"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    setFlagValue(dataName: number, value: boolean): void {
        this._dataBank.flag.setItem(dataName, value)
    }

    updateCooldowns(): void {
        if (this._dataBank.data.contains(InitialDataName.DamageCooldown)) {
            let coolDown: number = this._dataBank.data.getItem(InitialDataName.DamageCooldown)
            if (coolDown > 0) {
                coolDown = coolDown - engine.frameTime()
                if (isNaN(coolDown)) { coolDown = 0 }
                this._dataBank.data.setItem(InitialDataName.DamageCooldown, coolDown)
            }
        }
        if (this._dataBank.data.contains(InitialDataName.AttackCooldown)) {
            let coolDown: number = this._dataBank.data.getItem(InitialDataName.AttackCooldown)
            if (coolDown > 0) {
                coolDown = coolDown - engine.frameTime()
                if (isNaN(coolDown)) { coolDown = 0 }
                this._dataBank.data.setItem(InitialDataName.AttackCooldown, coolDown)
            } else if (this._action == InitialActionName.Attack) {
                this._dataBank.data.setItem(InitialDataName.AttackCooldown, 0)
                this.setAction(InitialActionName.None)
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
        const attackAnimated = this._blueprint._images.getItem(this._facing).contains(InitialActionName.Attack)
        const isAttacking = (this._action == InitialActionName.Attack && attackAnimated)
        let doStop = false;

        if (this._autoWalk && !isAttacking) {
            if (this._isMoving) {
                if (this._action != InitialActionName.Walk) { this.setAction(InitialActionName.Walk) }
            } else {
                if (this._action != InitialActionName.None) { this.setAction(InitialActionName.None) }
            }
        }
        if (this._animateWhenIdle || this._isMoving || isAttacking) {
            let b1 = (this._lastAction == InitialActionName.Attack)
            if (!this._animation || (this._wasFacing != this._facing) || (this._actionChanged && attackAnimated)) {
                if (this._animation) { animation.stopAnimation(animation.AnimationTypes.ImageAnimation, this._sprite) }
                const frames = this._blueprint.getImages(this._facing, this._action)
                const spd = this.getDataValue(InitialDataName.Speed)
                const rate = this.getDataValue(InitialDataName.AnimateRate)
                let frameint = ((1 / frames.length) * 1000) * (rate / spd)
                this._animation = new animation.ImageAnimation(this._sprite, frames, frameint, true);
                this._animation.init();
            } else if (attackAnimated && b1 && (this._action == InitialActionName.Walk)) {
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
    //let _aiUpdate: (obj: GameObject) => void

    //% block="create game object from $blueprint=variables_get(myBlueprint)"
    //% group="Access"
    export function createGameObject(blueprint: Blueprint): GameObject {
        if (blueprint) {
            const result: GameObject = new GameObject(blueprint)
            engine.addGameObject(result)
            return result
        }
        return null
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

    //% block="$source=variables_get(myGameObject) apply damage to $target=variables_get(myGameObject)"
    //% group="Logic"
    export function applyDamage(source: GameObject, target: GameObject): boolean {
        if (target.getDataValue(InitialDataName.DamageCooldown) <= 0) {
            let dmg: number = source.getDataValue(InitialDataName.Damage)
            let life: number = target.getDataValue(InitialDataName.Life)
            target.setDataValue(InitialDataName.Life, life - dmg)
            target.setDataValue(InitialDataName.DamageCooldown, target._blueprint.getDataValue(InitialDataName.DamageCooldown))
            return true
        }
        return false
    }

    //% block="if $source=variables_get(myGameObject) can attack" group="Logic"
    export function canAttack(source: GameObject): boolean {
        return (source.getDataValue(InitialDataName.AttackCooldown) <= 0)
    }

    //%block="$source=variables_get(myGameObject) perform attack"
    export function performAttack(source: GameObject): void {
        source.setAction(InitialActionName.Attack)
        source.setDataValue(InitialDataName.AttackCooldown, source._blueprint.getDataValue(InitialDataName.AttackCooldown))
    }

    export function doUpdate() {
        const g: GameObject[] = engine.getGameObjects()
        if (g) {
            g.forEach((g: GameObject) => {
                // Update damage and attack cooldowns
                g.updateCooldowns()
                // Update facing direction based on velocity
                g.updateFacing()
                // Update AI if any
                if (g.getBlueprint()._aiUpdate) g.getBlueprint()._aiUpdate(g)
                // Update animation and action
                g.updateAnimation()
                // Flag as initialized on first pass
                if (!g._initialized) { g._initialized = true }
            })
        }

    }
}