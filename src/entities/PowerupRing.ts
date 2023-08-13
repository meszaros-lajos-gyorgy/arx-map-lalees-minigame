import { Color, Entity, EntityConstructorPropsWithoutSrc, Texture } from 'arx-level-generator'
import { Sound } from 'arx-level-generator/scripting/classes'
import { Label, Material } from 'arx-level-generator/scripting/properties'

const equipRingSound = new Sound('equip_ring')

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

    this.script?.properties.push(Material.metal, new Label('[ring--powerup]'))

    this.script?.on('init', () => {
      return `
        setobjecttype ring
        setequip intelligence +2
        halo -ocs ${Color.fromCSS('gold').lighten(50).toScriptColor()} 50
      `
    })

    this.script?.on('inventoryuse', () => {
      return `equip player`
    })

    this.script?.on('equipin', () => {
      return equipRingSound.play()
    })
  }
}
