import { Entity, Material, Rotation, Settings, Texture, Vector3 } from 'arx-level-generator'
import { ControlZone, Scale, Shadow } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { MathUtils } from 'three'
import { Mirror } from '@/entities/Mirror.js'
import { RoomContents } from '@/types.js'

export const createLeftCorridor = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  const rootMirror = new Mirror()
  rootMirror.script?.makeIntoRoot()

  const mirror = new Mirror({
    position: new Vector3(-1606, -120, 0),
    orientation: new Rotation(0, MathUtils.degToRad(180), 0),
  })
  mirror.script?.properties.push(new Scale(2), Shadow.off)

  const zone1Pos = new Vector3(-1900, 0, 0)
  const atTheGameDisplayRoomZone = createZone({
    name: 'at_the_game_display_room',
    size: new Vector3(200, Infinity, 200),
    position: zone1Pos,
  })

  const atTheGameDisplaysZoneController = Entity.marker.at({ position: zone1Pos }).withScript()
  atTheGameDisplaysZoneController.script?.properties.push(new ControlZone(atTheGameDisplayRoomZone))
  atTheGameDisplaysZoneController.script?.on('controlledzone_enter', () => {
    return `sendevent entered_at_the_game_display_room_zone ${gameStateManager.ref} nop`
  })

  const zone2Pos = new Vector3(-400, 0, 0)
  const atTheMainHallZone = createZone({
    name: 'at_the_main_hall',
    size: new Vector3(200, Infinity, 200),
    position: zone2Pos,
  })

  const atTheMainHallZoneController = Entity.marker.at({ position: zone2Pos }).withScript()
  atTheMainHallZoneController.script?.properties.push(new ControlZone(atTheMainHallZone))
  atTheMainHallZoneController.script?.on('controlledzone_enter', () => {
    return `sendevent entered_at_the_main_hall_zone ${gameStateManager.ref} nop`
  })

  return {
    meshes: [],
    entities: [rootMirror, mirror, atTheGameDisplaysZoneController, atTheMainHallZoneController],
    lights: [],
    zones: [atTheGameDisplayRoomZone, atTheMainHallZone],
    _: {},
  }
}
