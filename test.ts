let testTag = 0

a4MicroSystemBarrier.moveBarrier(a4MicroSystemBarrier.BarrierAction.Close)
a4MicroSystemBarrier.setSignalColor(a4MicroSystemBarrier.SignalColor.Red)
a4MicroSystemBarrier.setServoAngle(5)
a4MicroSystemBarrier.setSignalColorValues(255, 100, 0)
a4MicroSystemBarrier.signalOff()
a4MicroSystemBarrier.setSignalColor(a4MicroSystemBarrier.SignalColor.Red)

basic.forever(function () {
    testTag = a4MicroSystemBarrier.tagIdentifier()

    if (testTag != 0) {
        basic.showNumber(testTag)
    }

    if (a4MicroSystemBarrier.vehicleDetected()) {
        basic.showIcon(IconNames.Yes)
    }

    basic.pause(50)
})
