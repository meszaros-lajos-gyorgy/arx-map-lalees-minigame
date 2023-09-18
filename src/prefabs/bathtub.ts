import { ArxMap, Polygon, Settings, Texture, Vector3, Vertex } from 'arx-level-generator'
import { Box3 } from 'three'

const barrelTexture = new Texture({
  filename: 'FIXINTER_BARREL.jpg',
  size: 128, // it's actally 128×256
})

export const createBathtub = async (
  { position, scale = 1 }: { position: Vector3; scale?: number },
  settings: Settings,
) => {
  const castleMap = await ArxMap.fromOriginalLevel(0, settings)

  const center = new Vector3(4703, 1775, 8654)
  const box = new Box3(
    center.clone().add(new Vector3(-200, -200, -200)),
    center.clone().add(new Vector3(200, 200, 200)),
  )

  const inverseCenter = center.clone().multiplyScalar(-1)

  const polygons = castleMap.polygons
    .filter((polygon) => {
      if (!polygon.isWithin(box)) {
        return false
      }

      if (typeof polygon.texture === 'undefined') {
        return false
      }

      return polygon.texture.equals(barrelTexture)
    })
    .map((_polygon) => {
      _polygon.move(inverseCenter)
      _polygon.move(new Vector3(0, 50, 0))
      _polygon.scale(scale)

      const polygon = new Polygon({
        vertices: _polygon.vertices,
        texture: _polygon.texture,
        isQuad: _polygon.isQuad(),
        flags: _polygon.flags,
      })

      polygon.move(position)
      return polygon
    })

  return {
    polygons,
  }
}
