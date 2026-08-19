# a4-microsystem-barrier

![microSySTEM-Barrier](icon.png)

MakeCode extension for the **A4 Technologie microSySTEM-Barrier** educational model for **BBC micro:bit**.

The microSySTEM-Barrier reproduces an automated access barrier such as those used at car parks and toll gates. Students can identify an authorized user with RFID, control the barrier arm, display a red/green access signal and detect when a vehicle has passed through the barrier.

## Product and educational use

The model is designed for technology and computer science education. It can be used to study:

- automated systems;
- information and energy chains;
- RFID identification and access control;
- sensors and actuators;
- conditional programming;
- state-based control sequences;
- safety logic for an automated barrier.

**Product page:**  
https://www.a4.fr/barrier-maquette-programmable-microsystem-pour-micro-bit.html

**Manufacturer:**  
https://www.a4.fr

## Hardware

The microSySTEM-Barrier model uses:

- **BBC micro:bit** – program execution and user interface;
- **DFR1216 expansion board** – connection and power interface;
- **RFID reader** – reads cards and tags used for access control;
- **IR proximity sensor** – detects the vehicle passing through the barrier;
- **servomotor** – opens and closes the barrier arm;
- **RGB LED** – provides red/green visual signalling.

### Connections used by the extension

| Component | Connection |
|---|---|
| RFID reader | UART – P14 / P15 |
| RGB signalling LED | P0 |
| Barrier servomotor | S0 |
| IR proximity sensor | C0 |

## Add the extension in MakeCode

1. Open the [MakeCode editor for micro:bit](https://makecode.microbit.org/).
2. Create or open a project.
3. Select **Extensions**.
4. Paste the repository URL into the search field:

```text
https://github.com/A4-TECHNOLOGIE/a4-microSySTEM-Barrier
```

5. Select the **A4 microSySTEM Barrier** extension.

## Blocks / API

### Read an RFID tag

```typescript
a4MicroSystemBarrier.tagIdentifier()
```

Reads the RFID reader and returns the numerical identifier of the detected tag or card. The function returns `0` when no new valid RFID frame is available.

### Set the signalling light to a predefined color

```typescript
a4MicroSystemBarrier.setSignalColor(a4MicroSystemBarrier.SignalColor.Green)
```

Available predefined colors are red, green, blue, white and off.

### Turn off the signalling light

```typescript
a4MicroSystemBarrier.signalOff()
```

Turns the RGB signalling LED off.

### Set a custom signalling color

```typescript
a4MicroSystemBarrier.setSignalColorValues(255, 100, 0)
```

Sets the signalling LED using red, green and blue channel values from `0` to `255`.

### Set the servomotor angle

```typescript
a4MicroSystemBarrier.setServoAngle(90)
```

Sets the barrier servomotor angle between `0°` and `180°`.

### Open or close the barrier

```typescript
a4MicroSystemBarrier.moveBarrier(a4MicroSystemBarrier.BarrierAction.Open)
a4MicroSystemBarrier.moveBarrier(a4MicroSystemBarrier.BarrierAction.Close)
```

Moves the servomotor to the predefined open or closed position of the microSySTEM-Barrier model.

### Detect a vehicle

```typescript
a4MicroSystemBarrier.vehicleDetected()
```

Returns `true` when the IR proximity sensor detects a vehicle or object and `false` otherwise.

## Example: automated access barrier

The following example authorizes a set of RFID identifiers. When an authorized badge is read, the signal turns green and the barrier opens. As soon as the vehicle is detected, the signal turns red to prevent a second vehicle from following. The barrier closes only after the vehicle has completely passed the proximity sensor.

```typescript
let badge = 0
let badgeIndex = 0

let authorizedRfid = [
    2608171,
    6947423,
    2540442,
    3202542,
    9679242
]

a4MicroSystemBarrier.moveBarrier(
    a4MicroSystemBarrier.BarrierAction.Close
)

a4MicroSystemBarrier.setSignalColor(
    a4MicroSystemBarrier.SignalColor.Red
)

basic.forever(function () {
    badge = a4MicroSystemBarrier.tagIdentifier()

    if (badge != 0) {
        badgeIndex = authorizedRfid.indexOf(badge)

        if (badgeIndex >= 0) {
            basic.showIcon(IconNames.Yes)

            a4MicroSystemBarrier.setSignalColor(
                a4MicroSystemBarrier.SignalColor.Green
            )

            a4MicroSystemBarrier.moveBarrier(
                a4MicroSystemBarrier.BarrierAction.Open
            )

            while (!(a4MicroSystemBarrier.vehicleDetected())) {
                basic.pause(50)
            }

            a4MicroSystemBarrier.setSignalColor(
                a4MicroSystemBarrier.SignalColor.Red
            )

            while (a4MicroSystemBarrier.vehicleDetected()) {
                basic.pause(50)
            }

            basic.pause(500)

            a4MicroSystemBarrier.moveBarrier(
                a4MicroSystemBarrier.BarrierAction.Close
            )
        } else {
            basic.showIcon(IconNames.No)
            a4MicroSystemBarrier.setSignalColor(
                a4MicroSystemBarrier.SignalColor.Red
            )
        }
    }

    basic.pause(50)
})
```

> Replace the values in `authorizedRfid` with the identifiers of the tags or cards used with your model.

## Artificial intelligence extension

The microSySTEM-Barrier can also be associated with the **microSySTEM-AI Vision** model. Visual recognition can complement or replace RFID identification, for example to experiment with OCR-based vehicle identification or recognition of emergency vehicles before opening the barrier.

More information and programming examples are available in the technical and educational documentation for the microSySTEM-AI Vision model.

## License

This extension is released under the **MIT License**. See [LICENSE.txt](LICENSE.txt).

## A4 Technologie

Designed for educational use by **A4 Technologie**.  
https://www.a4.fr

---

for PXT/microbit
