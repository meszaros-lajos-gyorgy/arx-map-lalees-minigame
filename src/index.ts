import { ArxMap, DONT_QUADIFY, HudElements, SHADING_SMOOTH, Settings, UiElements, Vector3 } from 'arx-level-generator'
import { Rune } from 'arx-level-generator/prefabs/entity'
import { loadRooms } from 'arx-level-generator/prefabs/rooms'
import { Speed } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { applyTransformations, compile } from 'arx-level-generator/utils'
import { randomSort } from 'arx-level-generator/utils/random'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createGameStateManager } from '@/gameStateManager.js'
import { PowerupRing } from './entities/PowerupRing.js'
import { createBackYard } from './rooms/backYard.js'
import { createBathRoom } from './rooms/bathRoom.js'
import { createFrontYard } from './rooms/frontYard.js'
import { createLivingRoom } from './rooms/livingRoom.js'
import { createPCRoom } from './rooms/pcRoom.js'

const settings = new Settings({
  levelIdx: parseInt(process.env.levelIdx ?? '1'),
  outputDir: process.env.outputDir,
  seed: process.env.seed,
})

const map = new ArxMap()
map.meta.mapName = "LaLee's minigame"
map.config.offset = new Vector3(6000, 0, 6000)
map.player.position.adjustToPlayerHeight()
map.player.withScript()
map.player.script?.properties.push(new Speed(1.3))
map.hud.hide('all')
map.hud.show(HudElements.Manabar)
map.hud.show(HudElements.BookIcon)
map.hud.show(HudElements.BackpackIcon)
map.ui.set(UiElements.MainMenuBackground, './ui/menu_main_background.jpg')
await map.i18n.addFromFile('./i18n.json', settings)

// -----------------------------------

const rooms = await loadRooms('./lalees-minigame.rooms', settings)
rooms.forEach((room) => {
  map.add(room, true)
})

const spawnZone = createZone({ name: 'spawn', drawDistance: 5000 })
map.zones.push(spawnZone)

const gameStateManager = createGameStateManager()

const rootRune = new Rune('aam', { arxTutorialEnabled: false })
rootRune.script?.makeIntoRoot()

const rootPCGame = new PCGame({ variant: 'blank' })
rootPCGame.script?.makeIntoRoot()

const rootPowerupRing = new PowerupRing()
rootPowerupRing.script?.makeIntoRoot()

map.entities.push(gameStateManager, rootRune, rootPCGame, rootPowerupRing)

// -----------------------------------

const randomizedGameVariants: PCGameVariant[] = randomSort([
  'mesterlovesz',
  'mortyr',
  'wolfschanze',
  'traktor-racer',
  'americas-10-most-wanted',
  'streets-racer',
  'bikini-karate-babes',
])

const pcRoom = await createPCRoom(gameStateManager)
const bathRoom = await createBathRoom(gameStateManager)
const backYard = await createBackYard(gameStateManager, randomizedGameVariants[2])
const frontYard = await createFrontYard(gameStateManager, [randomizedGameVariants[0], randomizedGameVariants[1]])
const livingRoom = await createLivingRoom(gameStateManager, randomizedGameVariants[3])

// -----------------------------------

map.entities.push(
  ...pcRoom.entities,
  ...bathRoom.entities,
  ...backYard.entities,
  ...frontYard.entities,
  ...livingRoom.entities,
)

map.lights.push(...pcRoom.lights, ...bathRoom.lights, ...backYard.lights, ...frontYard.lights, ...livingRoom.lights)

const meshes = [...pcRoom.meshes, ...bathRoom.meshes, ...backYard.meshes, ...frontYard.meshes, ...livingRoom.meshes]
meshes.forEach((mesh) => {
  applyTransformations(mesh)
  mesh.translateX(map.config.offset.x)
  mesh.translateY(map.config.offset.y)
  mesh.translateZ(map.config.offset.z)
  applyTransformations(mesh)
  map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
})

// -----------------------------------

map.finalize()
await map.saveToDisk(settings)

await compile(settings)

console.log('done')
