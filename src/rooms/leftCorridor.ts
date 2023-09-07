import { Entity, Material, Rotation, Settings, Texture, Vector3 } from 'arx-level-generator'
import { createBox } from 'arx-level-generator/prefabs/mesh'
import { Scale, Shadow } from 'arx-level-generator/scripting/properties'
import { circleOfVectors } from 'arx-level-generator/utils'
import { MathUtils } from 'three'
import { GameDisplay } from '@/entities/GameDisplay.js'
import { Mirror } from '@/entities/Mirror.js'
import { PCGame, PCGameVariant, pcGameVariants } from '@/entities/PCGame.js'
import { RoomContents } from '@/types.js'

export const createLeftCorridor = async (
  settings: Settings,
  gameStateManager: Entity,
  gameVariant: PCGameVariant,
): Promise<RoomContents> => {
  const rootMirror = new Mirror()
  rootMirror.script?.makeIntoRoot()

  const mirror = new Mirror({
    position: new Vector3(-1606, -120, 0),
    orientation: new Rotation(0, MathUtils.degToRad(180), 0),
  })
  mirror.script?.properties.push(new Scale(2), Shadow.off)

  const variants = pcGameVariants.filter((variant) => variant !== 'blank')

  const angle = MathUtils.degToRad(360 / variants.length)
  const theta = angle / 2

  const gameDisplays = circleOfVectors(
    new Vector3(-2500, -105, 0),
    350,
    variants.length,
    theta + MathUtils.degToRad(2.4),
  ).reduce(
    (acc, position, i) => {
      const variant = variants[i]
      const gameDisplay = new GameDisplay({
        variant,
        position,
        orientation: new Rotation(
          MathUtils.degToRad(90) + i * angle + theta,
          MathUtils.degToRad(180),
          MathUtils.degToRad(-90),
        ),
      })

      return { ...acc, [variant]: gameDisplay }
    },
    {} as Record<PCGameVariant, GameDisplay>,
  )

  gameStateManager.script?.on('goblin_received_a_game', () => {
    return `
      sendevent game_collected ${gameStateManager.ref} nop

      if (^$param1 == "mesterlovesz") {
        sendevent mount ${gameDisplays['mesterlovesz'].ref} nop
      }
      if (^$param1 == "mortyr") {
        sendevent mount ${gameDisplays['mortyr'].ref} nop
      }
      if (^$param1 == "wolfschanze") {
        sendevent mount ${gameDisplays['wolfschanze'].ref} nop
      }
      if (^$param1 == "traktor-racer") {
        sendevent mount ${gameDisplays['traktor-racer'].ref} nop
      }
      if (^$param1 == "americas-10-most-wanted") {
        sendevent mount ${gameDisplays['americas-10-most-wanted'].ref} nop
      }
      if (^$param1 == "big-rigs") {
        sendevent mount ${gameDisplays['big-rigs'].ref} nop
      }
      if (^$param1 == "streets-racer") {
        sendevent mount ${gameDisplays['streets-racer'].ref} nop
      }
      if (^$param1 == "bikini-karate-babes") {
        sendevent mount ${gameDisplays['bikini-karate-babes'].ref} nop
      }
    `
  })

  Object.entries(gameDisplays).forEach(([variant, gameDisplay]) => {
    gameDisplay.script?.on('combine', () => {
      return `
        if (^$param1 isclass pcgame) {
          set £variant $~^$param1~__variant

          if (£variant == "${variant}") {
            sendevent game_collected ${gameStateManager.ref} nop
            destroy ^$param1
            play clip
            sendevent mount ${gameDisplay.ref} nop
          } else {
            speak -p [player_not_this_way]
          }
        }
      `
    })
  })

  const bases = circleOfVectors(new Vector3(-2500, -50, 0), 350, variants.length, theta).map((position, i) => {
    return createBox({
      position: position,
      angleY: MathUtils.radToDeg(i * angle + theta),
      materials: Material.fromTexture(new Texture({ filename: 'L3_DISSID_[IRON]_GROUND01.jpg' }), {}),
      size: new Vector3(50, 100, 50),
    })
  })

  const game = new PCGame({
    variant: gameVariant,
    position: new Vector3(-2660, 0, 340),
    orientation: new Rotation(
      MathUtils.degToRad(-90) + 7 * angle + theta,
      MathUtils.degToRad(180),
      MathUtils.degToRad(-90),
    ),
  })
  game.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game.variant}`
  })

  return {
    meshes: [...bases],
    entities: [rootMirror, mirror, ...Object.values(gameDisplays), game],
    lights: [],
    zones: [],
    _: {},
  }
}
