import { Color, Entity, Rotation, Settings, Vector3 } from 'arx-level-generator'
import { LightDoor } from 'arx-level-generator/prefabs/entity'
import { Interactivity, Shadow } from 'arx-level-generator/scripting/properties'
import { createLight } from 'arx-level-generator/tools'
import { MathUtils } from 'three'
import { PCGame } from '@/entities/PCGame.js'
import { createComputer } from '@/prefabs/computer.js'
import { createTable } from '@/prefabs/table.js'
import { RoomContents } from '@/types.js'

export const createPCRoom = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  // "normal state" parts

  const normalStool = Entity.seatStool1.withScript().at({ position: new Vector3(620, 0, 430) })
  normalStool.script?.properties.push(Interactivity.off)

  // ----------------------

  // "after suicide" parts

  const tippedStool = Entity.seatStool1.withScript().at({
    position: new Vector3(490, -43, 250),
    orientation: new Rotation(MathUtils.degToRad(-33), MathUtils.degToRad(-28), MathUtils.degToRad(90)),
  })
  tippedStool.script?.properties.push(Shadow.off)
  tippedStool.script?.on('init', () => {
    return `objecthide ${tippedStool.ref} yes`
  })

  const hangedGoblin = Entity.hangedGob.withScript().at({
    position: new Vector3(505, -120, 260),
    orientation: new Rotation(0, MathUtils.degToRad(180 - 45), 0),
  })
  hangedGoblin.script?.on('init', () => {
    return `objecthide ${hangedGoblin.ref} yes`
  })
  hangedGoblin.script?.on('emit_dying_sound', () => {
    return `speak [goblin_gni2]`
  })

  const bigRigs = new PCGame({
    variant: 'big-rigs',
    position: new Vector3(540, 0, 290),
    orientation: new Rotation(0, MathUtils.degToRad(128), 0),
  })
  bigRigs.script
    ?.on('init', () => {
      return `objecthide ${bigRigs.ref} yes`
    })
    .on('inventoryin', () => {
      return `sendevent player_found_a_game ${gameStateManager.ref} ${bigRigs.variant}`
    })

  // ----------------------

  // "general" parts

  const table = createTable({ position: new Vector3(600, -80, 500) })

  const computer = createComputer({ position: new Vector3(600, -81, 480) })

  const ambientLight = createLight({
    position: new Vector3(650, -200, 400),
    radius: 500,
    intensity: 0.3,
    color: Color.fromCSS('pink'),
  })

  const monitorLight = createLight({
    position: new Vector3(601, -100, 440),
    radius: 100,
  })

  const door = new LightDoor({
    position: new Vector3(800, 20, 120),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })

  gameStateManager.script?.on('goblin_suicide', () => {
    return `
      objecthide ${normalStool.ref} yes

      objecthide ${tippedStool.ref} no
      objecthide ${hangedGoblin.ref} no
      objecthide ${bigRigs.ref} no

      sendevent change_to_big_rigs ${computer._.screen.ref} nop
      sendevent emit_dying_sound ${hangedGoblin.ref} nop

      // TODO: close the door
    `
  })

  return {
    meshes: [...table.meshes, ...computer.meshes],
    entities: [tippedStool, normalStool, bigRigs, hangedGoblin, door, ...computer.entities],
    lights: [ambientLight, monitorLight],
    zones: [],
    _: {},
  }
}
