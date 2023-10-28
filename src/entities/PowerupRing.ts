import { Color, Entity, EntityConstructorPropsWithoutSrc, EntityModel, Texture } from 'arx-level-generator'
import { Sound } from 'arx-level-generator/scripting/classes'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { Label, Material, Variable } from 'arx-level-generator/scripting/properties'

const equipRingSound = new Sound('equip_ring')

export class PowerupRing extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'items/magic/powerup_ring',
      inventoryIcon: Texture.fromCustomFile({
        filename: 'powerup_ring[icon].bmp',
        sourcePath: './',
      }),
      model: new EntityModel({
        filename: 'powerup_ring.ftl',
        sourcePath: './',
      }),
      ...props,
    })

    this.withScript()

    const propSilentEquip = new Variable('bool', 'silent_equip', true)

    this.script?.properties.push(Material.metal, new Label('[ring--powerup]'), propSilentEquip)

    this.script
      ?.on('init', () => {
        const brightGold = Color.fromCSS('gold').lighten(50)

        return `
          setobjecttype ring
          setequip intelligence +2
          halo -ocs ${brightGold.toScriptColor()} 50
        `
      })
      .on('initend', () => {
        const { delay } = useDelay()
        return `
          equip player
          ${delay(100)} set ${propSilentEquip.name} 0
        `
      })
      .on('inventoryuse', () => `equip player`)
      .on('equipin', () => {
        return `
          if (${propSilentEquip.name} == 1) {
            accept
          }
          ${equipRingSound.play()}
        `
      })
  }
}
