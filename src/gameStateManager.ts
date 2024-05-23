import { Audio, Entity, Settings } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Variable } from 'arx-level-generator/scripting/properties'

const notification = new Sound(Audio.system.filename, SoundFlags.EmitFromPlayer)
const achievement = new Sound(Audio.system3.filename, SoundFlags.EmitFromPlayer)
const levelUp = new Sound('player_level_up', SoundFlags.EmitFromPlayer)

const tutorialWelcome = new ScriptSubroutine('tutorial_welcome', () => {
  return `
    ${notification.play()}
    herosay [tutorial--welcome]
    quest [tutorial--welcome]
  `
})
const tutorialFoundAGame = new ScriptSubroutine('tutorial_found_a_game', () => {
  return `
    ${notification.play()}
    herosay [tutorial--found-a-game]
    quest [tutorial--found-a-game]
  `
})
const tutorialGaveGameToGoblin = new ScriptSubroutine('tutorial_gave_game_to_goblin', () => {
  return `
    ${notification.play()}
    herosay [tutorial--gave-game-to-goblin]
    quest [tutorial--gave-game-to-goblin]
  `
})
const tutorialLandedInBackrooms = new ScriptSubroutine('tutorial_landed_in_backrooms', () => {
  return `
    ${notification.play()}
    herosay [tutorial--backrooms-1]
    quest [tutorial--backrooms-1]
  `
})
const tutorialBackroomsLights = new ScriptSubroutine('tutorial_backrooms_light', () => {
  return `
    ${notification.play()}
    herosay [tutorial--backrooms-2]
    quest [tutorial--backrooms-2]
  `
})

const achievementListenSmall = new ScriptSubroutine('achievement_found_games_small', () => {
  return `
    ${achievement.play()}
    herosay [achievement--collected-games-small]
    quest [achievement--collected-games-small]
  `
})
const achievementListenMedium = new ScriptSubroutine('achievement_found_games_medium', () => {
  return `
    ${achievement.play()}
    herosay [achievement--collected-games-medium]
    quest [achievement--collected-games-medium]
  `
})
const achievementListenLarge = new ScriptSubroutine('achievement_found_games_large', () => {
  return `
    ${achievement.play()}
    herosay [achievement--collected-games-large]
    quest [achievement--collected-games-large]
  `
})

const levelCompleted = new ScriptSubroutine('level_complete', () => {
  return `
    ${levelUp.play()}
    herosay [level-completed]
    quest [level-completed]
  `
})

const achievementLittering = new ScriptSubroutine('achievement_littering', () => {
  return `
    ${achievement.play()}
    herosay [achievement--littering]
    quest [achievement--littering]
  `
})

