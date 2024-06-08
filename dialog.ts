// Add your code here
// blockNamespace="dialogs"
class Dialog {
    confirmPressed: boolean
    message: string;
    answers: string[];
    result: number;
    textColor: number;
    
    private inputIndex: number;
    private textSprite: Sprite;
    private backImage: Image;

    show(message: string, answers: string[]) {
        this.message = message;
        this.answers = answers;
        this.inputIndex = 0;

        const dw = screen.width //* 0.9
        const dh = screen.height //* 0.4
        this.backImage = image.create(dw, dh)
        this.backImage.copyFrom(screen)

        controller._setUserEventsEnabled(false);
        game.pushScene()

        this.draw();
        this.registerHandlers();
        this.confirmPressed = false;

        pauseUntil(() => this.confirmPressed);

        game.popScene();
        controller._setUserEventsEnabled(true);

        sprites.destroy(this.textSprite)
        return this.result;
    }

    private draw() {
        //this.backImage.fillRect(0, 0, this.backImage.width, this.backImage.height, 0)
        images.drawTextCentered(this.backImage, this.message, this.textColor, 1, true)
        helpers.imageDrawRect(this.backImage, 0, 0, this.backImage.width, this.backImage.height, this.textColor)
        this.textSprite = sprites.create(this.backImage, -1)
        //this.textSprite.x = scene.cameraLeft()
        this.textSprite.y = scene.cameraTop() + (screen.height - this.backImage.height - 8)
    }

        
    private registerHandlers() {
        controller.up.onEvent(SYSTEM_KEY_DOWN, () => {
            
        })

        controller.down.onEvent(SYSTEM_KEY_DOWN, () => {
            
        })

        controller.right.onEvent(SYSTEM_KEY_DOWN, () => {
            
        });

        controller.left.onEvent(SYSTEM_KEY_DOWN, () => {
            
        });

        controller.A.onEvent(SYSTEM_KEY_DOWN, () => {
            this.confirmPressed = true
        });

        controller.B.onEvent(SYSTEM_KEY_DOWN, () => {
            
        });
    }
}

// blockNamespace="dialogs"
class ChoiceDialog extends game.BaseDialog {
    static MAX_FRAME_UNIT = 12;
    choices: string[]
    selectBackcolor: number
    selectTextcolor: number
    topOffset: number
    firstVisible: number
    selectedIndex: number
    
    private _hasMore: boolean
    private _hasLess: boolean
    private _lastVisible: number

    constructor(width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image) {
        super(width, height, frame, font, cursor);
        this.firstVisible = 0
        this.selectedIndex = 0
        this._hasMore = false
        this._hasLess = false
        this.selectBackcolor = 3
        this.selectTextcolor = 0
        this.topOffset = 4
    }

    get hasLess(): boolean { return this._hasLess }
    get hasMore(): boolean { return this._hasMore }
    get lastVisible(): number { return this._lastVisible }

    selectedItem(): string {
        if (this.selectedIndex > -1 && this.selectedIndex < this.choices.length) {
            return this.choices[this.selectedIndex]
        }
        return ""
    }

    setText(rawString: string) {
        this.setFont(image.getFontForText(rawString))
        this.choices = rawString.split("\\n")
    }

    drawTextCore() {
        if (!this.choices || this.choices.length === 0) return;
        const lines = this.choices;
        const availableWidth = this.textAreaWidth();
        const availableHeight = this.textAreaHeight();

        const charactersPerRow = Math.floor(availableWidth / this.font.charWidth);
        const rowsOfCharacters = Math.floor(availableHeight / this.rowHeight());

        if (this.unit > ChoiceDialog.MAX_FRAME_UNIT) this.drawBorder();

        const textLeft = 1 + this.innerLeft + Math.min(this.unit, ChoiceDialog.MAX_FRAME_UNIT) + ((availableWidth - charactersPerRow * this.font.charWidth) >> 1);
        const textTop = this.topOffset + 1 + (this.image.height >> 1) - ((lines.length * this.rowHeight()) >> 1);

        //this._hasMore = false
        let pRows = 0
        for (let row = this.firstVisible; row < lines.length; row++) {
            this._lastVisible = row
            let clr = this.textColor
            if (row == this.selectedIndex) {
                this.image.fillRect(textLeft - 1, textTop - 1 + pRows * this.rowHeight(), availableWidth, this.font.charHeight + 1, this.selectBackcolor)
                clr = this.selectTextcolor
            } else {
                this.image.fillRect(textLeft - 1, textTop - 1 + pRows * this.rowHeight(), availableWidth, this.font.charHeight + 1, 1)
            }
            this.image.print(
                lines[row],
                textLeft,
                textTop + pRows * this.rowHeight(),
                clr, this.font                
            )           
            if ((pRows + 1) * this.rowHeight() > availableHeight) {
                this._hasMore = true
                break
            } else { this._hasMore = false }
            pRows += 1
        }
        this._hasLess = ((this.firstVisible + pRows) * this.rowHeight() > 0)
    }
}

