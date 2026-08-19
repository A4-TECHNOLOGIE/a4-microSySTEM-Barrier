//% weight=100 color=#F29C00 icon="\uf2db" block="A4 microSySTEM Barrier"
//% groups='["RFID", "Signal light", "Barrier", "Vehicle sensor"]'
namespace a4MicroSystemBarrier {
    const dfrAddress = 0x33
    const signalPin = DigitalPin.P0
    const rfidRxPin = SerialPin.P14
    const rfidTxPin = SerialPin.P15

    let dfrInitialized = false
    let rfidInitialized = false
    let rfidBuffer = ""

    export enum SignalColor {
        //% block="red"
        Red = 0xFF0000,
        //% block="green"
        Green = 0x00FF00,
        //% block="blue"
        Blue = 0x0000FF,
        //% block="white"
        White = 0xFFFFFF,
        //% block="off"
        Off = 0x000000
    }

    export enum BarrierAction {
        //% block="open"
        Open,
        //% block="close"
        Close
    }

    enum ServoPort {
        S0 = 0
    }

    enum IoPort {
        C0 = 0,
        C1,
        C2,
        C3,
        C4,
        C5
    }

    function hexCharValue(character: string): number {
        const digits = "0123456789ABCDEF"
        return digits.indexOf(character)
    }

    function hexToDecimal(hexValue: string): number {
        let result = 0
        hexValue = hexValue.toUpperCase()

        for (let index = 0; index < hexValue.length; index++) {
            const value = hexCharValue(hexValue.charAt(index))
            if (value < 0) return 0
            result = result * 16 + value
        }

        return result
    }

    function isHexChar(character: string): boolean {
        const code = character.charCodeAt(0)
        if (code >= 48 && code <= 57) return true
        if (code >= 65 && code <= 70) return true
        if (code >= 97 && code <= 102) return true
        return false
    }

    function extractLastValidFrame(data: string): string {
        let hexOnly = ""

        for (let index = 0; index < data.length; index++) {
            const character = data.charAt(index)
            if (isHexChar(character)) {
                hexOnly += character.toUpperCase()
            }
        }

        if (hexOnly.length < 12) return ""
        return hexOnly.substr(hexOnly.length - 12, 12)
    }

    function initRfid(): void {
        if (!rfidInitialized) {
            serial.redirect(rfidTxPin, rfidRxPin, BaudRate.BaudRate9600)
            serial.setRxBufferSize(64)
            rfidBuffer = ""
            rfidInitialized = true
            basic.pause(100)
        }
    }

    function initDfr(): void {
        if (!dfrInitialized) {
            dfrInitialized = true
            basic.pause(100)
        }
    }

    function writeRegister(registerAddress: number, data: Buffer): void {
        const buffer = pins.createBuffer(data.length + 1)
        buffer[0] = registerAddress
        for (let index = 0; index < data.length; index++) {
            buffer[index + 1] = data[index]
        }
        pins.i2cWriteBuffer(dfrAddress, buffer)
    }

    function readRegister(registerAddress: number, length: number): Buffer {
        pins.i2cWriteNumber(dfrAddress, registerAddress, NumberFormat.UInt8BE)
        return pins.i2cReadBuffer(dfrAddress, length)
    }

    function setDigitalInput(port: IoPort): void {
        writeRegister(0x2c + port, pins.createBufferFromArray([5]))
    }

    function readDigital(port: IoPort): number {
        initDfr()
        setDigitalInput(port)
        basic.pause(10)
        return readRegister(0x3f + port, 1)[0]
    }

    function showSignalColor(rgbColor: number): void {
        const red = (rgbColor >> 16) & 0xFF
        const green = (rgbColor >> 8) & 0xFF
        const blue = rgbColor & 0xFF
        const buffer = pins.createBuffer(3)

        // WS2812 uses GRB byte order.
        buffer[0] = green
        buffer[1] = red
        buffer[2] = blue

        light.sendWS2812Buffer(buffer, signalPin)
    }

    /**
     * Reads an RFID tag and returns its numerical identifier.
     * Returns 0 when no new valid RFID frame is available.
     */
    //% blockId=a4_barrier_tag_identifier
    //% block="read RFID tag"
    //% weight=100
    //% group="RFID"
    export function tagIdentifier(): number {
        initRfid()
        rfidBuffer += serial.readString()

        const frame = extractLastValidFrame(rfidBuffer)

        if (rfidBuffer.length > 64) {
            rfidBuffer = rfidBuffer.substr(rfidBuffer.length - 64, 64)
        }

        if (frame.length == 12) {
            const identifierHex = frame.substr(2, 8)
            rfidBuffer = ""
            return hexToDecimal(identifierHex)
        }

        return 0
    }

    /**
     * Sets the RGB signalling light to a predefined color.
     * @param color color used by the signalling light
     */
    //% blockId=a4_barrier_signal_color
    //% block="set signal light to %color"
    //% weight=90
    //% group="Signal light"
    export function setSignalColor(color: SignalColor): void {
        showSignalColor(color)
    }

    /**
     * Turns off the RGB signalling light.
     */
    //% blockId=a4_barrier_signal_off
    //% block="turn signal light off"
    //% weight=80
    //% group="Signal light"
    export function signalOff(): void {
        showSignalColor(SignalColor.Off)
    }

    /**
     * Sets a custom RGB signalling color.
     * @param red red channel value from 0 to 255, eg: 255
     * @param green green channel value from 0 to 255, eg: 100
     * @param blue blue channel value from 0 to 255, eg: 0
     */
    //% blockId=a4_barrier_signal_values
    //% block="set signal light red %red green %green blue %blue"
    //% red.min=0 red.max=255 red.defl=255
    //% green.min=0 green.max=255 green.defl=100
    //% blue.min=0 blue.max=255 blue.defl=0
    //% inlineInputMode=inline
    //% weight=70
    //% group="Signal light"
    export function setSignalColorValues(red: number, green: number, blue: number): void {
        red = Math.clamp(0, 255, red)
        green = Math.clamp(0, 255, green)
        blue = Math.clamp(0, 255, blue)
        showSignalColor((red << 16) | (green << 8) | blue)
    }

    /**
     * Sets the barrier servomotor angle.
     * @param angle angle in degrees from 0 to 180, eg: 90
     */
    //% blockId=a4_barrier_servo_angle
    //% block="set servo angle %angle"
    //% angle.min=0 angle.max=180 angle.defl=90
    //% weight=80
    //% group="Barrier"
    export function setServoAngle(angle: number): void {
        initDfr()

        angle = Math.clamp(0, 180, angle)
        const period = 500 + angle * 11
        const buffer = pins.createBuffer(2)
        const servo = ServoPort.S0

        buffer[0] = (period >> 8) & 0xFF
        buffer[1] = period & 0xFF
        writeRegister(0x18 + servo * 2, buffer)
    }

    /**
     * Opens or closes the barrier using the predefined positions of the model.
     * @param action requested barrier movement
     */
    //% blockId=a4_barrier_move
    //% block="%action barrier"
    //% weight=100
    //% group="Barrier"
    export function moveBarrier(action: BarrierAction): void {
        if (action == BarrierAction.Open) {
            setServoAngle(115)
        } else {
            setServoAngle(5)
        }
    }

    /**
     * Returns true when the IR proximity sensor detects a vehicle or object.
     */
    //% blockId=a4_barrier_vehicle_detected
    //% block="vehicle detected"
    //% weight=100
    //% group="Vehicle sensor"
    export function vehicleDetected(): boolean {
        return readDigital(IoPort.C0) != 0
    }
}
