import { Entity, EntityConstructorPropsWithoutSrc, Vector3 } from 'arx-level-generator'
import { Variable } from 'arx-level-generator/scripting/properties'

export class MagicWall extends Entity {
  private propEnabled: Variable<boolean>

  constructor(props: EntityConstructorPropsWithoutSrc) {
    super({
      src: 'system/marker',
      ...props,
    })

    this.withScript()

    this.propEnabled = new Variable('bool', 'enabled', false)

    this.script?.properties.push(this.propEnabled)

    this.script?.on('game_ready', () => {
      return `
        set ${this.propEnabled.name} 1
        spellcast -msfdz -1 4 create_field self
      `
    })

    this.script?.on('spellcast', () => {
      return `
        if (${this.propEnabled.name} == 0) {
          accept
        }
        
        if (^dist_player > 400) {
          accept
        }
        
        if (^$param1 == dispell_field) {
          set ${this.propEnabled.name} 0
          spellcast -k create_field
        }
      `
    })
  }
}