class ChoiceDialog2 extends game.Dialog {
    selectedIndex: number

    _chunkLineIndex: Dictionary<number, number> = new Dictionary<number, number>()

    constructor(width: number, height: number, frame?: Image, font?: image.Font, cursor?: Image) {
        super(width, height, frame, font, cursor);
        this.selectedIndex = 0
        this.chunkIndex = 0;
    }

    drawTextCore() {
        let c = this.textColor
        if (this._chunkLineIndex.getItem(this.chunkIndex) == this.selectedIndex) {
            this.textColor = 3
        } 
        super.drawTextCore()
        this.textColor = c
    }

    setText(rawString: string) {
        this.setFont(image.getFontForText(rawString));
        this.chunks = [[]]
        const lines = rawString.split("\\n")
        for (let lineIdx = 0; lineIdx < lines.length; lineIdx ++) {
            const item = lines[lineIdx]
            const chunk = this.chunkText(item)
            const delta = this.chunks.length
            for (let ci = 0; ci < chunk.length; ci++) {
                this._chunkLineIndex.setItem(delta + ci, lineIdx)
                chunk.forEach((chunkLine) => {
                    this.chunks.push(chunkLine)
                })
            }   
        }
        this.chunkIndex = 1;
    }
}

// blockNamespace="dialogs"
class DialogSequence {
    steps: DialogStep[]

    private _currentStep: DialogStep

    constructor() {
        this.steps = []
        this.reset()
    }

    reset() {        
        this._currentStep = null
    }

    nextStep(): boolean {
        let _stepList: DialogStep[]
        if (this._currentStep) {
            _stepList = this._currentStep.responses
        } else {
            _stepList = this.steps
        }
        for (let i = 0; i < _stepList.length; i++) {
            const item = _stepList[i]
            if (item.isValid()) {
                this._currentStep = item
                return true
            }
        }
        return false
    }

    update(): void {
        let running = this.nextStep()
        while (running) {
            game.showLongText(this._currentStep.dialogText, DialogLayout.Bottom)
            running = this.nextStep()
        }
        
    }
}

// blockNamespace="dialogs"
class DialogStep {
    speakerId: number
    dialogText: string
    conditions: (() => {})[] = []
    actions: (() => {})[] = []
    responses: DialogStep[]

    constructor() {
    }

    isValid(): boolean {
        let result: boolean = true
        for (let i = 0; i < this.conditions.length; i++) {
            if (!this.conditions[i]()) {
                result = false
                break
            }
        }
        return result
    }

    doActions(): void {
        this.actions.forEach((item: (() => {})) => {
            item()
        })
    }
}

//% color="#FF779B" weight=180 icon="\uf086" block="Dialogs"
//% groups='["Prompt"]'
namespace dialogs {
    //% block="ask %message || and prompt for %answers"
    //% message.shadow=text
    //% message.defl=""
    //% answers.shadow=lists_create_with
    //% group="Prompt"
    export function askForChoice(message: string, answers: string[]) {
        let dlg = new Dialog();
        const result = dlg.show(message, answers);
    }

