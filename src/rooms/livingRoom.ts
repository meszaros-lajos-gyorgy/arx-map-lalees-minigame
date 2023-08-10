import { ArxPolygonFlags } from 'arx-convert/types'
import { Audio, Entity, Material, Rotation, Texture, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { Scale } from 'arx-level-generator/scripting/properties'
import { MathUtils, Vector2 } from 'three'
import { Goblin } from '@/entities/Goblin.js'
import { Lantern } from '@/entities/Lantern.js'
import { MagicWall } from '@/entities/MagicWall.js'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createCounter } from '@/prefabs/counter.js'
import { createRadio } from '@/prefabs/radio.js'
import { createTable } from '@/prefabs/table.js'

export const createLivingRoom = async (gameStateManager: Entity, gameVariant: PCGameVariant) => {
  const counter1 = createCounter({ position: new Vector3(300, -100, 450) })
  const counter2 = createCounter({ position: new Vector3(300, -100, 295) })
  const counter3 = createCounter({ position: new Vector3(300, -100, -250) })

  const radio = createRadio({
    position: new Vector3(300, -100, 450),
    angleY: 60,
    scale: 0.1,
    music: Audio.fromCustomFile({
      filename: 'lalee-theme-song.wav',
      sourcePath: './sfx',
    }),
    isOn: true,
  })

  const goblin = new Goblin({
    position: new Vector3(-200, -2, 425),
    orientation: new Rotation(0, MathUtils.degToRad(-100), 0),
    gameStateMarker: gameStateManager,
  })

  const runeSpacium = new Rune('spacium')
  runeSpacium.position = new Vector3(-300, -79, 280)
  runeSpacium.orientation.y = MathUtils.degToRad(180)

  const table = createTable({
    position: new Vector3(-300, -80, 400),
    angleY: -90,
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
  game.script?.on('inventoryin', () => `sendevent player_found_a_game ${gameStateManager.ref} ${game.variant}`)

  const lantern = new Lantern({
    position: new Vector3(300, 0, -210),
  })
  lantern.script?.properties.push(new Scale(0.7))

  const bucket = new Entity({
    src: 'items/movable/bucket',
    position: new Vector3(310, 0, 335),
  })

  const magicWall = new MagicWall({
    position: new Vector3(-200, -10, 0),
  })

  return {
    meshes: [...counter1.meshes, ...counter2.meshes, ...counter3.meshes, ...radio.meshes, ...table.meshes, windowGlass],
    entities: [
      ...counter1.entities,
      ...counter2.entities,
      ...counter3.entities,
      ...radio.entities,
      goblin,
      runeSpacium,
      game,
      lantern,
      bucket,
      magicWall,
    ],
    lights: [],
  }
}