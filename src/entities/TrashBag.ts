import { Expand } from 'arx-convert/utils'
import { Audio, Entity, EntityConstructorPropsWithoutSrc, EntityModel } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Sound, SoundFlags } from 'arx-level-generator/scripting/classes'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Label, Variable } from 'arx-level-generator/scripting/properties'
import { getLowestPolygonIdx, loadOBJ, normalizeUV } from 'arx-level-generator/tools/mesh'
import { randomIntBetween } from 'arx-level-generator/utils/random'
import { Vector2 } from 'three'

type TrashBagConstructorProps = Expand<EntityConstructorPropsWithoutSrc & {}>

const trashBagMesh = await loadOBJ('entities/garbage_bag/garbage_bag', {
  centralize: true,
  verticalAlign: 'bottom',
  scale: 0.013,
  scaleUV: new Vector2(1, -1),
})

normalizeUV(trashBagMesh.meshes[0].geometry)

const flyAudios = [
  Audio.fromCustomFile({ filename: 'flies1.wav', type: 'sfx', sourcePath: 'sfx' }),
  Audio.fromCustomFile({ filename: 'flies2.wav', type: 'sfx', sourcePath: 'sfx' }),
  Audio.fromCustomFile({ filename: 'flies3.wav', type: 'sfx', sourcePath: 'sfx' }),
  Audio.fromCustomFile({ filename: 'flies4.wav', type: 'sfx', sourcePath: 'sfx' }),
]

const flySounds = flyAudios.map((audio) => {
  return new Sound(audio.filename, SoundFlags.VaryPitch)
})

export class TrashBag extends Entity {
  constructor({ ...props }: TrashBagConstructorProps) {
    super({
      src: 'items/movable/trash_bag',
      model: EntityModel.fromThreeJsObj(trashBagMesh.meshes[0], {
        filename: 'trash_bag.ftl',
        sourcePath: 'entities/garbage_bag',
        originIdx: getLowestPolygonIdx(trashBagMesh.meshes[0].geometry),
      }),
      otherDependencies: [...flyAudios, ...trashBagMesh.materials],
      ...props,
    })

    this.withScript()

    this.script?.properties.push(new Label('[trash-bag]'))

    const oneInFour = new Variable('int', 'one_in_four', 0)

    const playFlySound = new ScriptSubroutine(
      'play_fly_sound',
      () => {
        return `
          set ${oneInFour.name} ^rnd_100
          if (${oneInFour.name} < 25) {
            ${flySounds[0].play()}
          } else {
            if (${oneInFour.name} < 50) {
              ${flySounds[1].play()}
            } else {
              if (${oneInFour.name} < 75) {
                ${flySounds[2].play()}
              } else {
                ${flySounds[3].play()}
              }
            }
          }
        `
      },
      'goto',
    )
    this.script?.subroutines.push(playFlySound)

    this.script?.on('init', () => {
      const { loop } = useDelay()

      return `
        activatephysics
        ${loop(randomIntBetween(3000, 5000), Infinity)} ${playFlySound.invoke()}
      `
    })
  }
}
