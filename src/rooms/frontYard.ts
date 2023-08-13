import { Entity, Rotation, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { Interactivity, Scale } from 'arx-level-generator/scripting/properties'
import { times } from 'arx-level-generator/utils/faux-ramda'
import { pickRandom, randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { Crickets } from '@/entities/Crickets.js'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createOutdoorLight } from '@/prefabs/outdoorLight.js'

export const createFrontYard = async (gameStateManager: Entity, gameVariants: PCGameVariant[]) => {
  // "around the corner and small alley" part

  const game1 = new PCGame({
    variant: gameVariants[0],
    position: new Vector3(1700, -5, -50),
    orientation: new Rotation(MathUtils.degToRad(45), MathUtils.degToRad(80), MathUtils.degToRad(15)),
  })
  game1.script?.on('inventoryin', () => `sendevent player_found_a_game ${gameStateManager.ref} ${game1.variant}`)

  const fern = Entity.fern.withScript()
  fern.position = new Vector3(1650, 0, -60)
  fern.orientation = new Rotation(0, MathUtils.degToRad(90), 0)
  fern.script?.properties.push(Interactivity.off, new Scale(2))

  const runeComunicatum = new Rune('comunicatum')

  const barrel = Entity.barrel
  barrel.position = new Vector3(1650, 0, -960)
  barrel.withScript()
  barrel.script?.properties.push(new Scale(0.7))
  barrel.script?.on('init', () => {
    return `inventory addfromscene ${runeComunicatum.ref}`
  })

  const wallLight1 = createOutdoorLight({ position: new Vector3(1000, -180, -600) })
  const wallLight2 = createOutdoorLight({ position: new Vector3(1475, -180, -600) })

  const crickets: Entity[] = []
  for (let i = 0; i < 6; i++) {
    const cricket = new Crickets({
      position: new Vector3(
        1800 - i * 600 + randomBetween(-100, 100),
        randomBetween(0, -300),
        -1500 + randomBetween(-300, 300),
      ),
    })
    crickets.push(cricket)
  }

  // ----------

  // "the dark end of the front yard" part

  const game2 = new PCGame({
    variant: gameVariants[1],
    position: new Vector3(-1650, -5, -670),
  })
  game2.script?.on('inventoryin', () => `sendevent player_found_a_game ${gameStateManager.ref} ${game2.variant}`)

  const randomJunk = times(
    () => {
      const item = pickRandom([
        Entity.brokenBottle,
        Entity.brokenShield,
        Entity.brokenStool,
        Entity.akbaaBloodChickenHead,
      ]).withScript()

      item.position = game2.position
        .clone()
        .add(new Vector3(randomBetween(-30, 80), randomBetween(-5, 5), randomBetween(-50, 50)))

      item.orientation = new Rotation(
        MathUtils.degToRad(randomBetween(-45, 45)),
        MathUtils.degToRad(randomBetween(0, 360)),
        MathUtils.degToRad(randomBetween(-45, 45)),
      )

      return item
    },
    Math.round(randomBetween(7, 12)),
  )

  return {
    meshes: [...wallLight1.meshes, ...wallLight2.meshes],
    entities: [game1, fern, runeComunicatum, barrel, game2, ...randomJunk, ...crickets],
    lights: [...wallLight1.lights, ...wallLight2.lights],
  }
}
