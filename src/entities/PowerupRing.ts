import { Color, Entity, EntityConstructorPropsWithoutSrc, Texture } from 'arx-level-generator'

export class PowerupRing extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'items/magic/powerup_ring',
      inventoryIcon: Texture.fromCustomFile({
        filename: 'powerup_ring[icon].bmp',
        sourcePath: './',
      }),
      model: {
        filename: 'powerup_ring.ftl',
        sourcePath: './',
      },
      ...props,
    })

    this.withScript()

    // TODO: clean these scripts up
    this.script?.on('init', () => {
      return `
        SETNAME [ring--powerup]
        SETOBJECTTYPE RING
        SET_MATERIAL METAL
        SETEQUIP intelligence +2
        SET_WEIGHT 0
        HALO -ocs ${Color.fromCSS('gold').lighten(50).toScriptColor()} 50
      `
    })
    this.script?.on('INVENTORYUSE', () => {
      return `
        EQUIP PLAYER
      `
    })
    this.script?.on('EQUIPIN', () => {
      return `
        PLAY "EQUIP_RING"
      `
    })
  }
}
