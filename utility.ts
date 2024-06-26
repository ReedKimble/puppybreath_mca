/**
 * A dictionary from tKey keys to tValue values
 */
class Dictionary<tKey, tValue> {
    protected _keys: Array<tKey>
    protected _values: Array<tValue>

    constructor() {
        this.clear()
    }

    clear(): void {
        this._keys = []
        this._values = []
    }

    clone(): Dictionary<tKey, tValue> {
        const result = new Dictionary<tKey, tValue>()
        this.copyTo(result)
        return result
    }
    contains(key: tKey): boolean {
        if (this._keys.indexOf(key) > -1) { return true }
        return false
    }
    copyTo(other: Dictionary<tKey, tValue>) {
        for (let idx = 0; idx < this._keys.length; idx++) {
            other.setItem(this._keys[idx], this._values[idx])
        }
    }
    count(): number {
        return this._keys.length
    }
    forEachKey(action: (item: tKey) => void): void {
        this._keys.forEach((_item: tKey) => {
            action(_item)
        })
    }
    forEachValue(action: (item: tValue) => void): void {
        this._values.forEach((_item: tValue) => {
            action(_item)
        })
    }

    getItem(key: tKey): tValue {
        const idx = this._keys.indexOf(key)
        if (idx > -1) { return this._values[idx] }
        return null
    }
    setItem(key: tKey, value: tValue): void {
        const idx = this._keys.indexOf(key)
        if (idx > -1) {
            this._values[idx] = value
        } else {
            this._keys.push(key)
            this._values.push(value)
        }
    }
    removeItem(key: tKey): boolean {
        const idx = this._keys.indexOf(key)
        if (idx > -1) {
            this._keys.removeAt(idx)
            this._values.removeAt(idx)
            return true
        }
        return false
    }
}

class DataBank {
    _data: Dictionary<number, number> = new Dictionary<number, number>()
    _text: Dictionary<number, string> = new Dictionary<number, string>()
    _flag: Dictionary<number, boolean> = new Dictionary<number, boolean>()

    constructor() { }

    get data() { return this._data }
    get text() { return this._text }
    get flag() { return this._flag }

    clone(): DataBank {
        const result = new DataBank
        this.copyTo(result)
        return result
    }
    copyTo(other: DataBank): void {
        this._data.copyTo(other.data)
        this._text.copyTo(other.text)
        this._flag.copyTo(other.flag)
    }
}

class GameObjectIds {
    _ids: Dictionary<string, number>

    constructor() {
        this._ids = new Dictionary<string, number>()
    }

}

enum DataKind {
    Data,
    Text,
    Flag
}

enum FacingDirection {
    //% block="Down"
    Down = 0,
    //% block="Up"
    Up = 1,
    //% block="Left"
    Left = 2,
    //% block="Right"
    Right = 3
}

namespace images {

    //% block="Draw $text|on $target=variables_get(picture)|at x:$x y:$y|in %c=colorindexpicker|scaled to $s"
    //% s.defl=1
    //% group="Drawing"
    //% inlineInputMode=inline
    export function drawText(target: Image, text: string, x: number, y: number, c: number, s: number = 1): void {
        const f: image.Font = image.scaledFont(image.font8, s)
        let lines: string[] = []
        let dy: number
        if (text.includes("\\n")) {
            lines = text.split("\\n")
        } else {
            lines.push(text)
        }
        dy = y
        lines.forEach((line: string) => {
            target.print(line, x, dy, c, f)
            dy += f.charHeight
        })
    }

    //% block="Draw $text|on $target=variables_get(picture) at center|in %c=colorindexpicker|scaled to $s|with shadow $shadowed"
    //% s.defl=1
    //% shadowed.defl=false
    //% group="Drawing"
    //% inlineInputMode=inline
    export function drawTextCentered(target: Image, text: string, c: number, s: number = 1, shadowed: boolean = false): void {
        const f: image.Font = image.scaledFont(image.font8, s)
        let lines: string[] = []
        let tw: number, th: number, dx: number, dy: number
        if (text.includes("\\n")) {
            lines = text.split("\\n")
            th = f.charHeight * lines.length
        } else {
            lines.push(text)
            th = f.charHeight
        }
        dy = target.height / 2 - th / 2
        lines.forEach((line: string) => {
            tw = f.charWidth * line.length
            dx = target.width / 2 - tw / 2
            if (shadowed) {
                let so: number = f.charHeight * 0.1
                target.print(line, dx + so, dy + so, -1, f)
            }
            target.print(line, dx, dy, c, f)
            dy += f.charHeight
        })
    }
}

