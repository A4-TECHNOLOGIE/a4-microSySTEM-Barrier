## A4 microSySTEM-Barrier

MakeCode extension for the **A4 toll gate model** based on the **DFR1216 expansion board**, **BBC micro:bit**, and various modules connected to the expansion board.

## Product page and teaching resources 

Product information and educational resources are available on 

Website: a4.fr

Product sheet: 

## Purpose 

This extension is designed for an educational toll gate model used in technology lessons. 

## Example 

```typescript
a4_microSySTEM_Barrier.setServoAngle(5)
basic.forever(function () {
    while (a4_microSySTEM_Barrier.readID() != 9434499) {
        a4_microSySTEM_Barrier.setRingColor(a4_microSySTEM_Barrier.Colors.Red)
    }
    a4_microSySTEM_Barrier.setRingColor(a4_microSySTEM_Barrier.Colors.Green)
    a4_microSySTEM_Barrier.setServoAngle(90)
    while (!(a4_microSySTEM_Barrier.presenceSensor())) {
    	
    }
    while (a4_microSySTEM_Barrier.presenceSensor()) {
        a4_microSySTEM_Barrier.setRingColor(a4_microSySTEM_Barrier.Colors.Red)
    }
    a4_microSySTEM_Barrier.setServoAngle(5)
})
````

## License 
````

## License 
