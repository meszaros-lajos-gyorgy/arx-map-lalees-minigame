import { ArxPolygonFlags } from 'arx-convert/types'
import { Entity, Material, Settings, Texture, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { MathUtils, Vector2 } from 'three'
import { RoomContents } from '@/types.js'

const transparentGlass = Material.fromTexture(Texture.glassGlass01, {
  opacity: 70,
  flags: ArxPolygonFlags.DoubleSided | ArxPolygonFlags.NoShadow,
})

const createFenceAt = (center: Vector3, offset: Vector2, isRotated: boolean = false) => {
  const railing = createPlaneMesh({
    size: new Vector2(600, 100),
    texture: transparentGlass,
    tileUV: true,
  })

  railing.translateX(center.x + offset.x)
  railing.translateY(center.y)
  railing.translateZ(center.z + offset.y)

  railing.rotateX(MathUtils.degToRad(90))

  if (isRotated) {
    railing.rotateZ(MathUtils.degToRad(90))
  }

  return railing
}

export const createSecondFloor = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  const roomOrigin = new Vector3(-2450, -470, 0)

  const railing1 = createFenceAt(roomOrigin, new Vector2(0, -300))
  const railing2 = createFenceAt(roomOrigin, new Vector2(0, 300))
  const railing3 = createFenceAt(roomOrigin, new Vector2(-300, 0), true)
  const railing4 = createFenceAt(roomOrigin, new Vector2(300, 0), true)

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
