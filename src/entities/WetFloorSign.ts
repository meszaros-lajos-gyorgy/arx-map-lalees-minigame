import { Entity, EntityConstructorPropsWithoutSrc, EntityModel } from 'arx-level-generator'
import { Label } from 'arx-level-generator/scripting/properties'
import { getLowestPolygonIdx, loadOBJ, normalizeUV } from 'arx-level-generator/tools/mesh'
import { Vector2 } from 'three'
import { Simplify } from 'type-fest'

type WetFloorSignConstructorProps = Simplify<EntityConstructorPropsWithoutSrc & {}>

const wetFloorSignMesh = await loadOBJ('entities/wet_floor_sign/wet_floor_sign', {
  centralize: true,
  verticalAlign: 'bottom',
  scale: 0.1,
  scaleUV: new Vector2(-1, -1),
})

normalizeUV(wetFloorSignMesh.meshes[0].geometry)

export class WetFloorSign extends Entity {
  constructor({ ...props }: WetFloorSignConstructorProps) {
    super({
      src: 'items/movable/wet_floor_sign',
      model: EntityModel.fromThreeJsObj(wetFloorSignMesh.meshes[0], {
        filename: 'wet_floor_sign.ftl',
        sourcePath: 'entities/wet_floor_sign',
        originIdx: getLowestPolygonIdx(wetFloorSignMesh.meshes[0].geometry),
      }),
      otherDependencies: [...wetFloorSignMesh.materials],
      ...props,
    })

    this.withScript()

    this.script?.properties.push(new Label('[wet-floor-sign]'))
  }
}
