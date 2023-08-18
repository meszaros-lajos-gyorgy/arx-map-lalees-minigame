import { Rotation, Texture, Vector3 } from 'arx-level-generator'
import { loadOBJ } from 'arx-level-generator/tools/mesh'

type createMoonProps = {
  /**
   * default value is undefined
   */
  position?: Vector3
  /**
   * default value is undefined
   */
  scale?: number | Vector3
  /**
   * default value is undefined
   */
  orientation?: Rotation
}

export const createTree = async (props: createMoonProps = {}) => {
  return loadOBJ('models/tree/tree', {
    fallbackTexture: Texture.l2TrollWoodPillar08,
    ...props,
  })
}
