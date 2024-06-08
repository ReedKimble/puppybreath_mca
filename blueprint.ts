//% blockNamespace="blueprints"
//% block
class Blueprint {
        
    _name: string
    _kind: number
    _images: Dictionary<FacingDirection, Dictionary<number, Image[]>>
    _defaultFacing: FacingDirection
    _defaultAction: number
    _animateWhenIdle: boolean
    _dataBank: DataBank
    _onUpdate: (obj: GameObject) => void
    _onLoad: (obj: GameObject) => void
    _onDestroy: (obj: GameObject) => void

    constructor(bpName: string, bpKind: number) {
        this._name = bpName
        this._kind = bpKind
        this._defaultFacing = FacingDirection.Down
        this._defaultAction = 0
        this._animateWhenIdle = false
        this._images = new Dictionary<FacingDirection, Dictionary<number, Image[]>>()
        this._images.setItem(FacingDirection.Left, new Dictionary<number, Image[]>())
        this._images.setItem(FacingDirection.Up, new Dictionary<number, Image[]>())
        this._images.setItem(FacingDirection.Right, new Dictionary<number, Image[]>())
        this._images.setItem(FacingDirection.Down, new Dictionary<number, Image[]>())
        this._dataBank = new DataBank()
        this._dataBank.data.setItem(DataKind.Life, 3)
        this._dataBank.data.setItem(DataKind.Damage, 0)
        this._dataBank.data.setItem(DataKind.Score, 0)
        this._dataBank.data.setItem(DataKind.Speed, 100)
        this._dataBank.data.setItem(DataKind.AnimateRate, 50)
        this._dataBank.data.setItem(DataKind.DamageCooldown, 1000)
        this._dataBank.data.setItem(DataKind.AttackCooldown, 0)
        this._dataBank.data.setItem(DataKind.AttackDuration, 300)
    }

    //% block="get %blueprint(myBlueprint) name" group="Modify"
    getName(): string { return this._name }

    //% block="get %blueprint(myBlueprint) kind" group="Modify"
    getKind(): number { return this._kind }
    //% block="set %blueprint(myBlueprint) kind to $value=spritekind"
    //% group="Modify"
    setKind(value: number): void { this._kind = value }

    //% block="get %blueprint(myBlueprint) default facing" group="Modify"
    getDefaultFacing(): FacingDirection { return this._defaultFacing }
    //% block="set %blueprint(myBlueprint) default facing to $value"
    //% group="Modify"
    setDefaultFacing(value: FacingDirection): void { this._defaultFacing = value }

    //% block="get %blueprint(myBlueprint) default action" group="Modify"
    getDefaultAction(): number { return this._defaultAction }
    //% block="set %blueprint(myBlueprint) default action to %value=actionkind"
    //% group="Modify"
    //% value.shadow="actionkind"
    setDefaultAction(value: number): void { this._defaultAction = value }

    //% block="get %blueprint(myBlueprint) animate when idle" group="Modify"
    getAnimateWhenIdle(): boolean { return this._animateWhenIdle }
    //% block="set %blueprint(myBlueprint) animate when idle to %value"
    //% group="Modify"
    //% value.defl="false"
    setAnimateWhenIdle(value: boolean): void { this._animateWhenIdle = value }

    //% block="get %blueprint(myBlueprint) DataBank" group="Modify"
    getDataBank(): DataBank { return this._dataBank }

    //% block="get %blueprint(myBlueprint) animation|facing $facing|doing %action=actionkind"
    //% group="Modify"
    getImages(facing: FacingDirection, action: number): Image[] {
        if (this._images.getItem(facing).contains(action)) {
            return this._images.getItem(facing).getItem(action)
        } else {
            if (this._images.getItem(facing).contains(this._defaultAction)) {
                return this._images.getItem(facing).getItem(this._defaultAction)
            } else {
                return this._images.getItem(this._defaultFacing).getItem(this._defaultAction)
            }
        }
    }

    getFacingActionUsed(facing: FacingDirection, action: number): [FacingDirection, number] {
        if (this._images.getItem(facing).contains(action)) {
            return [facing, action]
        } else {
            if (this._images.getItem(facing).contains(this._defaultAction)) {
                return [facing, this._defaultAction]
            } else {
                return [this._defaultFacing, this._defaultAction]
            }
        }
    }

    //% block="set %blueprint(myBlueprint) animation|facing $facing|doing %action=actionkind|to %value=animation_editor"
    //% group="Modify"
    //% action.shadow="actionkind"
    //% value.shadow="animation_editor"
    setImages(facing: FacingDirection, action: number, value: Image[]): void {
        this._images.getItem(facing).setItem(action, value)
    }

