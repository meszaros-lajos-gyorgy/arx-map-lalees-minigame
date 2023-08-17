import { Entity, Light, Zone } from 'arx-level-generator'
import { Mesh } from 'three'

export type RoomContents = {
  meshes: Mesh[]
  entities: Entity[]
  lights: Light[]
  zones: Zone[]
  _: Record<string, Entity>
}
