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
    _aiUpdate: (obj: GameObject) => void

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
        this._dataBank.data.setItem(InitialDataName.Life, 3)
        this._dataBank.data.setItem(InitialDataName.Damage, 0)
        this._dataBank.data.setItem(InitialDataName.Score, 0)
        this._dataBank.data.setItem(InitialDataName.Speed, 100)
        this._dataBank.data.setItem(InitialDataName.AnimateRate, 100)
        this._dataBank.data.setItem(InitialDataName.DamageCooldown, 1000)
        this._dataBank.data.setItem(InitialDataName.AttackCooldown, 0)
        this._dataBank.data.setItem(InitialDataName.AttackDuration, 1000)
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
    //% block="set %blueprint(myBlueprint) default action to %value=actionName_enum_shim"
    //% group="Modify"
    //% value.shadow="actionName_enum_shim"
    setDefaultAction(value: number): void { this._defaultAction = value }

    //% block="get %blueprint(myBlueprint) animate when idle" group="Modify"
    getAnimateWhenIdle(): boolean { return this._animateWhenIdle }
    //% block="set %blueprint(myBlueprint) animate when idle to %value"
    //% group="Modify"
    //% value.defl="false"
    setAnimateWhenIdle(value: boolean): void { this._animateWhenIdle = value }

    //% block="get %blueprint(myBlueprint) DataBank" group="Modify"
    getDataBank(): DataBank { return this._dataBank }

    //% block="get %blueprint(myBlueprint) action animation|facing $facing|doing %action=actionName_enum_shim"
    //% group="Modify"
    getImages(facing: FacingDirection, action: number): Image[] {
        if (this._images.getItem(facing).contains(action)) {
            return this._images.getItem(facing).getItem(action)
        } else {
            return this._images.getItem(facing).getItem(this._defaultAction)
            /*if (this._images.getItem(this._defaultFacing).contains(action)) {
                return this._images.getItem(this._defaultFacing).getItem(action)
            } else {
                return this._images.getItem(this._defaultFacing).getItem(this._defaultAction)
            }*/
        }
    }

    //% block="set %blueprint(myBlueprint) action animation|facing $facing|doing %action=actionName_enum_shim|to %value=animation_editor"
    //% group="Modify"
    //% action.shadow="actionName_enum_shim"
    //% value.shadow="animation_editor"
    setImages(facing: FacingDirection, action: number, value: Image[]): void {
        this._images.getItem(facing).setItem(action, value)
    }

    getDefaultImage(): Image {
        const imgList: Dictionary<number, Image[]> = this._images.getItem(this._defaultFacing)
        if (imgList.contains(this._defaultAction)) { return imgList.getItem(this._defaultAction)[0] }
        return image.create(16, 16)
    }

    //% block="get %blueprint(myBlueprint) data value named %dataName=dataName_enum_shim"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    getDataValue(dataName: number): number {
        if (this._dataBank.data.contains(dataName)) { return this._dataBank.data.getItem(dataName) }
        return 0
    }
    //% block="set %blueprint(myBlueprint) data value named %dataName=dataName_enum_shim to $value"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    setDataValue(dataName: number, value: number): void {
        this._dataBank.data.setItem(dataName, value)
    }
    //% block="get %blueprint(myBlueprint) text value named %dataName=dataName_enum_shim"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    getTextValue(dataName: number): string {
        if (this._dataBank.text.contains(dataName)) { return this._dataBank.text.getItem(dataName) }
        return ""
    }
    //% block="set %blueprint(myBlueprint) text value named %dataName=dataName_enum_shim to $value"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    setTextValue(dataName: number, value: string): void {
        this._dataBank.text.setItem(dataName, value)
    }
    //% block="get %blueprint(myBlueprint) flag value named %dataName=dataName_enum_shim"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    getFlagValue(dataName: number): boolean {
        if (this._dataBank.flag.contains(dataName)) { return this._dataBank.flag.getItem(dataName) }
        return false
    }
    //% block="set %blueprint(myBlueprint) flag value named %dataName=dataName_enum_shim to $value"
    //% group="Data"
    //% dataName.shadow=dataName_enum_shim
    setFlagValue(dataName: number, value: boolean): void {
        this._dataBank.flag.setItem(dataName, value)
    }
}


//% color="#499DD8" weight=210 icon="\uf0c0" block="Blueprints"
//% groups='["Access","Modify","Data"]'
namespace blueprints {

    const _blueprints: Dictionary<string, Blueprint> = new Dictionary<string, Blueprint>()

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

    //% draggableParameters="reporter"
    //% block="on $blueprint=variables_get(myBlueprint) update of $obj=variables_get(myGameObject)" group="Modify"
    //% handlerStatement
    export function onUpdate(blueprint: Blueprint, value: (obj: GameObject) => void): void {
        blueprint._aiUpdate = value
    }
}
