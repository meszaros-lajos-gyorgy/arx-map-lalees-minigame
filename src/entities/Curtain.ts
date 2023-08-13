import { Entity, EntityConstructorPropsWithoutSrc } from 'arx-level-generator'

export class Curtain extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'fix_inter/hanging',
      ...props,
    })
  }
}

export class Curtain2 extends Entity {
  constructor(props: EntityConstructorPropsWithoutSrc = {}) {
    super({
      src: 'fix_inter/hanging2',
      ...props,
    })
  }
}
