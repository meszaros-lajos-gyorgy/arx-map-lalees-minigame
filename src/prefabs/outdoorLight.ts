import { ArxPolygonFlags } from 'arx-convert/types'
import { Color, Material, Texture, Vector3 } from 'arx-level-generator'
import { createLight } from 'arx-level-generator/tools'
import { scaleUV, toArxCoordinateSystem, translateUV } from 'arx-level-generator/tools/mesh'
import { ConeGeometry, CylinderGeometry, Euler, MathUtils, Mesh, MeshBasicMaterial, Vector2 } from 'three'

type createOutdoorLightProps = {
  position: Vector3
  /**
   * default value is 0
   */
  angleY?: number
}

export const createOutdoorLight = ({ position, angleY = 0 }: createOutdoorLightProps) => {
  const lightEffect = new MeshBasicMaterial({
    map: Material.fromTexture(new Texture({ filename: '[GLASS]_WINDOWS2' }), {
      flags: ArxPolygonFlags.Glow | ArxPolygonFlags.NoShadow,
      opacity: 0.5,
    }),
  })

  const fixture = new MeshBasicMaterial({
    map: Material.fromTexture(new Texture({ filename: 'L5_CAVES_[RUSTY]_METAL01.jpg' }), {
      flags: ArxPolygonFlags.DoubleSided,
    }),
  })

  let lightCone = new CylinderGeometry(10, 30, 60, 3, 1, true, 0, Math.PI)
  lightCone = toArxCoordinateSystem(lightCone)
  lightCone.rotateZ(MathUtils.degToRad(180))
  lightCone.rotateY(MathUtils.degToRad(-90 + angleY))
  lightCone.translate(0, -38, 0)
  scaleUV(new Vector2(0.25, 0.25), lightCone)
  const lightShining = new Mesh(lightCone, lightEffect)
  lightShining.translateX(position.x)
  lightShining.translateY(position.y)
  lightShining.translateZ(position.z)

  let fixtureCone = new ConeGeometry(20, 40, 3, 1, true, 0, Math.PI)
  fixtureCone = toArxCoordinateSystem(fixtureCone)
  fixtureCone.rotateZ(MathUtils.degToRad(180))
  fixtureCone.rotateY(MathUtils.degToRad(-90 + angleY))
  const lightFixture = new Mesh(fixtureCone, fixture)
  lightFixture.translateX(position.x)
  lightFixture.translateY(position.y + 9)
  lightFixture.translateZ(position.z)

  const shadowCasterLight = createLight({
    position: position
      .clone()
      .add(new Vector3(0, -40, 0))
      .add(new Vector3(0, 0, -10).applyEuler(new Euler(0, MathUtils.degToRad(angleY), 0))),
    radius: 400,
    color: Color.white,
    intensity: 1,
  })

  const ambientLight = createLight({
    position: position
      .clone()
      .add(new Vector3(0, -50, 0))
      .add(new Vector3(0, 0, -150).applyEuler(new Euler(0, MathUtils.degToRad(angleY), 0))),
    radius: 500,
    color: Color.yellow.lighten(50),
    intensity: 0.5,
  })

  return {
    meshes: [lightShining, lightFixture],
    lights: [shadowCasterLight, ambientLight],
  }
}
