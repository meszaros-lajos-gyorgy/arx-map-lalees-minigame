import { Entity, Material, Rotation, Settings, Texture, Vector3 } from 'arx-level-generator'
import { createBox } from 'arx-level-generator/prefabs/mesh'
import { Scale, Shadow } from 'arx-level-generator/scripting/properties'
import { circleOfVectors } from 'arx-level-generator/utils'
import { MathUtils } from 'three'
import { GameDisplay } from '@/entities/GameDisplay.js'
import { Mirror } from '@/entities/Mirror.js'
import { PCGameVariant, pcGameVariants } from '@/entities/PCGame.js'
import { RoomContents } from '@/types.js'

export const createLeftCorridor = async (
  settings: Settings,
  gameStateManager: Entity,
  gameVariant: PCGameVariant,
): Promise<RoomContents> => {
  const rootMirror = new Mirror()
  rootMirror.script?.makeIntoRoot()

  const mirror = new Mirror({
    position: new Vector3(-1606, -120, 0),
    orientation: new Rotation(0, MathUtils.degToRad(180), 0),
  })
  mirror.script?.properties.push(new Scale(2), Shadow.off)

  const variants = pcGameVariants.filter((variant) => variant !== 'blank')

  const angle = MathUtils.degToRad(360 / variants.length)
  const theta = angle / 2

  const gameDisplays = circleOfVectors(
    new Vector3(-2500, -105, 0),
    350,
    variants.length,
    theta + MathUtils.degToRad(2.4),
  ).map((position, i) => {
    return new GameDisplay({
      variant: 'blank',
      position,
      orientation: new Rotation(
        MathUtils.degToRad(90) + i * angle + theta,
        MathUtils.degToRad(180),
        MathUtils.degToRad(-90),
      ),
    })
  })

  const bases = circleOfVectors(new Vector3(-2500, -50, 0), 350, variants.length, theta).map((position, i) => {
    return createBox({
      position: position,
      angleY: MathUtils.radToDeg(i * angle + theta),
      materials: Material.fromTexture(new Texture({ filename: 'L3_DISSID_[IRON]_GROUND01.jpg' }), {}),
      size: new Vector3(50, 100, 50),
    })
  })

  return {
    meshes: [...bases],
    entities: [rootMirror, mirror, ...gameDisplays],
    lights: [],
    zones: [],
    _: {},
  }
}
