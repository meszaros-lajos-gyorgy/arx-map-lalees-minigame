import { Entity, Rotation, Settings, Vector3 } from 'arx-level-generator'
import { Rune, CatacombHeavyDoor } from 'arx-level-generator/prefabs/entity'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { useDelay } from 'arx-level-generator/scripting/hooks'
import { ControlZone, Label } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { pickRandom, randomBetween, randomIntBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { CeilingLamp } from '@/entities/CeilingLamp.js'
import { WetFloorSign } from '@/entities/WetFloorSign.js'
import { createCeilingLight } from '@/prefabs/ceilingLight.js'
import { createTable } from '@/prefabs/table.js'
import { RoomContents } from '@/types.js'

export const createBackrooms = async (
  settings: Settings,
  gameStateManager: Entity,
  cursors: { origin: Vector3; size: Vector3; name: string }[],
): Promise<RoomContents> => {
  const contents: RoomContents = {
    meshes: [],
    entities: [],
    lights: [],
    zones: [],
    _: {},
  }

  const roomOrigin = new Vector3(0, -3350, 0)

  const aam = new Rune('aam', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })
  aam.script?.on('inventoryuse', () => {
    return `sendevent got_rune ${gameStateManager.ref} aam`
  })
  const folgora = new Rune('folgora', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })
  folgora.script?.on('inventoryuse', () => {
    return `sendevent got_rune ${gameStateManager.ref} folgora`
  })
  const taar = new Rune('taar', {
    position: roomOrigin.clone().add(new Vector3(randomBetween(-200, 200), 0, randomBetween(-200, 200))),
  })
  taar.script?.on('inventoryuse', () => {
    return `sendevent got_rune ${gameStateManager.ref} taar`
  })
  contents.entities.push(aam, folgora, taar)

  const entryZone = createZone({
    position: roomOrigin
      .clone()
      // Y axis is flipped for the zone
      .multiply(new Vector3(1, -1, 1))
      .add(new Vector3(0, 50, 0)),
    size: new Vector3(100, 50, 100),
    name: 'backrooms-entry',
  })
  contents.zones.push(entryZone)

  const entry = Entity.marker.withScript().at({
    position: roomOrigin.clone(),
  })
  entry.script?.properties.push(new ControlZone(entryZone))
  entry.script?.on('controlledzone_enter', () => {
    return `sendevent landed_in_backrooms ${gameStateManager.ref} nop`
  })
  contents.entities.push(entry)
  contents._.entry = entry

  const rootCeilingLamp = new CeilingLamp()
  rootCeilingLamp.script?.makeIntoRoot()
  contents.entities.push(rootCeilingLamp)

  const offices = cursors
    .filter(({ name }) => name.startsWith('backrooms-room-'))
    .map(({ origin, size, name }, idx) => {
      return {
        name,
        position: origin.clone(),
        size: size.clone(),
        isLampOn: idx === 0,
        lampRadius: Math.max(size.x, size.y, size.z) * 2,
      }
    })

  offices.forEach(({ position, isLampOn, lampRadius, size }) => {
    const { entities, lights } = createCeilingLight({
      position: position.clone().add(new Vector3(0, -size.y + 10, 0)),
      radius: lampRadius,
      isOn: isLampOn,
    })
    contents.entities.push(...entities)
    contents.lights.push(...lights)
  })

  const room2 = offices.find(({ name }) => name === 'backrooms-room-02')
  if (room2) {
    const { meshes } = createTable({
      position: room2.position.clone().add(new Vector3(-room2.size.x / 2 + 50, -80, 0)),
      angleY: 90,
    })
    contents.meshes.push(...meshes)
  }

  const exitCursor = cursors.find(({ name }) => name === 'backrooms-exit')
  if (exitCursor) {
    const exitZone = createZone({
      position: exitCursor.origin
        .clone()
        .add(new Vector3(0, 0, 300))
        .multiply(new Vector3(1, -1, 1))
        .add(new Vector3(0, 50, 0)),
      size: new Vector3(150, 50, 100),
      name: 'backrooms-exit',
    })
    contents.zones.push(exitZone)

    const exit = Entity.marker.withScript().at({
      position: roomOrigin.clone(),
    })
    exit.script?.properties.push(new ControlZone(exitZone))
    exit.script?.on('controlledzone_enter', () => {
      return `
        sendevent player_leaves_backrooms ${gameStateManager.ref} nop
      `
    })
    contents.entities.push(exit)

    const exitKey = Entity.key.withScript().at({
      position: pickRandom(offices).position,
    })
    exitKey.script?.properties.push(new Label('[key--backrooms-exit]'))

    // TODO: add custom texture to this door
    const fireExitDoor = new CatacombHeavyDoor({
      position: exitCursor.origin.clone().add(new Vector3(75, 0, exitCursor.size.z / 2 - 10)),
      orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
      isLocked: true,
    })
    fireExitDoor.setKey(exitKey)
    fireExitDoor.script?.properties.push(new Label('[door--backrooms-exit]'))
    contents.entities.push(fireExitDoor, exitKey)
  }

  const wetFloorSign = new WetFloorSign({
    position: roomOrigin.clone().add(new Vector3(0, 0, 560)),
    orientation: new Rotation(0, MathUtils.degToRad(-90), 0),
  })
  contents.entities.push(wetFloorSign)

  return contents
}
