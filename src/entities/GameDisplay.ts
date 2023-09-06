import { Expand } from 'arx-convert/utils'
import { Entity, EntityConstructorPropsWithoutSrc, EntityModel, Texture } from 'arx-level-generator'
import { TweakSkin } from 'arx-level-generator/scripting/commands'
import { Interactivity, Label, Transparency, Variable } from 'arx-level-generator/scripting/properties'
import { PCGameVariant, TEXTURES, pcGameMesh } from '@/entities/PCGame.js'

type GameDisplayProps = Expand<
  EntityConstructorPropsWithoutSrc & {
    variant: PCGameVariant
  }
>

export class GameDisplay extends Entity {
  private propVariant: Variable<string>
  protected propIsMounted: Variable<boolean>

  constructor({ variant, ...props }: GameDisplayProps) {
    super({
      src: 'fix_inter/gamedisplay',
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
    this.propIsMounted = new Variable('bool', 'isMounted', false)

    this.script?.properties.push(
      new Label('[unmounted-game-display]'),
      Interactivity.off,
      this.propVariant,
      this.propIsMounted,
    )

    this.script?.on('init', () => {
      return `
        if (${this.propIsMounted.name} == 0) {
          ${new Transparency(0.85)}
        } else {
          ${new Transparency(1)}
        }
      `
    })

    this.script?.on('initend', () => {
      return [
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
  }
}
