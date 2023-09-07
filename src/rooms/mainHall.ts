import { ArxPolygonFlags } from 'arx-convert/types'
import { Audio, Color, Entity, Material, Rotation, Settings, Texture, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { Scale } from 'arx-level-generator/scripting/properties'
import { createLight } from 'arx-level-generator/tools'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils, Vector2 } from 'three'
import { Bucket } from '@/entities/Bucket.js'
import { Curtain2 } from '@/entities/Curtain.js'
import { Goblin } from '@/entities/Goblin.js'
import { Lantern } from '@/entities/Lantern.js'
import { MagicWall } from '@/entities/MagicWall.js'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { PowerupRing } from '@/entities/PowerupRing.js'
import { createCounter } from '@/prefabs/counter.js'
import { createRadio } from '@/prefabs/radio.js'
import { createTable } from '@/prefabs/table.js'
import { RoomContents } from '@/types.js'

export const createMainHall = async (
  settings: Settings,
  gameStateManager: Entity,
  gameVariant: PCGameVariant,
): Promise<RoomContents> => {
  const counter1 = createCounter({ position: new Vector3(300, -100, 450), angleY: 90 + randomBetween(-2, 2) })
  const counter2 = createCounter({ position: new Vector3(300, -100, 295), angleY: 90 + randomBetween(-2, 2) })
  const counter3 = createCounter({ position: new Vector3(300, -100, -225), angleY: 90 + randomBetween(-2, 2) })

  const radio = createRadio({
    position: new Vector3(300, -100, 450),
    angleY: 60,
    scale: 0.1,
    music: Audio.fromCustomFile({
      filename: 'lalee-theme-song.wav',
      sourcePath: './sfx',
    }),
    isOn: settings.mode === 'production',
  })

  const goblin = new Goblin({
    position: new Vector3(-200, -2, 425),
    orientation: new Rotation(0, MathUtils.degToRad(-100), 0),
    gameStateManager,
  })

  if (settings.mode === 'production') {
    goblin.script?.on('initend', () => {
      return `
        set ${goblin.isBusy.name} 1
        speak [goblin_wants_to_play_games] ${goblin.doneSpeaking.invoke()}
      `
    })
  }

  gameStateManager.script?.on('goblin_vanishes', () => {
    return `destroy ${goblin.ref}`
  })

  const table = createTable({
    position: new Vector3(-300, -80, 400),
    angleY: -90,
  })

  const runeSpacium = new Rune('spacium')
  runeSpacium.position = new Vector3(-300, -79, 280)
  runeSpacium.orientation.y = MathUtils.degToRad(195)

  const powerupRing = new PowerupRing({
    position: new Vector3(-300, -79, 370),
  })

  const windowGlass = createPlaneMesh({
    size: new Vector2(500, 300),
    texture: Material.fromTexture(Texture.glassGlass01, {
      opacity: 70,
      flags: ArxPolygonFlags.DoubleSided | ArxPolygonFlags.NoShadow,
    }),
    tileUV: true,
  })
  windowGlass.translateY(-175)
  windowGlass.translateZ(-575)
  windowGlass.rotateX(MathUtils.degToRad(-90))

  const game = new PCGame({
    variant: gameVariant,
    position: new Vector3(300, 0, 403),
    orientation: new Rotation(MathUtils.degToRad(-60), MathUtils.degToRad(-90), 0),
  })
  game.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game.variant}`
  })

  const lantern = new Lantern({
    position: new Vector3(300, 0, -180),
  })
  lantern.script?.properties.push(new Scale(0.7))

  const bucket = new Bucket({
    position: new Vector3(310, 0, 335),
  })

  const magicWall = new MagicWall({
    position: new Vector3(-450, -10, 0),
  })

  const windowLights = [
    createLight({
      position: new Vector3(-200, -200, -500),
      radius: 500,
      color: Color.white,
      intensity: 0.5,
    }),
    createLight({
      position: new Vector3(0, -200, -500),
      radius: 500,
      color: Color.white,
      intensity: 0.5,
    }),
    createLight({
      position: new Vector3(200, -200, -500),
      radius: 500,
      color: Color.white,
      intensity: 0.5,
    }),
  ]

  const curtain = new Curtain2({
    position: new Vector3(375, -15, -450),
    orientation: new Rotation(0, MathUtils.degToRad(180), 0),
  })
  curtain.withScript()
  curtain.script?.properties.push(new Scale(0.9))

  return {
    meshes: [...counter1.meshes, ...counter2.meshes, ...counter3.meshes, ...radio.meshes, ...table.meshes, windowGlass],
    entities: [
      ...counter1.entities,
      ...counter2.entities,
      ...counter3.entities,
      ...radio.entities,
      goblin,
      powerupRing,
      runeSpacium,
      game,
      lantern,
      bucket,
      ...(settings.mode === 'production' ? [magicWall] : []),
      curtain,
    ],
    lights: [...windowLights],
    zones: [],
    _: {},
  }
}
