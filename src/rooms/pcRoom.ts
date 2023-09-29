import { Audio, Color, Entity, Rotation, Settings, Vector3 } from 'arx-level-generator'
import { LightDoor } from 'arx-level-generator/prefabs/entity'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Interactivity, Shadow } from 'arx-level-generator/scripting/properties'
import { createLight } from 'arx-level-generator/tools'
import { MathUtils } from 'three'
import { goblinVoiceThisGameIsShit } from '@/audios.js'
import { PCGame } from '@/entities/PCGame.js'
import { createComputer } from '@/prefabs/computer.js'
import { createTable } from '@/prefabs/table.js'
import { RoomContents } from '@/types.js'

const bigRigsGameplay = Audio.fromCustomFile({
  filename: 'big_rigs_gameplay.wav',
  sourcePath: './sfx',
})

const keyboardRage = Audio.fromCustomFile({
  filename: 'keyboard_rage.wav',
  sourcePath: './sfx',
})

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
  tippedStool.script?.on('emit_sound__big_rigs_gameplay', () => `play big_rigs_gameplay`)
  tippedStool.script?.on('emit_sound__keyboard_rage', () => `play keyboard_rage`)
  tippedStool.script?.on('emit_sound__rope_tighten', () => `play bow_start`)
  tippedStool.script?.on('emit_sound__stool_tip_over', () => `play weapons_club_club`)

  const hangedGoblin = Entity.hangedGob.withScript().at({
    position: new Vector3(505, -120, 260),
    orientation: new Rotation(0, MathUtils.degToRad(180 - 45), 0),
  })
  hangedGoblin.otherDependencies.push(...Object.values(goblinVoiceThisGameIsShit), bigRigsGameplay, keyboardRage)
  hangedGoblin.script?.on('init', () => {
    return `objecthide ${hangedGoblin.ref} yes`
  })

  hangedGoblin.script?.on('emit_sound__goblin_step', () => `play goblin_step1a`)
  hangedGoblin.script?.on('emit_sound__me_too_strong', () => `speak [goblin_comeback3]`) // "aha, me too strong for you!"
  hangedGoblin.script?.on('emit_sound__what_now', () => `speak [goblin_victory2]`) // "oh, what now?"
  hangedGoblin.script?.on('emit_sound__damn', () => `speak [goblin_damn]`) // "damn!!"
  hangedGoblin.script?.on('emit_sound__this_game_is_shit', () => `speak [goblin_this_game_is_shit]`) // "this game is shit!"
  hangedGoblin.script?.on('emit_sound__death', () => `speak [goblin_gni2]`) // "ghniiii...."

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
  door.script?.on('lock', () => {
    return `
      if (§unlock == 0) {
        accept
      }

      set §unlock 0
      play "door_lock"
    `
  })
  door.script?.on('unlock', () => {
    return `
      if (§unlock == 1) {
        accept
      }

      set §unlock 1
      play "door_wrong_key"
    `
  })

  gameStateManager.script?.on('goblin_vanishes', () => {
    return `
      sendevent close ${door.ref} nop
      sendevent lock ${door.ref} nop
    `
  })

  gameStateManager.script?.on('goblin_suicide', () => {
    const { delay } = useDelay()

    return `
      objecthide ${normalStool.ref} yes

      sendevent change_to_big_rigs ${computer._.screen.ref} nop

      sendevent emit_sound__big_rigs_gameplay ${tippedStool.ref} nop
      ${delay(4000)} sendevent emit_sound__me_too_strong ${hangedGoblin.ref} nop
      ${delay(4000)} sendevent emit_sound__what_now ${hangedGoblin.ref} nop
      ${delay(1650)} sendevent emit_sound__keyboard_rage ${tippedStool.ref} nop
      ${delay(4000)} sendevent emit_sound__damn ${hangedGoblin.ref} nop
      ${delay(800)} sendevent emit_sound__this_game_is_shit ${hangedGoblin.ref} nop

      ${delay(2600)} sendevent emit_sound__goblin_step ${hangedGoblin.ref} nop
      ${delay(1200)} sendevent emit_sound__goblin_step ${hangedGoblin.ref} nop
      ${delay(600)} sendevent emit_sound__goblin_step ${hangedGoblin.ref} nop
      ${delay(1000)} sendevent emit_sound__goblin_step ${hangedGoblin.ref} nop
      ${delay(600)} sendevent emit_sound__goblin_step ${hangedGoblin.ref} nop

      ${delay(400)} sendevent emit_sound__stool_tip_over ${tippedStool.ref} nop
      ${delay(50)} sendevent emit_sound__death ${hangedGoblin.ref} nop
      ${delay(200)} sendevent emit_sound__rope_tighten ${tippedStool.ref} nop

      ${delay(3000)} sendevent unlock ${door.ref} nop
      ${delay()} objecthide ${tippedStool.ref} no
      ${delay()} objecthide ${hangedGoblin.ref} no
      ${delay()} objecthide ${bigRigs.ref} no
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
