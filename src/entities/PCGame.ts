import { ArxPolygonFlags } from 'arx-convert/types'
import { Expand } from 'arx-convert/utils'
import { Entity, EntityConstructorPropsWithoutSrc, EntityModel, Texture } from 'arx-level-generator'
import { TweakSkin } from 'arx-level-generator/scripting/commands'
import { Label, Material, Shadow, StackSize, Variable } from 'arx-level-generator/scripting/properties'
import { loadOBJ } from 'arx-level-generator/tools/mesh'

export const pcGameVariants = [
  'blank',
  'mesterlovesz',
  'mortyr',
  'wolfschanze',
  'traktor-racer',
  'americas-10-most-wanted',
  'big-rigs',
  'streets-racer',
  'bikini-karate-babes',
] as const

export type PCGameVariant = (typeof pcGameVariants)[number]

export const TEXTURES: Record<PCGameVariant, Texture> = {
  blank: Texture.fromCustomFile({
    filename: 'pcgame_box_art_blank.png',
    sourcePath: './textures/',
  }),
  mesterlovesz: Texture.fromCustomFile({
    filename: 'pcgame_box_art_mesterlovesz.png',
    sourcePath: './textures/',
  }),
  mortyr: Texture.fromCustomFile({
    filename: 'pcgame_box_art_mortyr.png',
    sourcePath: './textures/',
  }),
  wolfschanze: Texture.fromCustomFile({
    filename: 'pcgame_box_art_wolfschanze.png',
    sourcePath: './textures/',
  }),
  'traktor-racer': Texture.fromCustomFile({
    filename: 'pcgame_box_art_traktor_racer.png',
    sourcePath: './textures/',
  }),
  'americas-10-most-wanted': Texture.fromCustomFile({
    filename: 'pcgame_box_art_americas_10_most_wanted.png',
    sourcePath: './textures/',
  }),
  'big-rigs': Texture.fromCustomFile({
    filename: 'pcgame_box_art_big_rigs.png',
    sourcePath: './textures/',
  }),
  'streets-racer': Texture.fromCustomFile({
    filename: 'pcgame_box_art_streets_racer.png',
    sourcePath: './textures/',
  }),
  'bikini-karate-babes': Texture.fromCustomFile({
    filename: 'pcgame_box_art_bikini_karate_babes.png',
    sourcePath: './textures/',
  }),
}

type PCGameConstructorProps = Expand<
  EntityConstructorPropsWithoutSrc & {
    variant: PCGameVariant
  }
>

export const pcGameMesh = await loadOBJ('./pcgame', {
  scale: 0.1,
  materialFlags: ArxPolygonFlags.None,
  reversedPolygonWinding: true,
})

export class PCGame extends Entity {
  private propVariant: Variable<string>
  private propVariantPublic: Variable<string>

  constructor({ variant, ...props }: PCGameConstructorProps) {
    super({
      src: 'items/quest_item/pcgame',
      inventoryIcon: Texture.fromCustomFile({
        filename: 'pcgame[icon].bmp',
        sourcePath: './',
      }),
      model: EntityModel.fromThreeJsObj(pcGameMesh[0], {
        filename: 'pcgame.ftl',
        originIdx: 4,
      }),
      otherDependencies: Object.values(TEXTURES),
      ...props,
    })

    this.withScript()

    this.propVariant = new Variable('string', 'variant', variant)
    // a copy of propVariant to be able to read it outside the entity
    this.propVariantPublic = new Variable('global string', `${this.ref}__variant`, variant)

    this.script?.properties.push(this.propVariant, this.propVariantPublic)

    this.script?.on('init', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      return [Shadow.off, Material.glass, StackSize.unstackable]
    })

    this.script?.on('initend', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      // at this point this.ref is pointing to the root entity, not the invoker, so
      // we have to use the private version of variant

      return [
        new Label(`[game--~${this.propVariant.name}~]`),
        `
        if (${this.propVariant.name} == "mesterlovesz") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['mesterlovesz'])}
        }
        if (${this.propVariant.name} == "mortyr") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['mortyr'])}
        }
        if (${this.propVariant.name} == "wolfschanze") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['wolfschanze'])}
        }
        if (${this.propVariant.name} == "traktor-racer") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['traktor-racer'])}
        }
        if (${this.propVariant.name} == "americas-10-most-wanted") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['americas-10-most-wanted'])}
        }
        if (${this.propVariant.name} == "big-rigs") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['big-rigs'])}
        }
        if (${this.propVariant.name} == "streets-racer") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['streets-racer'])}
        }
        if (${this.propVariant.name} == "bikini-karate-babes") {
          ${new TweakSkin(TEXTURES['blank'], TEXTURES['bikini-karate-babes'])}
        }
        `,
      ]
    })
  }

  get variant() {
    return this.propVariant.value as PCGameVariant
  }

  set variant(value: PCGameVariant) {
    this.propVariant.value = value
    this.propVariantPublic.value = value
  }
}
