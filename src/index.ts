import fs from 'node:fs'
import path from 'node:path'
import { FTL } from 'arx-convert'
import { ArxFTL, ArxFace, ArxFaceType, ArxPolygonFlags } from 'arx-convert/types'
import { TripleOf } from 'arx-convert/utils'
import {
  ArxMap,
  DONT_QUADIFY,
  HudElements,
  SHADING_SMOOTH,
  Settings,
  Texture,
  UiElements,
  Vector3,
} from 'arx-level-generator'
import { LightDoor, Rune } from 'arx-level-generator/prefabs/entity'
import { loadRooms } from 'arx-level-generator/prefabs/rooms'
import { Speed } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { getNonIndexedVertices, loadOBJ } from 'arx-level-generator/tools/mesh'
import { applyTransformations, compile, roundToNDecimals } from 'arx-level-generator/utils'
import { randomSort } from 'arx-level-generator/utils/random'
import { BufferAttribute, MeshBasicMaterial, Vector2 } from 'three'
import { PCGame, PCGameVariant } from '@/entities/PCGame.js'
import { createGameStateManager } from '@/gameStateManager.js'
import { PowerupRing } from './entities/PowerupRing.js'
import { createBackYard } from './rooms/backYard.js'
import { createBathRoom } from './rooms/bathRoom.js'
import { createFrontYard } from './rooms/frontYard.js'
import { createMainHall } from './rooms/mainHall.js'
import { createPantry } from './rooms/pantry.js'
import { createPCRoom } from './rooms/pcRoom.js'

const settings = new Settings({
  levelIdx: parseInt(process.env.levelIdx ?? '1'),
  outputDir: process.env.outputDir,
  seed: process.env.seed,
  version: process.env.version === 'premium' ? 'premium' : 'normal',
  calculateLighting: process.env.calculateLighting === 'false' ? false : true,
  mode: process.env.mode === 'development' ? 'development' : 'production',
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

const originIdx = 4
const pcGameMesh = await loadOBJ('./pcgame', {
  scale: 0.1,
  materialFlags: ArxPolygonFlags.None,
  reversedPolygonWinding: true,
})

// ------------

const mesh = pcGameMesh[0]

const normals = mesh.geometry.getAttribute('normal') as BufferAttribute
const uvs = mesh.geometry.getAttribute('uv') as BufferAttribute

const ftlData: ArxFTL = {
  header: {
    origin: originIdx,
    name: 'pcgame',
  },
  vertices: [],
  faces: [],
  textureContainers: [],
  groups: [],
  actions: [],
  selections: [],
}

const vertexPrecision = 5

const vertices: { vector: Vector3; norm: Vector3; uv: Vector2; textureIdx: number }[] = []
const faceIndexes: TripleOf<number>[] = []
getNonIndexedVertices(mesh.geometry).forEach(({ idx, vector, materialIndex }, i) => {
  vertices.push({
    vector: new Vector3(
      roundToNDecimals(vertexPrecision, vector.x),
      roundToNDecimals(vertexPrecision, vector.y),
      roundToNDecimals(vertexPrecision, vector.z),
    ),
    norm: new Vector3(normals.getX(idx), normals.getY(idx), normals.getZ(idx)),
    uv: new Vector2(uvs.getX(idx), uvs.getY(idx)),
    textureIdx: materialIndex ?? 0,
  })

  if (i % 3 === 0) {
    faceIndexes.push([idx, -1, -1])
  } else {
    faceIndexes[faceIndexes.length - 1][i % 3] = idx
  }
})

const origin = vertices[ftlData.header.origin].vector.clone()

ftlData.vertices = vertices.map(({ vector, norm }) => ({
  vector: vector.sub(origin).toArxVector3(),
  norm: norm.toArxVector3(),
}))

ftlData.faces = faceIndexes.map(([aIdx, bIdx, cIdx]) => {
  const a = vertices[aIdx]
  const b = vertices[bIdx]
  const c = vertices[cIdx]
  const faceNormal = new Vector3().crossVectors(b.norm.clone().sub(a.norm), c.norm.clone().sub(a.norm)).normalize()

  return {
    faceType: ArxFaceType.Flat,
    vertexIdx: [aIdx, bIdx, cIdx],
    textureIdx: a.textureIdx,
    u: [a.uv.x, b.uv.x, c.uv.x],
    v: [a.uv.y, b.uv.y, c.uv.y],
    norm: faceNormal.toArxVector3(),
  }
})

let texture: Texture | undefined | (Texture | undefined)[] = undefined
if (mesh.material instanceof MeshBasicMaterial) {
  if (mesh.material.map instanceof Texture) {
    texture = mesh.material.map
  } else {
    console.warn('[warning] POC: Unsupported texture map in material when adding threejs mesh')
  }
} else if (Array.isArray(mesh.material)) {
  texture = mesh.material.map((material) => {
    if (material instanceof MeshBasicMaterial) {
      if (material.map instanceof Texture) {
        return material.map
      } else {
        console.warn('[warning] POC: Unsupported texture map in material when adding threejs mesh')
        return undefined
      }
    } else {
      console.warn('[warning] POC: Unsupported material found when adding threejs mesh')
      return undefined
    }
  })
} else if (typeof mesh.material !== 'undefined') {
  console.warn('[warning] POC: Unsupported material found when adding threejs mesh')
}

if (Array.isArray(texture)) {
  texture.forEach((t) => {
    if (typeof t !== 'undefined') {
      ftlData.textureContainers.push({
        filename: t.filename,
      })
    }
  })
} else if (typeof texture !== 'undefined') {
  ftlData.textureContainers.push({
    filename: texture.filename,
  })
}

const ftl = FTL.save(ftlData)
await fs.promises.writeFile(path.join(settings.assetsDir, 'pcgame.ftl'), ftl)

// -----------------------------------

const rooms = await loadRooms('./lalees-minigame.rooms', settings)
rooms.forEach((room) => {
  map.add(room, true)
})

const spawnZone = createZone({ name: 'spawn', drawDistance: 5000 })
map.zones.push(spawnZone)

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

const bathroomDoor = bathRoom._.door as LightDoor
bathroomDoor.setKey(pantry._.bathroomKey)

// -----------------------------------

const roomInteriors = [pcRoom, bathRoom, frontYard, backYard, mainHall, pantry]

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

map.finalize()
await map.saveToDisk(settings)

await compile(settings)

console.log('done')