    getDefaultImage(): Image {
        const imgList: Dictionary<number, Image[]> = this._images.getItem(this._defaultFacing)
        if (imgList.contains(this._defaultAction)) { return imgList.getItem(this._defaultAction)[0] }
        return image.create(16, 16)
    }

    //% block="get %blueprint(myBlueprint) data %dataName=datakind"
    //% group="Data"
    //% dataName.shadow=datakind
    getDataValue(dataName: number): number {
        if (this._dataBank.data.contains(dataName)) { return this._dataBank.data.getItem(dataName) }
        return 0
    }
    //% block="set %blueprint(myBlueprint) data %dataName=datakind to $value"
    //% group="Data"
    //% dataName.shadow=datakind
    setDataValue(dataName: number, value: number): void {
        this._dataBank.data.setItem(dataName, value)
    }
    //% block="get %blueprint(myBlueprint) text %dataName=datakind"
    //% group="Data"
    //% dataName.shadow=datakind
    getTextValue(dataName: number): string {
        if (this._dataBank.text.contains(dataName)) { return this._dataBank.text.getItem(dataName) }
        return ""
    }
    //% block="set %blueprint(myBlueprint) text %dataName=datakind to $value"
    //% group="Data"
    //% dataName.shadow=datakind
    setTextValue(dataName: number, value: string): void {
        this._dataBank.text.setItem(dataName, value)
    }
    //% block="get %blueprint(myBlueprint) flag %dataName=datakind"
    //% group="Data"
    //% dataName.shadow=datakind
    getFlagValue(dataName: number): boolean {
        if (this._dataBank.flag.contains(dataName)) { return this._dataBank.flag.getItem(dataName) }
        return false
    }
    //% block="set %blueprint(myBlueprint) flag %dataName=datakind to $value"
    //% group="Data"
    //% dataName.shadow=datakind
    setFlagValue(dataName: number, value: boolean): void {
        this._dataBank.flag.setItem(dataName, value)
    }
}


//% color="#499DD8" weight=220 icon="\uf0c0" block="Blueprints"
//% groups='["Access","Modify","Data"]'
namespace blueprints {
    const _BlankBlueprint: Blueprint = new Blueprint("blank", SpriteKind.create())
    const _blueprints: Dictionary<string, Blueprint> = new Dictionary<string, Blueprint>()

    export function blankBlueprint(): Blueprint { return _BlankBlueprint }
    
    //% block="create blueprint named $name of kind %kind=spritekind"
    //% group="Access"
    //% kind.shadow="spritekind"
    export function createBlueprint(name: string, kind: number): Blueprint {
        const result: Blueprint = new Blueprint(name, kind)
        _blueprints.setItem(name, result)
        return result
    }

    //% block="create blueprint named $name"
    //% group="Access"
    export function createBlueprintGeneric(name: string): Blueprint {
        const result: Blueprint = new Blueprint(name, -1)
        _blueprints.setItem(name, result)
        return result
    }

    //% block="get blueprint named $name"
    //% group="Access"
    export function getBlueprint(name: string): Blueprint {
        if (_blueprints.contains(name)) { return _blueprints.getItem(name) }
        return null //createBlueprintGeneric(name)
    }

    //% block="$source=variables_get(myBlueprint) is named $name"
    //% group="Logic"
    export function blockNameIs(source: Blueprint, name: string): boolean {
        return (source._name == name)
    }

    //% draggableParameters="reporter"
    //% block="on $blueprint=variables_get(myBlueprint) update of $obj=variables_get(myGameObject)" group="Modify"
    //% handlerStatement
    export function onUpdate(blueprint: Blueprint, value: (obj: GameObject) => void): void {
        blueprint._onUpdate = value
    }

    //% draggableParameters="reporter"
    //% block="on $blueprint=variables_get(myBlueprint) load of $obj=variables_get(myGameObject)" group="Modify"
    //% handlerStatement
    export function onLoad(blueprint: Blueprint, value: (obj: GameObject) => void): void {
        blueprint._onLoad = value
    }

    //% draggableParameters="reporter"
    //% block="on $blueprint=variables_get(myBlueprint) destroy of $obj=variables_get(myGameObject)" group="Modify"
    //% handlerStatement
    export function onDestroy(blueprint: Blueprint, value: (obj: GameObject) => void): void {
        blueprint._onDestroy = value
    }
}
