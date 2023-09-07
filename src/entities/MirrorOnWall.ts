import { Entity, EntityConstructorPropsWithoutSrc, EntityModel } from 'arx-level-generator'
import { Interactivity, Label, Scale, Shadow, Transparency, Variable } from 'arx-level-generator/scripting/properties'

export class MirrorOnWall extends Entity {
  protected propIsMounted: Variable<boolean>

  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'fix_inter/mirror_on_wall',
      model: new EntityModel({
        sourcePath: './',
        filename: 'mirror_on_wall.ftl',
      }),
      ...props,
    })

    this.withScript()

    this.propIsMounted = new Variable('bool', 'isMounted', false)

    this.script?.on('init', () => {
      return `
        if (${this.propIsMounted.name} == 0) {
          ${new Transparency(0.85)}
        } else {
          ${new Transparency(1)}
          ${Interactivity.off}
        }
      `
    })

    this.script?.on('combine', () => {
      return `
        if (^$param1 isclass "mirror") {
          ${new Transparency(1)}
          ${Interactivity.off}
          destroy ^$param1
          play clip
          sendevent mounted self nop
        }
      `
    })

    this.script?.properties.push(new Label('[unmounted-mirror-on-wall]'), Shadow.off, new Scale(2), this.propIsMounted)
  }
}
