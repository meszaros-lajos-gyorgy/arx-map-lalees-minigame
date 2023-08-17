import { Entity, EntityConstructorPropsWithoutSrc } from 'arx-level-generator'

export class Jar extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc) {
    super({
      src: 'items/movable/jar',
      ...props,
    })

    this.withScript()
  }
}
