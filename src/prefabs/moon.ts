import { ArxPolygonFlags } from 'arx-convert/types'
import { Color, Material, Texture, Vector3 } from 'arx-level-generator'
import { createLight } from 'arx-level-generator/tools'
import { scaleUV, toArxCoordinateSystem, translateUV } from 'arx-level-generator/tools/mesh'
import { MathUtils, Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from 'three'

type createMoonProps = {
  position: Vector3
  size: number
  /**
   * default value is new Vector3(-100, 100, -50)
   */
  moonOffset?: Vector3
  /**
   * default value is 5000
   */
  lightRadius?: number
}

/**
 * @see https://github.com/meszaros-lajos-gyorgy/arx-map-ambience-gallery/blob/master/src/moon.ts
 */
export const createMoon = ({
  position,
  size,
  moonOffset = new Vector3(-100, 100, -50),
  lightRadius = 5000,
}: createMoonProps) => {
  let geometry = new SphereGeometry(size, 10, 10)
  geometry = toArxCoordinateSystem(geometry)

  scaleUV(new Vector2(0.2, 0.2), geometry)
  translateUV(new Vector2(0.7, 0.7), geometry)

  const material = new MeshBasicMaterial({
    map: Material.fromTexture(Texture.itemCheese, {
      flags: ArxPolygonFlags.Glow,
    }),
  })

  const mesh = new Mesh(geometry, material)
  mesh.translateX(position.x + moonOffset.x)
  mesh.translateY(position.y + moonOffset.y)
  mesh.translateZ(position.z + moonOffset.z)
  mesh.rotateY(MathUtils.degToRad(180))

  const light = createLight({
    position,
    color: Color.white.darken(30),
    fallStart: 200,
    radius: lightRadius,
    intensity: 0.7,
  })

  return {
    meshes: [mesh].flat(),
    lights: [light].flat(),
  }
}
