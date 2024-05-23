import { ArxLightFlags } from 'arx-convert/types'
import { Color, Vector3 } from 'arx-level-generator'
import { createLight } from 'arx-level-generator/tools'
import { CeilingLamp } from '@/entities/CeilingLamp.js'

type createCeilingLightProps = {
  position: Vector3
  /**
   * default value is 800
   */
  radius?: number
  /**
   * default value is false
   */
  isOn?: boolean
}

export const createCeilingLight = ({ position, radius = 800, isOn = false }: createCeilingLightProps) => {
  const entity = new CeilingLamp({ position, isOn })

  const light = createLight({
    position: position.clone().add(new Vector3(0, 50, 0)),
    fallStart: 100,
    radius,
    intensity: 1.8,
    color: Color.white,
  })
  // light.exFlicker: toArxColor(toRgba('#1f1f07')),
  light.flags =
    ArxLightFlags.SemiDynamic |
    ArxLightFlags.Extinguishable |
    ArxLightFlags.NoIgnit |
    (isOn ? ArxLightFlags.None : ArxLightFlags.StartExtinguished)

  return {
    entities: [entity],
    lights: [light],
  }
}
