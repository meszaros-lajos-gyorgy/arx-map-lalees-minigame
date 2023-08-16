import { ArxPolygonFlags } from 'arx-convert/types'
import { Entity, Material, Rotation, Texture, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { ControlZone, Interactivity, Scale } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { makeBumpy, scaleUV, transformEdge } from 'arx-level-generator/tools/mesh'
import { applyTransformations } from 'arx-level-generator/utils'
import { times } from 'arx-level-generator/utils/faux-ramda'
import { pickRandom, randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils, Vector2 } from 'three'
import { Crickets } from '@/entities/Crickets.js'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { TrafficSounds } from '@/entities/TrafficSounds.js'
import { createOutdoorLight } from '@/prefabs/outdoorLight.js'

export const createFrontYard = async (gameStateManager: Entity, gameVariants: PCGameVariant[]) => {
  // "around the corner and small alley" part

  const game1 = new PCGame({
    variant: gameVariants[0],
    position: new Vector3(1700, -5, -50),
    orientation: new Rotation(MathUtils.degToRad(45), MathUtils.degToRad(80), MathUtils.degToRad(15)),
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
  barrel.script?.properties.push(new Scale(0.7))
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
    new TrafficSounds({ position: new Vector3(-2000, 0, -1800) }),
    new TrafficSounds({ position: new Vector3(0, 0, -1800) }),
    new TrafficSounds({ position: new Vector3(2000, 0, -1800) }),
  ]

  const fenceHeight = 200
  const fence = createPlaneMesh({
    size: new Vector2(1450 * 2 + 500, fenceHeight),
    texture: Material.fromTexture(
      Texture.fromCustomFile({
        filename: 'fence.bmp',
        sourcePath: './textures',
      }),
      { flags: ArxPolygonFlags.NoShadow },
    ),
    tileUV: true,
  })
  fence.rotateX(MathUtils.degToRad(90))
  applyTransformations(fence)
  fence.translateY(-fenceHeight / 2)
  fence.translateZ(-1000)
  fence.rotateY(MathUtils.degToRad(180))
  scaleUV(new Vector2(100 / fenceHeight, 100 / fenceHeight), fence.geometry)

  // ----------

  // beyond the fence

  const cityOffsetY = -10
  const cityOffsetZ = -1700
  const cityWidth = 3800
  const cityHeight = 500
  const cityDepth = 600

  const hills = createPlaneMesh({
    size: new Vector2(cityWidth, cityDepth),
    texture: new Texture({ filename: 'l2_troll_[sand]_ground04.jpg' }),
  })
  hills.rotateX(MathUtils.degToRad(-8))
  applyTransformations(hills)
  hills.translateY(cityOffsetY)
  hills.translateZ(cityOffsetZ)
  transformEdge(new Vector3(0, 50, 0), hills)
  makeBumpy(20, 60, true, hills.geometry)

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
          -30,
          cityOffsetZ - cityDepth / 2 + 200 - 250,
        ),
        radius: 500 + randomBetween(0, 100),
        intensity: 1.6,
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
        intensity: 0.5,
      }),
    )
  }

  const trashDetectorZone = createZone({
    name: 'trash_detector_zone',
    position: new Vector3(0, 0, -1250),
    size: new Vector3(cityWidth, 50, 500),
  })

  const trashDetector = Entity.marker.withScript().at({ position: new Vector3(0, 0, -1000) })
  trashDetector.script?.properties.push(new ControlZone(trashDetectorZone))
  trashDetector.script?.on('controlledzone_enter', () => {
    return `
      if (^$param1 isclass broken_bottle) {
        sendevent trash_thrown_over_the_fence ${gameStateManager.ref} nop
        accept
      }
      if (^$param1 isclass broken_shield) {
        sendevent trash_thrown_over_the_fence ${gameStateManager.ref} nop
        accept
      }
      if (^$param1 isclass broken_stool) {
        sendevent trash_thrown_over_the_fence ${gameStateManager.ref} nop
        accept
      }
      if (^$param1 isclass akbaa_blood_chicken_head) {
        sendevent trash_thrown_over_the_fence ${gameStateManager.ref} nop
        accept
      }
    `
  })

  // ----------

  // "the dark end of the front yard" part

  const game2 = new PCGame({
    variant: gameVariants[1],
    position: new Vector3(-1650, -5, -670),
  })
  game2.script?.on('inventoryin', () => {
    return `sendevent player_found_a_game ${gameStateManager.ref} ${game2.variant}`
  })

  const randomJunk = times(
    () => {
      const position = game2.position
        .clone()
        .add(new Vector3(randomBetween(-30, 80), randomBetween(-5, 5), randomBetween(-50, 50)))

      const orientation = new Rotation(
        MathUtils.degToRad(randomBetween(-45, 45)),
        MathUtils.degToRad(randomBetween(0, 360)),
        MathUtils.degToRad(randomBetween(-45, 45)),
      )

      const item = pickRandom([
        Entity.brokenBottle,
        Entity.brokenShield,
        Entity.brokenStool,
        Entity.akbaaBloodChickenHead,
      ])

      return item.withScript().at({ position, orientation })
    },
    Math.round(randomBetween(7, 12)),
  )

  return {
    meshes: [...wallLight1.meshes, ...wallLight2.meshes, fence, hills, city],
    entities: [
      game1,
      fern,
      runeComunicatum,
      barrel,
      game2,
      ...randomJunk,
      ...crickets,
      ...trafficSounds,
      trashDetector,
    ],
    lights: [...wallLight1.lights, ...wallLight2.lights, ...cityLights],
    zones: [trashDetectorZone],
  }
}
