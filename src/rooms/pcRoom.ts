import { Color, Entity, Rotation, Vector3 } from 'arx-level-generator'
import { LightDoor } from 'arx-level-generator/prefabs/entity'
import { Interactivity, Shadow } from 'arx-level-generator/scripting/properties'
import { createLight } from 'arx-level-generator/tools'
import { MathUtils } from 'three'
import { PCGame } from '@/entities/PCGame.js'
import { createComputer } from '@/prefabs/computer.js'
import { createTable } from '@/prefabs/table.js'

export const createPCRoom = async (gameStateManager: Entity) => {
  const table = createTable({ position: new Vector3(600, -80, 500) })

  const computer = createComputer({ position: new Vector3(600, -81, 480) })

  const tippedStool = Entity.seatStool1
  tippedStool.position = new Vector3(490, -43, 250)
  tippedStool.orientation = new Rotation(MathUtils.degToRad(-33), MathUtils.degToRad(-28), MathUtils.degToRad(90))
  tippedStool.withScript()
  tippedStool.script?.properties.push(Shadow.off)
  tippedStool.script?.on('init', () => {
    return `objecthide ${tippedStool.ref} yes`
  })

  const normalStool = Entity.seatStool1
  normalStool.position = new Vector3(620, 0, 430)
  normalStool.withScript()
  normalStool.script?.properties.push(Interactivity.off)

  const bigRigs = new PCGame({
    variant: 'big-rigs',
    position: new Vector3(540, 0, 290),
    orientation: new Rotation(0, MathUtils.degToRad(128), 0),
  })
  bigRigs.script?.on('init', () => {
    return `objecthide ${bigRigs.ref} yes`
  })
  bigRigs.script?.on('inventoryin', () => `sendevent player_found_a_game ${gameStateManager.ref} ${bigRigs.variant}`)

  const ambientLight = createLight({
    position: new Vector3(650, -200, 400),
    radius: 500,
    intensity: 0.3,
    color: Color.fromCSS('pink'),
  })

  const monitorLight = createLight({
    position: new Vector3(617, -113, 450),
    radius: 200,
  })

  const hangedGoblin = Entity.hangedGob
  hangedGoblin.position = new Vector3(505, -120, 260)
  hangedGoblin.orientation = new Rotation(0, MathUtils.degToRad(180 - 45), 0)
  hangedGoblin.withScript()
  hangedGoblin.script?.on('init', () => {
    return `objecthide ${hangedGoblin.ref} yes`
  })

  const door = new LightDoor({
    // isLocked: true,
    position: new Vector3(800, 20, 120),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })

  gameStateManager.script?.on('goblin_died', () => {
    return `
      objecthide ${normalStool.ref} yes

      objecthide ${tippedStool.ref} no
      objecthide ${hangedGoblin.ref} no
      objecthide ${bigRigs.ref} no
    `
  })

  return {
    meshes: [...table.meshes, ...computer.meshes],
    entities: [tippedStool, normalStool, bigRigs, hangedGoblin, door],
    lights: [ambientLight, monitorLight],
  }
}