export const createGameStateManager = (settings: Settings) => {
  const manager = Entity.marker.withScript()

  const numberOfCollectedGames = new Variable('int', 'number_of_collected_games', 0)
  const playerFoundAnyGames = new Variable('bool', 'player_found_any_games', false)
  const isGoblinReadyForSuicide = new Variable('bool', 'is_goblin_ready_for_suicide', false)
  const isGoblinDead = new Variable('bool', 'is_goblin_dead', false)
  const haveLittered = new Variable('bool', 'player_littered', false)
  const landedInBackroomsFirstTime = new Variable('bool', 'landed_in_backrooms_first_time', true)

  const gotAam = new Variable('bool', 'got_aam', false)
  const gotFolgora = new Variable('bool', 'got_folgora', false)
  const gotTaar = new Variable('bool', 'got_taar', false)
  const backroomsLightTutorialDone = new Variable('bool', 'backrooms_light_tutorial_done', false)

  manager.script?.properties.push(
    numberOfCollectedGames,
    playerFoundAnyGames,
    isGoblinReadyForSuicide,
    isGoblinDead,
    haveLittered,
    landedInBackroomsFirstTime,
    gotAam,
    gotFolgora,
    gotTaar,
    backroomsLightTutorialDone,
  )

  manager.script?.subroutines.push(
    tutorialWelcome,
    tutorialFoundAGame,
    tutorialGaveGameToGoblin,
    tutorialLandedInBackrooms,
    tutorialBackroomsLights,
    achievementListenSmall,
    achievementListenMedium,
    achievementListenLarge,
    levelCompleted,
    achievementLittering,
  )

  if (settings.mode === 'production') {
    manager.script?.on('init', () => {
      return `
        TIMERwelcome -m 1 3000 ${tutorialWelcome.invoke()}
      `
    })
  }

  const vanishGoblin = () => {
    return `
      if (${numberOfCollectedGames.name} < 7) {
        accept
      }

      if (${isGoblinDead.name} == 1) {
        accept
      }

      if (${isGoblinReadyForSuicide.name} == 1) {
        accept
      }

      set ${isGoblinReadyForSuicide.name} 1
      sendevent goblin_vanishes self nop
    `
  }

  const killGoblin = () => {
    return `
      if (${numberOfCollectedGames.name} < 7) {
        accept
      }

      if (${isGoblinReadyForSuicide.name} == 0) {
        accept
      }

      if (${isGoblinDead.name} == 1) {
        accept
      }

      set ${isGoblinDead.name} 1
      sendevent goblin_suicide self nop
    `
  }

  manager.script
    ?.on('game_collected', () => {
      const { delay } = useDelay()

      return `
        if (${playerFoundAnyGames.name} == 0) {
          set ${playerFoundAnyGames.name} 1
        }

        inc ${numberOfCollectedGames.name} 1

        if (${numberOfCollectedGames.name} == 1) {
          ${tutorialGaveGameToGoblin.invoke()}
        }
        if (${numberOfCollectedGames.name} == 2) {
          ${achievementListenSmall.invoke()}
        }
        if (${numberOfCollectedGames.name} == 5) {
          ${achievementListenMedium.invoke()}
        }
        if (${numberOfCollectedGames.name} == 8) {
          ${achievementListenLarge.invoke()}
          ${delay(1000)} ${levelCompleted.invoke()}
        }
      `
    })
    .on('player_found_a_game', () => {
      return `
        if (${playerFoundAnyGames.name} == 0) {
          set ${playerFoundAnyGames.name} 1
          ${tutorialFoundAGame.invoke()}
        }
      `
    })
    .on('entity_over_fence', () => {
      return `
        if (^$param1 isgroup "junk") {
          if (${haveLittered.name} == 0) {
            set ${haveLittered.name} 1
            ${achievementLittering.invoke()}
          }
        } else {
          if (^$param1 == "player") {
            sendevent send_to_backrooms player nop
          }
        }
      `
    })
    .on('entered_at_the_game_display_room_zone', vanishGoblin)
    .on('entered_at_the_front_yard_zone', vanishGoblin)
    .on('entered_at_the_main_hall_zone', killGoblin)
    .on('entered_at_the_entrance_zone', killGoblin)
    .on('player_leaves_backrooms', () => {
      return `sendevent send_to_spawn player nop`
    })
    .on('landed_in_backrooms', () => {
      return `
        if (${landedInBackroomsFirstTime.name} == 1) {
          set ${landedInBackroomsFirstTime.name} 0
          ${tutorialLandedInBackrooms.invoke()}
        }
      `
    })
    .on('got_rune', () => {
      return `
        if (^$param1 == "aam") {
          set ${gotAam.name} 1
        }
        if (^$param1 == "folgora") {
          set ${gotFolgora.name} 1
        }
        if (^$param1 == "taar") {
          set ${gotTaar.name} 1
        }

        if (${gotAam.name} == 1) {
          if (${gotFolgora.name} == 1) {
            if (${gotTaar.name} == 1) {
              if (${backroomsLightTutorialDone.name} == 0) {
                set ${backroomsLightTutorialDone.name} 1
                ${tutorialBackroomsLights.invoke()}
              }
            }
          }
        }
      `
    })

  return manager
}
