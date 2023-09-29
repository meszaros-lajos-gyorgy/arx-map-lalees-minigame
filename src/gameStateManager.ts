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

  manager.script?.properties.push(numberOfCollectedGames, playerFoundAnyGames, isGoblinReadyForSuicide, isGoblinDead)

  manager.script?.subroutines.push(
    tutorialWelcome,
    tutorialFoundAGame,
    tutorialGaveGameToGoblin,
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

  manager.script?.on('game_collected', () => {
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

  manager.script?.on('player_found_a_game', () => {
    return `
      if (${playerFoundAnyGames.name} == 0) {
        set ${playerFoundAnyGames.name} 1
        ${tutorialFoundAGame.invoke()}
      }
    `
  })

  manager.script?.on('trash_thrown_over_the_fence', () => {
    return `
      if (${haveLittered.name} == 0) {
        set ${haveLittered.name} 1
        ${achievementLittering.invoke()}
      }
    `
  })

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

  manager.script
    ?.on('entered_at_the_game_display_room_zone', vanishGoblin)
    .on('entered_at_the_front_yard_zone', vanishGoblin)

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

  manager.script?.on('entered_at_the_main_hall_zone', killGoblin).on('entered_at_the_entrance_zone', killGoblin)

  return manager
}
