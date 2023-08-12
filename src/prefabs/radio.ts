import { ArxPolygonFlags } from 'arx-convert/types'
import { Audio, Material, Rotation, Texture, Vector3 } from 'arx-level-generator'
import { Lever, SoundPlayer } from 'arx-level-generator/prefabs/entity'
import { createBox } from 'arx-level-generator/prefabs/mesh'
import { SoundFlags } from 'arx-level-generator/scripting/classes'
import { Label, Scale } from 'arx-level-generator/scripting/properties'
import { MathUtils, Vector2 } from 'three'

type createRadioProps = {
  position: Vector3
  /**
   * default value is 0
   */
  angleY?: number
  /**
   * default value is 1
   */
  scale?: number
  music: Audio
  /**
   * default value is true
   */
  isOn?: boolean
}

const radioTextures = {
  front: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-front.jpg',
      sourcePath: './textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  back: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-back.jpg',
      sourcePath: './textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  top: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-top.jpg',
      sourcePath: './textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  side: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-side.jpg',
      sourcePath: './textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
  bottom: Material.fromTexture(
    Texture.fromCustomFile({
      filename: 'radio-bottom.jpg',
      sourcePath: './textures',
    }),
    { flags: ArxPolygonFlags.NoShadow },
  ),
}

export const createRadio = ({ position, angleY = 0, scale = 1, music, isOn = true }: createRadioProps) => {
  const boxSize = new Vector3(500 * scale, 300 * scale, 100 * scale)

  const musicPlayer = new SoundPlayer({
    audio: music,
    position: position.clone(),
    flags: SoundFlags.Loop | SoundFlags.Unique,
    autoplay: isOn,
  })

  const radioOnOffLever = new Lever({
    position: position.clone().add(new Vector3(0, -boxSize.y / 5, 0)),
    orientation: new Rotation(MathUtils.degToRad(angleY), MathUtils.degToRad(90), MathUtils.degToRad(-90)),
    isSilent: true,
  })
  radioOnOffLever.isPulled = isOn
  radioOnOffLever.script?.properties.push(new Scale(scale * 3), new Label('turn on/off radio'))
  radioOnOffLever.script?.on('custom', () => {
    return `
      if (^$param1 == "on") {
        ${musicPlayer.on()}
      }
      if (^$param1 == "off") {
        ${musicPlayer.off()}
      }
    `
  })

  const radioMesh = createBox({
    position,
    origin: new Vector2(-1, 0),
    size: boxSize,
    angleY,
    materials: [
      radioTextures.side,
      radioTextures.side,
      radioTextures.bottom,
      radioTextures.top,
      radioTextures.front,
      radioTextures.back,
    ],
  })

  return {
    entities: [musicPlayer, radioOnOffLever],
    meshes: [radioMesh],
  }
}
