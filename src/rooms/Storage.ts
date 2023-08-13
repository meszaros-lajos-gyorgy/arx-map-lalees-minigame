import { Entity, Rotation, Vector3 } from 'arx-level-generator'
import { MathUtils } from 'three'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createTable } from '@/prefabs/table.js'

export const createStorage = async (gameStateManager: Entity, gameVariant: PCGameVariant) => {
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

  const table1a = createTable({ position: new Vector3(552, -80, -172), hasShadow: true })
  const table1b = createTable({ position: new Vector3(552, -160, -172), hasShadow: false })
  const table1c = createTable({ position: new Vector3(552, -240, -172), hasShadow: false })

  const table2a = createTable({ position: new Vector3(862, -80, -172), hasShadow: true })
  const table2b = createTable({ position: new Vector3(862, -160, -172), hasShadow: false })
  const table2c = createTable({ position: new Vector3(862, -240, -172), hasShadow: false })

  return {
    meshes: [
      ...table1a.meshes,
      ...table1b.meshes,
      ...table1c.meshes,
      ...table2a.meshes,
      ...table2b.meshes,
      ...table2c.meshes,
    ],
    entities: [game, barrel],
    lights: [],
  }
}
