import {
  ArxMap,
  Audio,
  DONT_QUADIFY,
  Entity,
  HudElements,
  SHADING_SMOOTH,
  Settings,
  UiElements,
  Vector3,
} from 'arx-level-generator'
import { LightDoor, Rune } from 'arx-level-generator/prefabs/entity'
import { loadRooms } from 'arx-level-generator/prefabs/rooms'
import { Speed, Variable } from 'arx-level-generator/scripting/properties'
import { applyTransformations } from 'arx-level-generator/utils'
import { randomSort } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createGameStateManager } from '@/gameStateManager.js'
import { PowerupRing } from './entities/PowerupRing.js'
import { createBathtub } from './prefabs/bathtub.js'
import { createBackYard } from './rooms/backYard.js'
import { createBackrooms } from './rooms/backrooms.js'
import { createBathRoom } from './rooms/bathRoom.js'
import { createFrontYard } from './rooms/frontYard.js'
import { createGameDisplayRoom } from './rooms/gameDisplayRoom.js'
import { createLeftCorridor } from './rooms/leftCorridor.js'
import { createMainHall } from './rooms/mainHall.js'
import { createPantry } from './rooms/pantry.js'
import { createPCRoom } from './rooms/pcRoom.js'
import { createRightCorridor } from './rooms/rightCorridor.js'
import { createSecondFloor } from './rooms/secondFloor.js'

const settings = new Settings()

const map = new ArxMap()
map.config.offset = new Vector3(6000, 0, 6000)
map.player.position.add(new Vector3(1300, 0, -900))
map.player.orientation.y += MathUtils.degToRad(13)
map.player.withScript()
map.player.script?.properties.push(new Speed(1.3))
map.hud.hide('all')
map.hud.show(HudElements.Manabar)
map.hud.show(HudElements.BookIcon)
map.hud.show(HudElements.BackpackIcon)
map.ui.set(UiElements.MainMenuBackground, './ui/menu_main_background.jpg')
await map.i18n.addFromFile('./i18n.json', settings)

// -----------------------------------

const spawn = Entity.marker.at({
  position: new Vector3(1300, 0, -900),
})
map.entities.push(spawn)

const rooms = await loadRooms('./lalees-minigame.rooms', settings)
rooms.forEach((room) => {
  map.add(room, true)
})

const gameStateManager = createGameStateManager(settings)

const rootRune = new Rune('aam', { arxTutorialEnabled: false })
rootRune.script?.makeIntoRoot()

const rootPCGame = new PCGame({ variant: 'blank' })
rootPCGame.script?.makeIntoRoot()

const rootPowerupRing = new PowerupRing()
rootPowerupRing.script?.makeIntoRoot()

map.entities.push(gameStateManager, rootRune, rootPCGame, rootPowerupRing)

// -----------------------------------

const gameVariants: PCGameVariant[] = randomSort([
  // pcGameVariants without "big-rigs" and "blank"
  'mesterlovesz',
  'mortyr',
  'wolfschanze',
  'traktor-racer',
  'americas-10-most-wanted',
  'streets-racer',
  'bikini-karate-babes',
])

const pcRoom = await createPCRoom(settings, gameStateManager)
const bathRoom = await createBathRoom(settings, gameStateManager, gameVariants[0])
const frontYard = await createFrontYard(settings, gameStateManager, [gameVariants[1], gameVariants[2]])
const backYard = await createBackYard(settings, gameStateManager, gameVariants[3])
const mainHall = await createMainHall(settings, gameStateManager, gameVariants[4])
const pantry = await createPantry(settings, gameStateManager, gameVariants[5])
const leftCorridor = await createLeftCorridor(settings, gameStateManager)
const rightCorridor = await createRightCorridor(settings, gameStateManager)
const gameDisplayRoom = await createGameDisplayRoom(settings, gameStateManager, gameVariants[6])
const secondFloor = await createSecondFloor(settings, gameStateManager)

const backroomsCursors = Object.entries(rooms.cursor.saves)
  .filter(([key]) => key.startsWith('backrooms-'))
  .map(([name, { cursor, newSize }]) => ({ origin: cursor, size: newSize, name }))
const backrooms = await createBackrooms(settings, gameStateManager, backroomsCursors)

const bathroomDoor = bathRoom._.door as LightDoor
bathroomDoor.setKey(pantry._.bathroomKey)

const firstVisitToBackrooms = new Variable('bool', 'first_visit_to_backrooms', true)
map.player.script?.properties.push(firstVisitToBackrooms)

// TODO: only give the 4000xp to the player once
map.player.script
  ?.on('send_to_backrooms', () => {
    return `
    if (${firstVisitToBackrooms.name} == 1) {
        set ${firstVisitToBackrooms.name} 0
        // lightning strike requires a player that is at least on level 2
        addxp 4000
      }
      teleport ${backrooms._.entry.ref}
    `
  })
  .on('send_to_spawn', () => {
    return `
      teleport ${spawn.ref}
    `
  })

Audio.mute(new Audio({ filename: 'player_level_up' }))
Audio.mute(new Audio({ filename: 'magic_spell_ignite' }))
Audio.mute(new Audio({ filename: 'magic_spell_douse' }))

// -----------------------------------

// the bathtub is being copied from an existing arx level and the parsing of that is quite resource intensive
// since it's purely decorational it can loaded only when the level generator is in production mode
if (settings.mode === 'production') {
  const bathtub = await createBathtub(
    { position: map.config.offset.clone().add(new Vector3(1270, 0, 300)), scale: 1.5 },
    settings,
  )

  map.polygons.push(...bathtub)
}

// -----------------------------------

const roomInteriors = [
  pcRoom,
  bathRoom,
  frontYard,
  backYard,
  mainHall,
  pantry,
  leftCorridor,
  rightCorridor,
  gameDisplayRoom,
  backrooms,
  secondFloor,
]

map.entities.push(...roomInteriors.flatMap(({ entities }) => entities))
map.lights.push(...roomInteriors.flatMap(({ lights }) => lights))
map.zones.push(...roomInteriors.flatMap(({ zones }) => zones))

roomInteriors
  .flatMap(({ meshes }) => meshes)
  .forEach((mesh) => {
    applyTransformations(mesh)
    mesh.translateX(map.config.offset.x)
    mesh.translateY(map.config.offset.y)
    mesh.translateZ(map.config.offset.z)
    applyTransformations(mesh)
    map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
  })

// -----------------------------------

map.finalize(settings)

await map.saveToDisk(settings)

console.log('done')
