import { Entity, Rotation, Vector3 } from 'arx-level-generator'
import { LightDoor, Rune } from 'arx-level-generator/prefabs/entity'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { createCounter } from '@/prefabs/counter.js'

export const createBathRoom = async (gameStateManager: Entity) => {
  const nhi = new Rune('nhi', {
    position: new Vector3(1051, -87, 502),
    orientation: new Rotation(0, MathUtils.degToRad(57), 0),
  })

  const counter = createCounter({
    position: new Vector3(1000, -100, 500),
    angleY: randomBetween(-2, 2),
  })

  const door = new LightDoor({
    isLocked: true,
    position: new Vector3(850, -200, 120),
    orientation: new Rotation(0, MathUtils.degToRad(-90), MathUtils.degToRad(180)),
  })

  return {
    meshes: [...counter.meshes],
    entities: [nhi, ...counter.entities, door],
    lights: [],
    _: {
      door,
    },
  }
}
