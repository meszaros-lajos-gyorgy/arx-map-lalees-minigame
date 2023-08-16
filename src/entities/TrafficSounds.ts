import { Audio, Vector3 } from 'arx-level-generator'
import { SoundPlayer } from 'arx-level-generator/prefabs/entity'
import { SoundFlags } from 'arx-level-generator/scripting/classes'

const soundOfTraffic = Audio.fromCustomFile({
  filename: 'night-city-ambience.wav',
  sourcePath: './sfx',
})

export class TrafficSounds extends SoundPlayer {
  constructor({ position }: { position: Vector3 }) {
    super({
      audio: soundOfTraffic,
      flags: SoundFlags.Loop | SoundFlags.VaryPitch,
      autoplay: true,
      position,
    })
  }
}
