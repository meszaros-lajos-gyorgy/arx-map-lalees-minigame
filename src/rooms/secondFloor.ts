import { ArxPolygonFlags } from 'arx-convert/types'
import { Entity, Material, Settings, Texture, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { MathUtils, Vector2 } from 'three'
import { RoomContents } from '@/types.js'

export const createSecondFloor = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  const railingSize = new Vector2(600, 100)
  const railingOrigin = new Vector3(-2450, -470, 0)

  const transparentGlass = Material.fromTexture(Texture.glassGlass01, {
    opacity: 70,
    flags: ArxPolygonFlags.DoubleSided | ArxPolygonFlags.NoShadow,
  })

  const railing1 = createPlaneMesh({
    size: railingSize.clone(),
    texture: transparentGlass,
    tileUV: true,
  })
  railing1.translateX(railingOrigin.x)
  railing1.translateY(railingOrigin.y)
  railing1.translateZ(railingOrigin.z - 300)
  railing1.rotateX(MathUtils.degToRad(90))

  const railing2 = createPlaneMesh({
    size: railingSize.clone(),
    texture: transparentGlass,
    tileUV: true,
  })
  railing2.translateX(railingOrigin.x)
  railing2.translateY(railingOrigin.y)
  railing2.translateZ(railingOrigin.z + 300)
  railing2.rotateX(MathUtils.degToRad(90))

  const railing3 = createPlaneMesh({
    size: railingSize.clone(),
    texture: transparentGlass,
    tileUV: true,
  })
  railing3.translateX(railingOrigin.x - 300)
  railing3.translateY(railingOrigin.y)
  railing3.translateZ(railingOrigin.z)
  railing3.rotateX(MathUtils.degToRad(90))
  railing3.rotateZ(MathUtils.degToRad(90))

  const railing4 = createPlaneMesh({
    size: railingSize.clone(),
    texture: transparentGlass,
    tileUV: true,
  })
  railing4.translateX(railingOrigin.x + 300)
  railing4.translateY(railingOrigin.y)
  railing4.translateZ(railingOrigin.z)
  railing4.rotateX(MathUtils.degToRad(90))
  railing4.rotateZ(MathUtils.degToRad(90))

  // TODO: add invisible wall behind glass to prevent player jumping over

  // TODO: add corner poles to support glass railing

  return {
    meshes: [railing1, railing2, railing3, railing4],
    entities: [],
    lights: [],
    zones: [],
    _: {},
  }
}
