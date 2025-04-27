import { Entity, type Settings, Vector3 } from 'arx-level-generator'
import { ControlZone } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { RoomContents } from '@/types.js'

export const createRightCorridor = async (settings: Settings, gameStateManager: Entity): Promise<RoomContents> => {
  const zone1Pos = new Vector3(1250, 0, -700)
  const atTheFrontYardZone = createZone({
    name: 'at_the_front_yard',
    size: new Vector3(200, Infinity, 200),
    position: zone1Pos,
  })

  const atTheFrontYardZoneController = Entity.marker.at({ position: zone1Pos }).withScript()
  atTheFrontYardZoneController.script?.properties.push(new ControlZone(atTheFrontYardZone))
  atTheFrontYardZoneController.script?.on('controlledzone_enter', () => {
    return `sendevent entered_at_the_front_yard_zone ${gameStateManager.ref} nop`
  })

  const zone2Pos = new Vector3(1250, 0, -450)
  const atTheEntranceZone = createZone({
    name: 'at_the_entrance',
    size: new Vector3(200, Infinity, 200),
    position: zone2Pos,
  })

  const atTheEntranceZoneController = Entity.marker.at({ position: zone2Pos }).withScript()
  atTheEntranceZoneController.script?.properties.push(new ControlZone(atTheEntranceZone))
  atTheEntranceZoneController.script?.on('controlledzone_enter', () => {
    return `sendevent entered_at_the_entrance_zone ${gameStateManager.ref} nop`
  })

  return {
    meshes: [],
    entities: [atTheFrontYardZoneController, atTheEntranceZoneController],
    lights: [],
    zones: [atTheFrontYardZone, atTheEntranceZone],
    _: {},
  }
}