    //% block="select from $choices"
    //% group="Prompt"
    export function selectChoice(choices: string[]): number {
        const dlg = new ChoiceDialog(screen.width * 0.95, screen.height * 0.4)
        dlg.choices = choices
        dlg.font = image.font8

        controller._setUserEventsEnabled(false);
        game.pushScene();
        game.currentScene().flags |= scene.Flag.SeeThrough;

        let width: number;
        let height: number;
        let top: number;
        let left: number;
        width = screen.width - 4;
        height = Math.idiv(screen.height, 3) + 5;
        top = screen.height - height;
        left = screen.width - width >> 1;

        const s = sprites.create(dlg.image, -1);
        s.top = top;
        s.left = left;

        let aPressed = true;
        let done = false;

        let upPressed = true;
        let downPressed = true;

        game.onUpdate(() => {
            dlg.update();
            const currentState = controller.A.isPressed() 
            if (currentState && !aPressed) {
                aPressed = true;
                scene.setBackgroundImage(null); // GC it
                game.popScene();
                done = true;
            }
            else if (aPressed && !currentState) {
                aPressed = false;
            }

            const moveDown = controller.down.isPressed();
            if (moveDown && !downPressed) {
                downPressed = true;
                if (dlg.hasMore && (dlg.selectedIndex < dlg.choices.length - 1)) {
                    if (dlg.selectedIndex == dlg.lastVisible) {
                        dlg.firstVisible += 1
                    }
                }
                else {

                }
                if (dlg.selectedIndex < dlg.choices.length - 1) { dlg.selectedIndex += 1 }
            }
            else if (downPressed && !moveDown) {
                downPressed = false;
            }

            const moveBack = controller.up.isPressed();
            if (moveBack && !upPressed) {
                upPressed = true;
                if (dlg.hasLess && (dlg.firstVisible > 0)) {
                    dlg.firstVisible -= 1
                }
                if (dlg.selectedIndex > 0) { dlg.selectedIndex -= 1 }
            }
            else if (upPressed && !moveBack) {
                upPressed = false;
            }
        })

        pauseUntil(() => done);
        controller._setUserEventsEnabled(true);
        return dlg.selectedIndex
    }

    //% blockId=game_show_long_choices group="Prompt"
    //% block="show long choices %str %layout"
    //% str.shadow=text
    //% blockHidden
    export function showLongChoices(str: any, layout: DialogLayout) {
        str = console.inspect(str);
        controller._setUserEventsEnabled(false);
        game.pushScene();
        game.currentScene().flags |= scene.Flag.SeeThrough;

        let width: number;
        let height: number;
        let top: number;
        let left: number;

        switch (layout) {
            case DialogLayout.Bottom:
                width = screen.width - 4;
                height = Math.idiv(screen.height, 3) + 5;
                top = screen.height - height;
                left = screen.width - width >> 1;
                break;
            case DialogLayout.Top:
                width = screen.width - 4;
                height = Math.idiv(screen.height, 3) + 5;
                top = 0;
                left = screen.width - width >> 1;
                break;
            case DialogLayout.Left:
                width = Math.idiv(screen.width, 3) + 5;
                height = screen.height;
                top = 0;
                left = 0;
                break;
            case DialogLayout.Right:
                width = Math.idiv(screen.width, 3) + 5;
                height = screen.height;
                top = 0;
                left = screen.width - width;
                break;
            case DialogLayout.Center:
                width = Math.idiv(screen.width << 1, 3);
                height = Math.idiv(screen.width << 1, 3);
                top = (screen.height - height) >> 1;
                left = (screen.width - width) >> 1;
                break;
            case DialogLayout.Full:
                width = screen.width;
                height = screen.height;
                top = 0;
                left = 0;
                break;
        }

        const dialog = new ChoiceDialog2(width, height);
        const s = sprites.create(dialog.image, -1);
        s.top = top;
        s.left = left;

        dialog.setText(str)
        let pressed = true;
        let done = false;

        let upPressed = true;

        game.onUpdate(() => {
            dialog.update();
            const currentState = controller.A.isPressed() || controller.down.isPressed();
            if (currentState && !pressed) {
                pressed = true;
                if (dialog.hasNext()) {
                    dialog.nextPage();
                }
                else {
                    scene.setBackgroundImage(null); // GC it
                    game.popScene();
                    done = true;
                }
            }
            else if (pressed && !currentState) {
                pressed = false;
            }

            const moveBack = controller.up.isPressed();
            if (moveBack && !upPressed) {
                upPressed = true;
                if (dialog.hasPrev()) {
                    dialog.prevPage();
                }
            }
            else if (upPressed && !moveBack) {
                upPressed = false;
            }
        })

        pauseUntil(() => done);
        controller._setUserEventsEnabled(true);
    }
}