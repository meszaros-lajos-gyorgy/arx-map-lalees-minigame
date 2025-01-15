import { $, ArxMap, type ISettings, Texture, Vector3 } from 'arx-level-generator'
import { Box3 } from 'three'

export const createBathtub = async (
  { position, scale = 1 }: { position: Vector3; scale?: number },
  settings: ISettings,
) => {
  const castleMap = await ArxMap.fromOriginalLevel(0, settings)

  const barrelTexture = new Texture({
    filename: 'fixinter_barrel.jpg',
    size: 128, // it's actally 128×256
  })

  const center = new Vector3(4703, 1775, 8654)
  const box = new Box3(
    center.clone().add(new Vector3(-200, -200, -200)),
    center.clone().add(new Vector3(200, 200, 200)),
  )

  const adjustment = new Vector3(0, 50, 0)
  const inverseCenter = center.clone().multiplyScalar(-1)

  return $(castleMap.polygons)
    .selectWithinBox(box)
    .selectByTextures([barrelTexture])
    .copy()
    .selectAll()
    .moveToRoom1()
    .move(inverseCenter)
    .move(adjustment)
    .scale(scale)
    .move(position)
    .get()
}
