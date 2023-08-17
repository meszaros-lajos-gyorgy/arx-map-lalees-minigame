import { Entity, EntityConstructorPropsWithoutSrc } from 'arx-level-generator'
import { Label, Material } from 'arx-level-generator/scripting/properties'

export class Mirror extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'items/quest_item/mirror',
      ...props,
    })

    this.withScript()

    this.script?.on('init', () => {
      if (!this.script?.isRoot) {
        return ``
      }

      return [new Label('[description_mirror]'), new Material('glass')]
    })
  }
}
