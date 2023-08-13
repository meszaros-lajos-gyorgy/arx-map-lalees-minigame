import { ArxPolygonFlags } from 'arx-convert/types'
import { Entity, Material, Rotation, Texture, Vector3 } from 'arx-level-generator'
import { createBox } from 'arx-level-generator/prefabs/mesh'
import { TweakSkin } from 'arx-level-generator/scripting/commands'
import { Interactivity, Scale } from 'arx-level-generator/scripting/properties'
import { flipUVHorizontally } from 'arx-level-generator/tools/mesh'
import { MathUtils, Vector2 } from 'three'

const textures = {
  monitorFront: Texture.fromCustomFile({
    filename: 'monitor-front.bmp',
    sourcePath: './textures',
  }),
  monitorBack: Texture.fromCustomFile({
    filename: 'monitor-back.jpg',
    sourcePath: './textures',
  }),
  monitorLeft: Texture.fromCustomFile({
    filename: 'monitor-left.jpg',
    sourcePath: './textures',
  }),
  monitorRight: Texture.fromCustomFile({
    filename: 'monitor-right.jpg',
    sourcePath: './textures',
  }),
  computerPlastic: Texture.fromCustomFile({
    filename: 'computer-plastic.jpg',
    sourcePath: './textures',
  }),
  youreWinner: Texture.fromCustomFile({
    filename: 'youre-winner.jpg',
    sourcePath: './textures',
  }),
  keyboardTop: Texture.fromCustomFile({
    filename: 'keyboard-top.jpg',
    sourcePath: './textures',
  }),
  computerCaseFront: Texture.fromCustomFile({
    filename: 'computer-case-front.jpg',
    sourcePath: './textures',
  }),
}

const createMonitor = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const monitorBody = createBox({
    position,
    origin: new Vector2(0, 1),
    size: 40,
    angleY,
    materials: [
      Material.fromTexture(textures.monitorLeft, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.monitorRight, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.monitorBack, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  const monitorHead = createBox({
    position,
    origin: new Vector2(0, -1),
    size: new Vector3(50, 50, 10),
    angleY,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.monitorFront, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  const monitorPlinth = createBox({
    position: position.clone().add(new Vector3(0, 30, 0)),
    origin: new Vector2(0, 1.5),
    size: new Vector3(30, 6, 30),
    angleY,
    materials: Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
  })

  const monitorLeg = createBox({
    position: position.clone().add(new Vector3(0, 25, 0)),
    origin: new Vector2(0, 2.25),
    size: new Vector3(20, 10, 20),
    angleY,
    materials: Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
  })

  const monitorFrontBevel = createBox({
    position,
    origin: new Vector2(0, 5.6),
    size: new Vector3(46, 46 * (3 / 4), 3),
    angleY: angleY + 180,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided }),
      // Material.fromTexture(image, {
      //   flags: ArxPolygonFlags.NoShadow | ArxPolygonFlags.DoubleSided | ArxPolygonFlags.Glow | ArxPolygonFlags.Tiled,
      // }),
      Material.fromTexture(Texture.alpha),
      Material.fromTexture(Texture.alpha),
    ],
  })
  flipUVHorizontally(monitorFrontBevel.geometry)

  return {
    meshes: [monitorBody, monitorHead, monitorPlinth, monitorLeg, monitorFrontBevel],
  }
}

const createKeyboard = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const keyboard = createBox({
    position,
    origin: new Vector2(0, -1),
    size: new Vector3(50, 2, 21),
    angleY,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.keyboardTop, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  return {
    meshes: [keyboard],
  }
}

const createComputerCase = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const keyboard = createBox({
    position,
    origin: new Vector2(-1, 0),
    size: new Vector3(22, 50, 60),
    angleY,
    materials: [
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerCaseFront, { flags: ArxPolygonFlags.NoShadow }),
      Material.fromTexture(textures.computerPlastic, { flags: ArxPolygonFlags.NoShadow }),
    ],
  })

  return {
    meshes: [keyboard],
  }
}

const createScreen = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const screen = new Entity({
    src: 'fix_inter/l0_alicia_secretdoor',
    position,
    orientation: new Rotation(0, MathUtils.degToRad(-90 + angleY)),
  })

  screen.withScript()
  screen.script?.properties.push(Interactivity.off, new Scale(0.48))

  screen.script?.on(
    'init',
    new TweakSkin(new Texture({ filename: '[wood]_ALICIAROOM_LAMBRIS02.jpg' }), textures.youreWinner),
  )
  screen.script?.on('init', new TweakSkin(new Texture({ filename: '[wood]_ALICIAROOM_LAMBRIS01.jpg' }), Texture.alpha))
  screen.script?.on('init', new TweakSkin(new Texture({ filename: 'ALICIAROOM_MUR01.jpg' }), Texture.alpha))
  screen.script?.on('init', new TweakSkin(new Texture({ filename: 'ALICIAROOM_MUR02.jpg' }), Texture.alpha))
  screen.script?.on('init', new TweakSkin(new Texture({ filename: 'ALICIAROOM_POUTRES.jpg' }), Texture.alpha))

  return screen
}

export const createComputer = ({ position, angleY = 0 }: { position: Vector3; angleY?: number }) => {
  const monitor = createMonitor({
    position: position.clone().add(new Vector3(0, -32, 20)),
    angleY: angleY - 3,
  })
  const keyboard = createKeyboard({ position: position.clone().add(new Vector3(-5, 0, 0)), angleY })
  const computerCase = createComputerCase({ position: position.clone().add(new Vector3(70, -25, 20)), angleY })

  // TODO: check if rotation actually work correctly
  const screen = createScreen({
    position: position.clone().add(new Vector3(-24, -7, 12)),
    angleY: angleY + 3,
  })

  return {
    meshes: [...monitor.meshes, ...keyboard.meshes, ...computerCase.meshes],
    entities: [screen],
  }
}
