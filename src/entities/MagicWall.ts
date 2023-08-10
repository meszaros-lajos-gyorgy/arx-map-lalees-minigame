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
        SET ${this.propEnabled.name} 1
        SPELLCAST -msfdz -1 4 CREATE_FIELD SELF
      `
    })
    this.script?.on('spellcast', () => {
      return `
        IF (${this.propEnabled.name} == 0) {
          ACCEPT
        }
        
        IF (^DIST_PLAYER > 400) {
          ACCEPT
        }
        
        IF (^$PARAM1 == DISPELL_FIELD) {
          SET ${this.propEnabled.name} 0
          SPELLCAST -k CREATE_FIELD
        }
      
        IF (^$PARAM1 == NEGATE_MAGIC) {
          SET ${this.propEnabled.name} 0
          SPELLCAST -k CREATE_FIELD
        }
      `
    })
  }
}
