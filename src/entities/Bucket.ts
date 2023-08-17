import { Entity, EntityConstructorPropsWithoutSrc } from 'arx-level-generator'

export class Bucket extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc) {
    super({
      src: 'items/movable/bucket',
      ...props,
    })

    this.withScript()
  }
}
