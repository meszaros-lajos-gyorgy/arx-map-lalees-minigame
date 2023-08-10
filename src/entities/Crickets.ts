import { Audio, Vector3 } from 'arx-level-generator'
import { SoundPlayer } from 'arx-level-generator/prefabs/entity'
import { SoundFlags } from 'arx-level-generator/scripting/classes'

const soundOfCrickets = Audio.fromCustomFile({
  filename: 'crickets.wav',
  sourcePath: './sfx',
})

export class Crickets extends SoundPlayer {
  constructor({ position }: { position: Vector3 }) {
    super({
      audio: soundOfCrickets,
      flags: SoundFlags.Loop | SoundFlags.VaryPitch,
      autoplay: true,
      position,
    })
  }
}
