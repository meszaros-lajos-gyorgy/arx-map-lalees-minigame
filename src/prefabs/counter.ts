import { Material, Rotation, Texture, Vector3 } from 'arx-level-generator'
import { GoblinVeryLightDoor } from 'arx-level-generator/prefabs/entity'
import { createBox } from 'arx-level-generator/prefabs/mesh'
import { Scale } from 'arx-level-generator/scripting/properties'
import { toArxCoordinateSystem } from 'arx-level-generator/tools/mesh'
import { BoxGeometry, Euler, MathUtils, Mesh, MeshBasicMaterial } from 'three'

type createCounterProps = {
  position: Vector3
  /**
   * default value is 0
   */
  angleY?: number
}

export const createCounter = ({ position, angleY = 0 }: createCounterProps) => {
  const counterTopMaterial = Material.fromTexture(
    Texture.fromCustomFile({
      filename: '[stone]-granite.jpg',
      sourcePath: 'textures',
    }),
  )

  const counterWallMaterial = new MeshBasicMaterial({ map: Texture.l4DwarfWoodBoard02 })

  const counterTop = createBox({
    position: position.clone().add(new Vector3(0, 17, 0)),
    size: new Vector3(150, 4, 100),
    angleY,
    texture: counterTopMaterial,
  })

  let counterLeftWallGeometry = new BoxGeometry(80, 6, 90, 1, 1, 1)
  counterLeftWallGeometry = toArxCoordinateSystem(counterLeftWallGeometry)
  counterLeftWallGeometry.rotateZ(MathUtils.degToRad(90))
  counterLeftWallGeometry.translate(70, 58, -5)
  counterLeftWallGeometry.rotateY(MathUtils.degToRad(180 + angleY))
  const counterLeftWall = new Mesh(counterLeftWallGeometry, counterWallMaterial)
  counterLeftWall.translateX(position.x)
  counterLeftWall.translateY(position.y)
  counterLeftWall.translateZ(position.z)

  let counterRightWallGeometry = new BoxGeometry(80, 6, 90, 1, 1, 1)
  counterRightWallGeometry = toArxCoordinateSystem(counterRightWallGeometry)
  counterRightWallGeometry.rotateZ(MathUtils.degToRad(90))
  counterRightWallGeometry.translate(-70, 58, -5)
  counterRightWallGeometry.rotateY(MathUtils.degToRad(180 + angleY))
  const counterRightWall = new Mesh(counterRightWallGeometry, counterWallMaterial)
  counterRightWall.translateX(position.x)
  counterRightWall.translateY(position.y)
  counterRightWall.translateZ(position.z)

  const leftDoor = new GoblinVeryLightDoor({
    position: position
      .clone()
      .add(new Vector3(40, 108, -70).applyEuler(new Euler(0, MathUtils.degToRad(90 + angleY), 0))),
    orientation: new Rotation(0, MathUtils.degToRad(90 - angleY), 0),
  })
  leftDoor.script?.properties.push(new Scale(0.45))

  const rightDoor = new GoblinVeryLightDoor({
    position: position.clone().add(new Vector3(40, 8, 70).applyEuler(new Euler(0, MathUtils.degToRad(90 + angleY), 0))),
    orientation: new Rotation(MathUtils.degToRad(180), MathUtils.degToRad(-90 + angleY), 0),
  })
  rightDoor.script?.properties.push(new Scale(0.45))

  return {
    entities: [leftDoor, rightDoor],
    meshes: [counterTop, counterLeftWall, counterRightWall],
    _: {
      leftDoor,
      rightDoor,
    },
  }
}
