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