class ControllerState {
    _buttonState: Dictionary<number, boolean> = new Dictionary<number, boolean>()
    _wasPressed: Dictionary<number, boolean> = new Dictionary<number, boolean>()
    _isInit: boolean = false

    constructor() {
        this.addListeners(controller.left, 1)
        this.addListeners(controller.up, 2)
        this.addListeners(controller.right, 3)
        this.addListeners(controller.down, 4)
        this.addListeners(controller.A, 5)
        this.addListeners(controller.B, 6)
    }

    private addListeners(b: controller.Button, id: number): void {
        b.addEventListener(ControllerButtonEvent.Pressed, () => {
            if (!this._buttonState.getItem(id)) {
                this._buttonState.setItem(id, true)
            }
        })
        b.addEventListener(ControllerButtonEvent.Released, () => {
            if (this._buttonState.getItem(id)) {
                this._wasPressed.setItem(id, true)
                this._buttonState.setItem(id, false)
            }
        })
    }

    update(): void {
        if (!this._isInit) {
            
            this._isInit = true
        }
        this._wasPressed.forEachKey((key: number) => {
            this._wasPressed.setItem(key, false)
        })
    }

    wasPressed(button: number): boolean {
        return this._wasPressed.getItem(button)
    }
}

namespace controller {
    export const _controllerState: ControllerState = new ControllerState()
    
    export function isButtonPressed(button: number): boolean {
        switch (button) {
            case 0: return controller.menu.isPressed()
            case 1: return controller.left.isPressed()
            case 2: return controller.up.isPressed()
            case 3: return controller.right.isPressed()
            case 4: return controller.down.isPressed()
            case 5: return controller.A.isPressed()
            case 6: return controller.B.isPressed()
        }
        return false
    }
    //% block="was %button **button** pressed"
    //% group="Single Player"
    export function wasButtonPressed(button: ControllerButton): boolean {
        return _controllerState.wasPressed(button)
    }
}

namespace Math {
    const EPSILON: number = 0.01
    const TWO_PI: number = Math.PI * 2
    const HALF_CIRCLE: number = 180.0
    const FUL_CIRCLE: number = 360.0

    //% block="distance between $source=variables_get(mySprite) and $target=variables_get(mySprite)"
    export function distanceBetween(source: Sprite, target: Sprite): number {
        return sqrt(pow(target.x - source.x, 2) + pow(target.y - source.y, 2))
    }

    //% block="distance between $source=variables_get(myGameObject) and $target=variables_get(myGameObject)"
    export function distanceBetweenObjects(source: GameObject, target: GameObject): number {
        return sqrt(pow(target._sprite.x - source._sprite.x, 2) + pow(target._sprite.y - source._sprite.y, 2))
    }

    //% block="position from $source=variables_get(mySprite) to $target=variables_get(mySprite) at $distance"
    export function positionToward(source: Sprite, target: Sprite, distance: number): Point {
        const sp = new Point(source.x, source.y)
        const tp = new Point(target.x, target.y)
        const angle = radiansFromTo(sp, tp)
        const rx = cos(angle) * distance
        const ry = sin(angle) * distance
        return new Point(source.x + rx, source.y + ry)
    }

    //% block="create point with $x and $y"
    export function createPoint(x: number, y: number): Point {
        return new Point(x, y)
    }

    export function degreesToRadians(degrees: number): number {
        return degrees * (PI / HALF_CIRCLE)
    }

    export function radiansFromTo(source: Point, target: Point): number {
        return wrapRadians(atan2(target.y - source.y, target.x - source.x))
    }

    export function radiansToDegrees(radians: number): number {
        return radians * (HALF_CIRCLE / PI)
    }

    export function wrapDegrees(degrees: number): number {
        return radiansToDegrees(wrapRadians(degreesToRadians(degrees)))
    }

    export function wrapRadians(radians: number): number {
        while (radians < -PI) { radians += TWO_PI }
        while (radians > PI) { radians -= TWO_PI }
        return radians
    }
}

//% blockNamespace="Math"
class Point {
    _x: number
    _y: number

    //% blockCombine
    get x() { return this._x }
    //% blockCombine
    set x(value: number) { this._x = value }

    //% blockCombine
    get y() { return this._y }
    //% blockCombine
    set y(value: number) { this._y = value }

    constructor(px: number, py: number) {
        this._x = px
        this._y = py
    }
}
