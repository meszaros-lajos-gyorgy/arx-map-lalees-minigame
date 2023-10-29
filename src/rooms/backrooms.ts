import { Entity, Settings, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { ControlZone } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { randomBetween } from 'arx-level-generator/utils/random'
import { CeilingLamp } from '@/entities/CeilingLamp.js'
import { createCeilingLight } from '@/prefabs/ceilingLight.js'
import { RoomContents } from '@/types.js'

export const createBackrooms = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  const roomOrigin = new Vector3(0, -3350, 0)

  const aam = new Rune('aam', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })

  const folgora = new Rune('folgora', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })

  const taar = new Rune('taar', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })

  const spawnZone = createZone({
    position: roomOrigin.clone(),
    size: new Vector3(100, 100, 100),
    name: 'backrooms',
  })

  const spawn = Entity.marker.withScript().at({
    position: roomOrigin.clone(),
  })
  spawn.script?.properties.push(new ControlZone(spawnZone))
  spawn.script?.on('controlledzone_enter', () => {
    return `herosay "entered the backrooms"`
  })

  const rootCeilingLamp = new CeilingLamp()
  rootCeilingLamp.script?.makeIntoRoot()

  const ceilingLights = [
    createCeilingLight({
      position: roomOrigin.clone().add(new Vector3(0, -290, 0)),
      radius: 800,
      isOn: true,
    }),
    createCeilingLight({ position: roomOrigin.clone().add(new Vector3(0, -290, 900)) }),
  ]

  return {
    meshes: [],
    entities: [spawn, aam, folgora, taar, rootCeilingLamp, ...ceilingLights.flatMap(({ entities }) => entities)],
    lights: [...ceilingLights.flatMap(({ lights }) => lights)],
    zones: [spawnZone],
    _: { spawn },
  }
}
