import { Entity, Rotation, Vector3 } from 'arx-level-generator'
import { Label, Shadow } from 'arx-level-generator/scripting/properties'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createTable } from '@/prefabs/table.js'

export const createPantry = async (gameStateManager: Entity, gameVariant: PCGameVariant) => {
  const game = new PCGame({
    variant: gameVariant,
    position: new Vector3(450, -80, -160),
    orientation: new Rotation(MathUtils.degToRad(80), MathUtils.degToRad(90), 0),
  })
  game.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game.variant}`
  })

  const barrel = Entity.barrel.withScript().at({
    position: new Vector3(935, 0, -485),
  })
  barrel.script?.properties.push(Shadow.off)

  const lowestShelf = -80
  const middleShelf = -160
  const highestShelf = -240

  const table1a = createTable({ position: new Vector3(552, lowestShelf, -172), hasShadow: true })
  const table1b = createTable({ position: new Vector3(552, middleShelf, -172), hasShadow: false })
  const table1c = createTable({ position: new Vector3(552, highestShelf, -172), hasShadow: false })

  const table2a = createTable({ position: new Vector3(862, lowestShelf, -172), hasShadow: true })
  const table2b = createTable({ position: new Vector3(862, middleShelf, -172), hasShadow: false })
  const table2c = createTable({ position: new Vector3(862, highestShelf, -172), hasShadow: false })

  const bathroomKey = Entity.key
    .at({ position: new Vector3(912, middleShelf, -172), orientation: new Rotation(0, MathUtils.degToRad(90), 0) })
    .withScript()
  bathroomKey.script?.properties.push(new Label('[key--bathroom]'))

  const ropes = [
    Entity.rope.at({ position: new Vector3(580, middleShelf, -180 + randomBetween(-5, 5)) }),
    Entity.rope.at({ position: new Vector3(500, middleShelf, -180 + randomBetween(-5, 5)) }),
    Entity.rope.at({ position: new Vector3(760, lowestShelf, -180 + randomBetween(-5, 5)) }),
  ]

  const jar = new Entity({
    src: 'items/movable/jar',
    position: new Vector3(620, lowestShelf, -190),
    orientation: new Rotation(0, MathUtils.degToRad(90), 0),
  })
  jar.withScript()

  return {
    meshes: [
      ...table1a.meshes,
      ...table1b.meshes,
      ...table1c.meshes,
      ...table2a.meshes,
      ...table2b.meshes,
      ...table2c.meshes,
    ],
    entities: [game, barrel, bathroomKey, ...ropes, jar],
    lights: [],
    zones: [],
    _: {
      bathroomKey,
    },
  }
}
