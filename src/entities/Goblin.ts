import { Audio, Entity, EntityConstructorPropsWithoutSrc } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Invulnerability, Variable } from 'arx-level-generator/scripting/properties'

// speech/english:

// Goblin_misc6.wav = "Me want play cards!" -> "Me want play ..."
// Goblin_taste_water.wav = "This water is taste like shit!" -> "... shit ..."
// Goblin_engaged.wav "Engaged!" -> "...ga..."
// Goblin_only_gem_dealer_shall_pass.wav "Halt human, you enter goblin kingdom! Humans is ..." -> "...dom"
// Goblin_misc_fish_scared2.wav "... we can't catch fishes!" -> "...es!"

// Goblin_victory3.wav = "Yes, yes, yes! You dead!"

const goblinVoiceYes = Audio.fromCustomFile({
  filename: 'goblin_victory3_shorter.wav',
  sourcePath: './speech',
  type: 'speech',
})

const goblinVoiceWish = Audio.fromCustomFile({
  filename: 'goblin_wants_to_play_games.wav',
  sourcePath: './speech',
  type: 'speech',
})

export class Goblin extends Entity {
  isBusy: Variable<boolean>
  doneSpeaking: ScriptSubroutine

  constructor({ gameStateManager, ...props }: EntityConstructorPropsWithoutSrc & { gameStateManager: Entity }) {
    super({
      src: 'npc/goblin_base',
      ...props,
    })
    this.withScript()

    const isBusy = new Variable('bool', 'busy', false)
    this.isBusy = isBusy

    const doneSpeaking = new ScriptSubroutine('done_speaking', () => {
      return `
        set ${isBusy.name} 0
      `
    })
    this.doneSpeaking = doneSpeaking

    this.script?.subroutines.push(doneSpeaking)

    this.otherDependencies.push(goblinVoiceYes, goblinVoiceWish)

    this.script?.properties.push(Invulnerability.on)
    this.script?.on('chat', () => {
      return `
        if (${isBusy.name} == 1) {
          speak -p [player_not_now]
          accept
        }

        set ${isBusy.name} 1
        speak [goblin_wants_to_play_games] ${doneSpeaking.invoke()}
      `
    })

    this.script?.on('idle', () => {
      return `
        if (${isBusy.name} == 1) {
          accept
        }

        speak [goblin_misc]
      `
    })

    this.script?.on('initend', () => {
      return `TIMERmisc_reflection -i 0 10 sendevent idle self ""`
    })

    this.script?.on('combine', () => {
      return `
        if (${isBusy.name} == 1) {
          speak -p [player_not_now]
          accept
        }

        set ${isBusy.name} 1
        if (^$param1 isclass pcgame) {
          set £variant $~^$param1~__variant

          sendevent goblin_received_a_game ${gameStateManager.ref} ~£variant~

          random 20 {
            // [h] - speak with happy face
            speak -h [goblin_victory3_shorter] ${doneSpeaking.invoke()}
          } else {
            speak [goblin_ok] ${doneSpeaking.invoke()}
          }
  
          destroy ^$param1
        } else {
          // [a] - speak with angry face
          speak -a [goblin_mad] ${doneSpeaking.invoke()}
        }
      `
    })
  }
}
