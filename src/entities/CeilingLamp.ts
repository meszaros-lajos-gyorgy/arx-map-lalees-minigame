import { Expand } from 'arx-convert/utils'
import { Audio, Entity, EntityConstructorPropsWithoutSrc, EntityModel, Texture } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import { TweakSkin } from 'arx-level-generator/scripting/commands'
import { Interactivity, Variable } from 'arx-level-generator/scripting/properties'

const onTexture = Texture.fromCustomFile({
  filename: '[metal]-light-on.jpg',
  sourcePath: 'textures',
})

const offTexture = Texture.fromCustomFile({
  filename: '[metal]-light-off.jpg',
  sourcePath: 'textures',
})

const lampStartUp = Audio.fromCustomFile({
  filename: 'fluorescent-lamp-startup.wav',
  sourcePath: 'sfx',
})

const lampHum = Audio.fromCustomFile({
  filename: 'fluorescent-lamp-hum.wav',
  sourcePath: 'sfx',
})

const lampPlink = Audio.fromCustomFile({
  filename: 'fluorescent-lamp-plink.wav',
  sourcePath: 'sfx',
})

const glassPop1 = Audio.fromCustomFile({
  filename: 'glass-pop.wav',
  sourcePath: 'sfx',
})

const glassPop2 = Audio.fromCustomFile({
  filename: 'glass-pop2.wav',
  sourcePath: 'sfx',
})

const glassPop3 = Audio.fromCustomFile({
  filename: 'glass-pop3.wav',
  sourcePath: 'sfx',
})

type CeilingLampConstructorProps = Expand<
  EntityConstructorPropsWithoutSrc & {
    isMuted?: boolean
    isOn?: boolean
  }
>

export class CeilingLamp extends Entity {
  propPowerOn: Variable<boolean>
  propIsOn: Variable<boolean>
  propOldIsOn: Variable<boolean>
  propSavedIsOn: Variable<boolean>
  propIsMuted: Variable<boolean>
  propOldIsMuted: Variable<boolean>
  propInstantSwitching: Variable<boolean>
  propCaster: Variable<string>

