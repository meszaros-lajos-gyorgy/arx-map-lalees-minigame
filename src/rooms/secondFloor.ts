import { ArxPolygonFlags } from 'arx-convert/types'
import { Entity, Material, type Settings, Texture, TextureOrMaterial, Vector3 } from 'arx-level-generator'
import { createPlaneMesh, createBox } from 'arx-level-generator/prefabs/mesh'
import { MathUtils, Vector2 } from 'three'
import { RoomContents } from '@/types.js'

const glass = Material.fromTexture(Texture.glassGlass01, {
  opacity: 70,
  flags: ArxPolygonFlags.DoubleSided | ArxPolygonFlags.NoShadow,
})

const invisibleWall = Material.fromTexture(Texture.alpha, {
  flags: ArxPolygonFlags.NoShadow,
})

const createPlaneAt = ({
  texture,
  size,
  position,
  angleY,
}: {
  texture: TextureOrMaterial
  size: Vector2
  position: Vector3
  angleY: number
}) => {
  const plane = createPlaneMesh({ size, texture, tileUV: true })

  plane.translateX(position.x)
  plane.translateY(position.y - size.y / 2)
  plane.translateZ(position.z)

  plane.rotateX(MathUtils.degToRad(90))
  plane.rotateZ(MathUtils.degToRad(angleY))

  return plane
}

const createPoleAt = ({ position }: { position: Vector3 }) => {
  const box = createBox({
    position: position.clone().add(new Vector3(0, -70, 0)),
    texture: Texture.stoneHumanPriest4,
    size: new Vector3(10, 140, 10),
  })

  return box
}

export const createSecondFloor = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  const roomOrigin = new Vector3(-2450, -400, 0)

  const railing1 = createPlaneAt({
    texture: glass,
    size: new Vector2(600, 100),
    position: roomOrigin.clone().add(new Vector3(0, -20, -300)),
    angleY: 0,
  })
  const railing2 = createPlaneAt({
    texture: glass,
    size: new Vector2(600, 100),
    position: roomOrigin.clone().add(new Vector3(0, -20, 300)),
    angleY: 180,
  })
  const railing3 = createPlaneAt({
    texture: glass,
    size: new Vector2(600, 100),
    position: roomOrigin.clone().add(new Vector3(-300, -20, 0)),
    angleY: -90,
  })
  const railing4 = createPlaneAt({
    texture: glass,
    size: new Vector2(600, 100),
    position: roomOrigin.clone().add(new Vector3(300, -20, 0)),
    angleY: 90,
  })

  const blocker1 = createPlaneAt({
    texture: invisibleWall,
    size: new Vector2(598, 200),
    position: roomOrigin.clone().add(new Vector3(0, 0, -299)),
    angleY: 0,
  })
  const blocker2 = createPlaneAt({
    texture: invisibleWall,
    size: new Vector2(598, 200),
    position: roomOrigin.clone().add(new Vector3(0, 0, 299)),
    angleY: 180,
  })
  const blocker3 = createPlaneAt({
    texture: invisibleWall,
    size: new Vector2(598, 200),
    position: roomOrigin.clone().add(new Vector3(-299, 0, 0)),
    angleY: -90,
  })
  const blocker4 = createPlaneAt({
    texture: invisibleWall,
    size: new Vector2(598, 200),
    position: roomOrigin.clone().add(new Vector3(299, 0, 0)),
    angleY: 90,
  })

  // -----------------------------

  const pole1 = createPoleAt({ position: roomOrigin.clone().add(new Vector3(-300, 0, -300)) })
  const pole2 = createPoleAt({ position: roomOrigin.clone().add(new Vector3(300, 0, -300)) })
  const pole3 = createPoleAt({ position: roomOrigin.clone().add(new Vector3(-300, 0, 300)) })
  const pole4 = createPoleAt({ position: roomOrigin.clone().add(new Vector3(300, 0, 300)) })

  // -----------------------------

  return {
    meshes: [
      railing1,
      railing2,
      railing3,
      railing4,
      blocker1,
      blocker2,
      blocker3,
      blocker4,
      pole1,
      pole2,
      pole3,
      pole4,
    ],
    entities: [],
    lights: [],
    zones: [],
    _: {},
  }
}
