import { Entity, Rotation, Settings, Vector3 } from 'arx-level-generator'
import { CatacombHeavyDoor } from 'arx-level-generator/prefabs/entity'
import { Scale } from 'arx-level-generator/scripting/properties'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { Crickets } from '@/entities/Crickets.js'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createMoon } from '@/prefabs/moon.js'
import { createOutdoorLight } from '@/prefabs/outdoorLight.js'
import { createTree } from '@/prefabs/tree.js'
import { RoomContents } from '@/types.js'

export const createBackYard = async (
  settings: Settings,
  gameStateManager: Entity,
  gameVariant: PCGameVariant,
): Promise<RoomContents> => {
  const moon = createMoon({
    position: new Vector3(300, -750, 1500),
    size: 30,
    lightRadius: 1500,
    moonOffset: new Vector3(100, 100, 50),
  })

  const tree = await createTree({
    position: new Vector3(200, -10, 1300),
    scale: 0.7,
    orientation: new Rotation(0, MathUtils.degToRad(70), 0),
  })

  const door = new CatacombHeavyDoor({
    position: new Vector3(100, 10, 565),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })
  door.script?.properties.push(new Scale(1.35))

  const game = new PCGame({
    variant: gameVariant,
    position: new Vector3(240, -3, 1380),
    orientation: new Rotation(MathUtils.degToRad(-60), MathUtils.degToRad(-90), 0),
  })
  game.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game.variant}`
  })

  const crickets: Entity[] = [
    new Crickets({ position: new Vector3(500, randomBetween(0, -300), 1800) }),
    new Crickets({ position: new Vector3(-700, randomBetween(0, -300), 1500) }),
    new Crickets({ position: new Vector3(0, randomBetween(0, -300), 2100) }),
  ]

  const wallLight1 = createOutdoorLight({ position: new Vector3(-300, -180, 600), angleY: 180 })
  const wallLight2 = createOutdoorLight({ position: new Vector3(300, -180, 600), angleY: 180 })

  return {
    meshes: [...moon.meshes, ...tree, ...wallLight1.meshes, ...wallLight2.meshes],
    entities: [door, game, ...crickets],
    lights: [...moon.lights, ...wallLight1.lights, ...wallLight2.lights],
    zones: [],
    _: {},
  }
}
