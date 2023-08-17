import { Entity, Rotation, Settings, Vector3 } from 'arx-level-generator'
import { LightDoor, Rune } from 'arx-level-generator/prefabs/entity'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { MirrorOnWall } from '@/entities/MirrorOnWall.js'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createCounter } from '@/prefabs/counter.js'

export const createBathRoom = async (settings: Settings, gameStateManager: Entity, gameVariant: PCGameVariant) => {
  const nhi = new Rune('nhi', {
    position: new Vector3(942, -87, 462),
    orientation: new Rotation(0, MathUtils.degToRad(137), 0),
  })

  const counter = createCounter({
    position: new Vector3(1000, -100, 500),
    angleY: randomBetween(-2, 2),
  })

  counter._.leftDoor.isLocked = true
  counter._.rightDoor.isLocked = true

  const door = new LightDoor({
    isLocked: settings.mode === 'production',
    position: new Vector3(840, -200, 120),
    orientation: new Rotation(0, MathUtils.degToRad(-90), MathUtils.degToRad(180)),
  })

  const game = new PCGame({
    variant: gameVariant,
    position: new Vector3(1050, 0, 480),
    orientation: new Rotation(0, MathUtils.degToRad(90), 0),
  })
  game.script?.on('init', () => {
    return `objecthide self yes`
  })
  game.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game.variant}`
  })

  const mirrorOnWall = new MirrorOnWall({
    position: new Vector3(1000, -130, 540),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })
  mirrorOnWall.script?.on('mounted', () => {
    return `
      sendevent open ${counter._.leftDoor.ref} nop
      sendevent open ${counter._.rightDoor.ref} nop
      objecthide ${game.ref} no
    `
  })

  const jar = new Entity({
    src: 'items/movable/jar',
    position: new Vector3(1055, -87, 520),
    orientation: new Rotation(0, MathUtils.degToRad(45), 0),
  })
  jar.withScript()

  return {
    meshes: [...counter.meshes],
    entities: [nhi, ...counter.entities, door, mirrorOnWall, game, jar],
    lights: [],
    zones: [],
    _: {
      door,
    },
  }
}
