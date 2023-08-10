import { Audio, Entity, EntityConstructorPropsWithoutSrc } from 'arx-level-generator'

let areCustomSoundsApplied = false

export class Lantern extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc) {
    super({
      src: 'items/provisions/lamp',
      ...props,
    })

    this.withScript()

    Lantern.applyCustomSounds()
  }

  static applyCustomSounds() {
    if (areCustomSoundsApplied) {
      return
    }

    areCustomSoundsApplied = true

    const lanternOn = Audio.fromCustomFile({ filename: 'ui_lantern_on.wav', sourcePath: './sfx' })
    const lanternOff = Audio.fromCustomFile({ filename: 'ui_lantern_off.wav', sourcePath: './sfx' })

    Audio.replace(new Audio({ filename: 'torch_start.wav' }), lanternOn)
    Audio.replace(new Audio({ filename: 'torch_end.wav' }), lanternOff)
  }
}
