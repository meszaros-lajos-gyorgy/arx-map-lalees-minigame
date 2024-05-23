import { ArxPolygonFlags } from 'arx-convert/types'
import { Audio, Color, Entity, Material, Rotation, Settings, Texture, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { Sound } from 'arx-level-generator/scripting/classes'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { ControlZone, Interactivity, Platform, PlayerControls, Scale } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { scaleUV, translateUV } from 'arx-level-generator/tools/mesh'
import { applyTransformations, circleOfVectors } from 'arx-level-generator/utils'
import { randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils, Vector2 } from 'three'
import { Crickets } from '@/entities/Crickets.js'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { TrafficSounds } from '@/entities/TrafficSounds.js'
import { TrashBag } from '@/entities/TrashBag.js'
import { createOutdoorLight } from '@/prefabs/outdoorLight.js'
import { RoomContents } from '@/types.js'

const chainlinkGateClose = Audio.fromCustomFile({
  filename: 'chainlink-gate-close.wav',
  sourcePath: './sfx',
  type: 'sfx',
})

export const createFrontYard = async (
  settings: Settings,
  gameStateManager: Entity,
  gameVariants: PCGameVariant[],
): Promise<RoomContents> => {
  // "around the corner and small alley" part

  const game1 = new PCGame({
    variant: gameVariants[0],
    position: new Vector3(1700, -5, -50),
    orientation: new Rotation(MathUtils.degToRad(45), MathUtils.degToRad(170), MathUtils.degToRad(15)),
  })
  game1.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game1.variant}`
  })

  const fern = Entity.fern.withScript().at({
    position: new Vector3(1650, 0, -60),
    orientation: new Rotation(0, MathUtils.degToRad(90), 0),
  })
  fern.script?.properties.push(Interactivity.off, new Scale(2))

  const runeComunicatum = new Rune('comunicatum')

  const barrel = Entity.barrel.withScript().at({ position: new Vector3(1650, 0, -960) })
  barrel.script?.properties.push(new Scale(0.7), Platform.on)
  barrel.script?.on('init', () => {
    return `inventory addfromscene ${runeComunicatum.ref}`
  })

  const wallLight1 = createOutdoorLight({ position: new Vector3(1000, -180, -600) })
  const wallLight2 = createOutdoorLight({ position: new Vector3(1475, -180, -600) })

  const crickets: Entity[] = []
  for (let i = 0; i < 6; i++) {
    const cricket = new Crickets({
      position: new Vector3(
        1800 - i * 600 + randomBetween(-100, 100),
        200 + randomBetween(0, -300),
        -1500 + randomBetween(-300, 300),
      ),
    })
    crickets.push(cricket)
  }

  const trafficSounds = [
    new TrafficSounds({ position: new Vector3(-2000, 0, -2000) }),
    new TrafficSounds({ position: new Vector3(0, 0, -2000) }),
    new TrafficSounds({ position: new Vector3(2000, 0, -2000) }),
  ]

  const fenceHeight = 200

  const fenceRight = createPlaneMesh({
    size: new Vector2(1450 * 2, fenceHeight),
    texture: Material.fromTexture(
      Texture.fromCustomFile({
        filename: 'fence.bmp',
        sourcePath: './textures',
      }),
      { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided },
    ),
    tileUV: true,
  })
  fenceRight.rotateX(MathUtils.degToRad(90))
  applyTransformations(fenceRight)
  fenceRight.translateX(-250)
  fenceRight.translateY(-fenceHeight / 2)
  fenceRight.translateZ(-1000)
  fenceRight.rotateY(MathUtils.degToRad(180))
  scaleUV(new Vector2(100 / fenceHeight, 100 / fenceHeight), fenceRight.geometry)

  const fenceGate = createPlaneMesh({
    size: new Vector2(100 * 2, fenceHeight),
    texture: Material.fromTexture(
      Texture.fromCustomFile({
        filename: 'fence-gate.bmp',
        sourcePath: './textures',
      }),
      { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided },
    ),
    tileUV: true,
  })
  fenceGate.rotateX(MathUtils.degToRad(90))
  applyTransformations(fenceGate)
  fenceGate.translateX(1450 - 150)
  fenceGate.translateY(-fenceHeight / 2)
  fenceGate.translateZ(-1000)
  fenceGate.rotateY(MathUtils.degToRad(180))
  scaleUV(new Vector2(100 / fenceHeight, 100 / fenceHeight), fenceGate.geometry)

  const markerAtFenceGate = Entity.marker.withScript().at({
    position: Vector3.fromThreeJsVector3(fenceGate.position),
  })
  if (settings.mode === 'production') {
    markerAtFenceGate.otherDependencies.push(chainlinkGateClose)
    const chainlinkGateCloseSound = new Sound(chainlinkGateClose.filename)
    markerAtFenceGate.script?.on('init', () => {
      const { delay } = useDelay()

      return `
        worldfade out 0 ${Color.fromCSS('black').toScriptColor()}
        ${PlayerControls.off}
        ${delay(400)} ${chainlinkGateCloseSound.play()}
        ${delay(400)} worldfade in 1000
        ${delay(1000)} ${PlayerControls.on}
      `
    })
  }

  const fenceLeft = createPlaneMesh({
    size: new Vector2(300, fenceHeight),
    texture: Material.fromTexture(
      Texture.fromCustomFile({
        filename: 'fence.bmp',
        sourcePath: './textures',
      }),
      { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided },
    ),
    tileUV: true,
  })
  fenceLeft.rotateX(MathUtils.degToRad(90))
  applyTransformations(fenceLeft)
  fenceLeft.translateX(1450 + 100)
  fenceLeft.translateY(-fenceHeight / 2)
  fenceLeft.translateZ(-1000)
  fenceLeft.rotateY(MathUtils.degToRad(180))
  scaleUV(new Vector2(100 / fenceHeight, 100 / fenceHeight), fenceLeft.geometry)
  translateUV(new Vector2(0.5, 0), fenceLeft.geometry)

  const houseNumber = createPlaneMesh({
    size: new Vector2(30, 30),
    texture: Texture.fromCustomFile({
      filename: 'house-number.bmp',
      sourcePath: './textures',
    }),
    tileSize: 30,
  })
  houseNumber.rotateX(MathUtils.degToRad(90))
  applyTransformations(houseNumber)
  houseNumber.translateX(1250)
  houseNumber.translateY(-275)
  houseNumber.translateZ(-601)

  // ----------

  // beyond the fence

  const cityOffsetY = 100
  const cityOffsetZ = -2200
  const cityWidth = 3800
  const cityHeight = 400
  const cityDepth = 600

  const city = createPlaneMesh({
    size: new Vector2(cityWidth, cityHeight),
    texture: Material.fromTexture(
      Texture.fromCustomFile({
        filename: 'city-at-night.jpg',
        sourcePath: './textures',
      }),
      { flags: ArxPolygonFlags.NoShadow },
    ),
    tileUV: true,
  })
  city.translateY(-cityHeight / 2 + cityOffsetY + 65)
  city.translateZ(cityOffsetZ - cityDepth / 2 - 50 - 250)
  city.rotateX(MathUtils.degToRad(90))
  city.rotateZ(MathUtils.degToRad(180))
  scaleUV(new Vector2(100 / cityHeight, 100 / cityHeight), city.geometry)

  const cityLights = []
  const numberOfLights = 7
  for (let i = 1; i < numberOfLights; i++) {
    // lower, but brighter lights to illuminate city
    cityLights.push(
      createLight({
        position: new Vector3(
          cityWidth / 2 - (cityWidth / numberOfLights) * i,
          100,
          cityOffsetZ - cityDepth / 2 + 200 - 250,
        ),
        radius: 500 + randomBetween(0, 100),
        intensity: 0.75,
      }),
    )

    // upper, but dimmer lights to illuminate cliff
    cityLights.push(
      createLight({
        position: new Vector3(
          cityWidth / 2 - (cityWidth / numberOfLights) * i,
          -300 + randomBetween(-50, 50),
          cityOffsetZ - cityDepth / 2 + 200 - 150,
        ),
        radius: 600 + randomBetween(0, 100),
        color: Color.fromCSS('#1a2032').lighten(30),
        intensity: 0.75,
      }),
    )
  }

  const entityOverFenceZone = createZone({
    name: 'entity_over_fence_zone',
    position: new Vector3(0, 0, -1250),
    size: new Vector3(cityWidth - 400, 50, 500),
  })

  const entityOverFenceDetector = Entity.marker.withScript().at({ position: new Vector3(0, 0, -1000) })
  entityOverFenceDetector.script?.properties.push(new ControlZone(entityOverFenceZone))
  entityOverFenceDetector.script?.on('controlledzone_enter', () => {
    return `sendevent entity_over_fence ${gameStateManager.ref} "~^$param1~ ~^$param2~ ~^$param3~"`
  })

  // ----------

  // "the dark end of the front yard" part

  const game2 = new PCGame({
    variant: gameVariants[1],
    position: new Vector3(-1500, -5, -450),
    orientation: new Rotation(0, MathUtils.degToRad(90), 0),
  })
  game2.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game2.variant}`
  })

  const trashBags = circleOfVectors(game2.position.clone(), 100, 6).map((point) => {
    const offset = new Vector3(randomBetween(-10, 10), -15, randomBetween(-10, 10))
    const position = point.add(offset)

    const orientation = new Rotation(
      MathUtils.degToRad(randomBetween(-5, 5)),
      MathUtils.degToRad(randomBetween(0, 360)),
      MathUtils.degToRad(randomBetween(-5, 5)),
    )

    const trashBag = new TrashBag({
      position,
      orientation,
    })
    trashBag.script?.on('init', () => `setgroup "junk"`)

    return trashBag
  })

  const middleTrashBag = new TrashBag({
    position: game2.position.clone().add(new Vector3(0, -15, 0)),
  })
  middleTrashBag.script?.on('init', () => `setgroup "junk"`)

  trashBags.push(middleTrashBag)

  const wallLight3 = createOutdoorLight({
    position: new Vector3(-1500, -255, -600),
  })

  return {
    meshes: [
      ...wallLight1.meshes,
      ...wallLight2.meshes,
      fenceRight,
      fenceGate,
      fenceLeft,
      city,
      houseNumber,
      ...wallLight3.meshes,
    ],
    entities: [
      game1,
      fern,
      runeComunicatum,
      barrel,
      game2,
      ...crickets,
      ...trafficSounds,
      entityOverFenceDetector,
      markerAtFenceGate,
      ...trashBags,
    ],
    lights: [...wallLight1.lights, ...wallLight2.lights, ...cityLights, ...wallLight3.lights],
    zones: [entityOverFenceZone],
    _: {},
  }
}
