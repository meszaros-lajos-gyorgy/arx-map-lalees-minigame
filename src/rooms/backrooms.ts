import { Entity, Settings, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { ControlZone } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { randomBetween } from 'arx-level-generator/utils/random'
import { CeilingLamp } from '@/entities/CeilingLamp.js'
import { createCeilingLight } from '@/prefabs/ceilingLight.js'
import { createTable } from '@/prefabs/table.js'
import { RoomContents } from '@/types.js'

export const createBackrooms = async (
  settings: Settings,
  gameStateManager: Entity,
  cursors: { origin: Vector3; size: Vector3 }[],
): Promise<RoomContents> => {
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

  const offices = cursors.map(({ origin, size }, idx) => {
    return {
      position: origin.clone().add(new Vector3(0, -size.y + 10, 0)),
      isLampOn: idx === 0,
      lampRadius: Math.max(size.x, size.y, size.z),
    }
  })

  const ceilingLights = offices.map(({ position, isLampOn, lampRadius }) => {
    return createCeilingLight({
      position,
      radius: lampRadius,
      isOn: isLampOn,
    })
  })

  const tableInOffice1 = createTable({
    position: offices[1].position.clone().add(new Vector3(-cursors[1].size.x / 2 + 50, 210, 0)),
    angleY: 90,
  })

  return {
    meshes: [...tableInOffice1.meshes],
    entities: [spawn, aam, folgora, taar, rootCeilingLamp, ...ceilingLights.flatMap(({ entities }) => entities)],
    lights: [...ceilingLights.flatMap(({ lights }) => lights)],
    zones: [spawnZone],
    _: { spawn },
  }
}