  constructor({ isOn = false, isMuted = false, ...props }: CeilingLampConstructorProps = {}) {
    super({
      src: 'fix_inter/ceiling_lamp',
      model: new EntityModel({
        sourcePath: './entities',
        filename: 'ceiling_lamp.ftl',
      }),
      ...props,
    })

    this.otherDependencies.push(onTexture, offTexture, lampStartUp, lampHum, lampPlink, glassPop1, glassPop2, glassPop3)

    this.withScript()

    this.propPowerOn = new Variable('global bool', 'power_on', true)
    this.propIsOn = new Variable('bool', 'is_on', isOn)
    this.propOldIsOn = new Variable('bool', 'old_is_on', false, true)
    this.propSavedIsOn = new Variable('bool', 'saved_is_on', false, true)
    this.propIsMuted = new Variable('bool', 'is_muted', isMuted)
    this.propOldIsMuted = new Variable('bool', 'old_is_muted', false, true)
    this.propInstantSwitching = new Variable('bool', 'instant_switching', false)
    this.propCaster = new Variable('string', 'caster', '')

    const startUpSound = new Sound(lampStartUp.filename)
    const humSound = new Sound(lampHum.filename, SoundFlags.Loop | SoundFlags.Unique | SoundFlags.VaryPitch)
    const plinkSound = new Sound(lampPlink.filename)
    const glassPopSounds = [new Sound(glassPop1.filename), new Sound(glassPop2.filename), new Sound(glassPop3.filename)]
    const onSkin = new TweakSkin(Texture.stoneGroundCavesWet05, onTexture)
    const offSkin = new TweakSkin(Texture.stoneGroundCavesWet05, offTexture)

    this.script?.properties.push(
      Interactivity.off,
      this.propPowerOn,
      this.propIsOn,
      this.propOldIsOn,
      this.propSavedIsOn,
      this.propIsMuted,
      this.propOldIsMuted,
      this.propInstantSwitching,
      this.propCaster,
    )

    const turnOnStart = new ScriptSubroutine(
      'turn_on_start',
      () => {
        if (!this.script?.isRoot) {
          return ``
        }

        return `
          spellcast -smfx 1 ignit self // [s] = no anim, [m] = no draw, [f] = no mana required, [x] = no sound
          if (${this.propIsMuted.name} == 0) {
            ${startUpSound.play()}
          }
        `
      },
      'gosub',
    )

    const turnOnEnd = new ScriptSubroutine(
      'turn_on_end',
      () => {
        if (!this.script?.isRoot) {
          return ``
        }

        return `
          ${onSkin.toString()}
          if (${this.propIsMuted.name} == 0) {
            ${humSound.play()}
            ${plinkSound.play()}
          }
        `
      },
      'gosub',
    )

    const turnOffStart = new ScriptSubroutine(
      'turn_off_start',
      () => {
        if (!this.script?.isRoot) {
          return ``
        }

        return `
          spellcast -smfx 1 douse self
        `
      },
      'gosub',
    )

    const turnOffEnd = new ScriptSubroutine(
      'turn_off_end',
      () => {
        if (!this.script?.isRoot) {
          return ``
        }

        return `
          ${offSkin.toString()}
          if (${this.propIsMuted.name} == 0) {
            ${humSound.stop()}
            set §tmp ^rnd_100
            if (§tmp < 33) {
              ${glassPopSounds[0].play()}
            } else {
              if (§tmp < 66) {
                ${glassPopSounds[1].play()}
              } else {
                ${glassPopSounds[2].play()}
              }
            }
          }
        `
      },
      'gosub',
    )

    const switching = new ScriptSubroutine(
      'switching',
      () => {
        if (!this.script?.isRoot) {
          return ``
        }

        return `
          if (${this.propIsOn.name} == ${this.propOldIsOn.name}) {
            accept
          }

          set ${this.propOldIsOn.name} ${this.propIsOn.name}

          if (${this.propCaster.name} == "player") {
            set ${this.propCaster.name} ""
          }

          if (${this.propInstantSwitching.name} == 1) {
            set §anim1 0
          } else {
            set §anim1 ^rnd_5
            mul §anim1 120
          }
          set §anim2 §anim
          inc §anim2 500

          if (${this.propIsOn.name} == 1) {
            TIMERonStart -m 1 §anim1 ${turnOnStart.invoke()}
            TIMERonEnd -m 1 §anim2 ${turnOnEnd.invoke()}
          } else {
            TIMERoffStart -m 1 §anim1 ${turnOffStart.invoke()}
            TIMERoffEnd -m 1 §anim2 ${turnOffEnd.invoke()}
          }
        `
      },
      'goto',
    )

    const mute = new ScriptSubroutine(
      'mute',
      () => {
        return `
          ${humSound.stop()}
          ${startUpSound.stop()}
          ${plinkSound.stop()}
        `
      },
      'gosub',
    )

    const unmute = new ScriptSubroutine(
      'unmute',
      () => {
        return `
          if (${this.propIsOn.name} == 1) {
            ${humSound.play()}
          }
        `
      },
      'gosub',
    )

    const volume = new ScriptSubroutine(
      'volume',
      () => {
        return `
          if (${this.propIsMuted.name} == ${this.propOldIsMuted.name}) {
            accept
          }
        
          set ${this.propOldIsMuted.name} ${this.propIsMuted.name}
        
          if (${this.propIsMuted.name} == 1) {
            ${mute.invoke()}
          } else {
            ${unmute.invoke()}
          }
        `
      },
      'goto',
    )

    this.script?.subroutines.push(turnOnStart, turnOnEnd, turnOffStart, turnOffEnd, switching, mute, unmute, volume)

    this.script
      ?.whenRoot()
      .on('initend', () => {
        return `
          set ${this.propOldIsOn.name} ${this.propIsOn.name}

          if (${this.propIsOn.name} == 1) {
            ${onSkin.toString()}
            if (${this.propIsMuted.name} == 0) {
              ${humSound.play()}
            }
          } else {
            ${offSkin.toString()}
          }
        `
      })
      .on('on', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          set ${this.propIsOn.name} 1

          if (^$param1 == "instant") {
            set ${this.propInstantSwitching.name} 1
          } else {
            set ${this.propInstantSwitching.name} 0
          }

          ${switching.invoke()}
        `
      })
      .on('off', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          set ${this.propIsOn.name} 0

          if (^$param1 == "instant") {
            set ${this.propInstantSwitching.name} 1
          } else {
            set ${this.propInstantSwitching.name} 0
          }

          ${switching.invoke()}
        `
      })
      .on('save', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          set ${this.propSavedIsOn.name} ${this.propIsOn.name}
        `
      })
      .on('restore', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          set ${this.propIsOn.name} ${this.propSavedIsOn.name}

          ${switching.invoke()}
        `
      })
      .on('random', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          if (^rnd_100 > 50) {
            set ${this.propIsOn.name} 1
          } else {
            set ${this.propIsOn.name} 0
          }

          if (^$param1 == "instant") {
            set ${this.propInstantSwitching.name} 1
          } else {
            set ${this.propInstantSwitching.name} 0
          }

          ${switching.invoke()}
        `
      })
      .on('hit', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          if (^$param2 == "spell") {
            if (lightning_strike isin ^$param3) {
              set ${this.propCaster.name} ~^sender~
              sendevent on self nop
            }
            if (douse isin ^$param3) {
              sendevent off self nop
            }
          }

          refuse
        `
      })
      .on('mute', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          set ${this.propIsMuted.name} 1
          ${volume.invoke()}
        `
      })
      .on('unmute', () => {
        return `
          if (${this.propPowerOn.name} == 0) {
            accept
          }

          set ${this.propIsMuted.name} 0
          ${volume.invoke()}
        `
      })
  }
}
