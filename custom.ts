//% weight=100 color=#F29C00 icon="\uf2db" block="A4 microSySTEM Barrier"
namespace a4_microSySTEM_Barrier {
    let buffer = ""

    function hexCharValue(c: string): number {
        let digits = "0123456789ABCDEF"
        return digits.indexOf(c)
    }

    function hexToDec(hex: string): number {
        let result = 0
        hex = hex.toUpperCase()

        for (let i = 0; i < hex.length; i++) {
            let v = hexCharValue(hex.charAt(i))
            if (v < 0) return 0
            result = result * 16 + v
        }

        return result
    }

    function isHexChar(c: string): boolean {
        let code = c.charCodeAt(0)

        if (code >= 48 && code <= 57) return true   // 0-9
        if (code >= 65 && code <= 70) return true   // A-F
        if (code >= 97 && code <= 102) return true  // a-f

        return false
    }

    function extractLastValidFrame(data: string): string {
        let hexOnly = ""

        for (let i = 0; i < data.length; i++) {
            let c = data.charAt(i)
            if (isHexChar(c)) {
                hexOnly += c.toUpperCase()
            }
        }

        if (hexOnly.length < 12) return ""

        let start = hexOnly.length - 12
        return hexOnly.substr(start, 12)
    }


    function initRFID(): void {
        let rx = SerialPin.P14
        let tx = SerialPin.P15
        serial.redirect(tx, rx, BaudRate.BaudRate9600)
        serial.setRxBufferSize(64)
        buffer = ""
        basic.pause(100)
    }

    /**
     * Returns RFID tag's value 
     */
    //% block="read RFID tag"
    export function readID(): number {
        initRFID()
        buffer += serial.readString()

        let frame = extractLastValidFrame(buffer)

        if (buffer.length > 64) {
            buffer = buffer.substr(buffer.length - 64, 64)
        }

        if (frame.length == 12) {
            let idHex = frame.substr(2, 8)

            buffer = ""

            return hexToDec(idHex)
        }

        return 0
    }

    export enum Colors {
        //% block=red
        Red = 0x00FF00,
        //% block=green
        Green = 0xFF0000,
        //% block=blue
        Blue = 0x0000FF,
        //% block=white 
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }

    export class Strip {
        buf: Buffer;
        pin: DigitalPin;
        _length: number;

        constructor(numleds: number, pin: DigitalPin) {
            this._length = numleds;
            this.pin = pin;
            this.buf = pins.createBuffer(numleds * 3); 
        }

        showColor(rgb: number) {
            let r = (rgb >> 16) & 0xFF;
            let g = (rgb >> 8) & 0xFF;
            let b = rgb & 0xFF;

            let scale = 255 / 255;

            for (let i = 0; i < this._length; i++) {
                this.buf[i * 3 + 0] = Math.floor(r * scale);
                this.buf[i * 3 + 1] = Math.floor(g * scale);
                this.buf[i * 3 + 2] = Math.floor(b * scale);
            }

            light.sendWS2812Buffer(this.buf, this.pin);
        }

    }

    function create(pin: DigitalPin): Strip {
        return new Strip(1, pin);
    }

    /**
     * Turns on the led in chosen color 
     * @param color color for the led 
     */
    //% block="light on in %color"
    export function setRingColor(color: Colors) {
        let strip = create(DigitalPin.P0)
        strip.showColor(color)
    }

    /**
     * Turns off the led
     */
    //% block="light off"
    export function lightsOFF() {
        let strip = create(DigitalPin.P0)
        let color = Colors.Black
        strip.showColor(color)
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% block="turn on the light in red %red|green %green|blue %blue"
    export function rgb(red: number, green: number, blue: number) {
        let strip = create(DigitalPin.P0)
        strip.showColor(packRGB(red, green, blue));
    }

    function packRGB(a: number, b: number, c: number): number {
        return (((b & 0xFF) << 16) | (a & 0xFF) << 8) | (c & 0xFF);
    }

    enum Servo {
        S0 = 0,
        S1,
        S2,
        S3,
        S4,
        S5
    }
    const I2C_ADDR = 0x33
    function writeReg(reg: number, data: Buffer) {
        let buf = pins.createBuffer(data.length + 1)
        buf[0] = reg
        for (let i = 0; i < data.length; i++) {
            buf[i + 1] = data[i]
        }
        pins.i2cWriteBuffer(I2C_ADDR, buf)
    }

    let initialized = false

    function initDFR() {
        if (!initialized) {
            initialized = true
            basic.pause(100)
        }
    }

    /**
     * Sets servo angle 
     * @param servo servo chosen 
     * @param angle angle in degrees between 0 and 180 
     */
    //% block="set servo angle %angle"
    //% angle.min=0 angle.max=180
    export function setServoAngle(angle: number) {
        initDFR()

        let s = Servo.S0

        angle = Math.clamp(0, 180, angle)
        let period = 500 + angle * 11

        let buf = pins.createBuffer(2)
        buf[0] = (period >> 8) & 0xFF
        buf[1] = period & 0xFF

        writeReg(0x18 + s * 2, buf)
    }

    export enum Action {
        //%block=open
        open,
        //%block=close
        close
    }
    
        /**
     * Opens or closes the barrier setting servo angle at 5° or 115°
     * @param action open=servo angle at 115° and close=servo angle at 5° 
     */
    //%block="%action barrier"
    export function barrier(action: Action){
        if (action == Action.open){
            setServoAngle(115)
        }
        else if (action == Action.close){
            setServoAngle(5)
        }
    }

    enum IO {
        C0 = 0,
        C1,
        C2,
        C3,
        C4,
        C5
    }

    enum GPIOState {
        //% block="LOW"
        Low = 0,
        //% block="HIGH"
        High = 1
    }

    function readReg(reg: number, len: number): Buffer {
        pins.i2cWriteNumber(I2C_ADDR, reg, NumberFormat.UInt8BE)
        return pins.i2cReadBuffer(I2C_ADDR, len)
    }

    export function readDigital(io: IO): number {
        initDFR()
        setDigitalInput(io)
        basic.pause(10)
        return readReg(0x3f + io, 1)[0]
    }

    function setDigitalInput(io: IO) {
        writeReg(0x2c + io, pins.createBufferFromArray([5]))
    }

    /**
     * Returns true if an obstacle is detected in front of the sensor and false otherwise 
     */
    //%block="presence detected"
    export function presenceSensor(): boolean {
        let value = readDigital(IO.C0)

        if (value == 0) {
            return false
        } else {
            return true
        }
    }

}
