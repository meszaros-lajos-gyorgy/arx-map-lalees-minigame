import { Entity, Settings, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { randomBetween } from 'arx-level-generator/utils/random'
import { RoomContents } from '@/types.js'

export const createBackrooms = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  const roomOrigin = new Vector3(0, 3300, 0)

  const aam = new Rune('folgora', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })

  const folgora = new Rune('folgora', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })

  const taar = new Rune('taar', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })

  const spawn = Entity.marker.at({
    position: roomOrigin.clone(),
  })

  return {
    meshes: [],
    entities: [spawn, aam, folgora, taar],
    lights: [],
    zones: [],
    _: { spawn },
  }
}
