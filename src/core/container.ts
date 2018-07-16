import 'reflect-metadata'

import { Container } from 'inversify'

import * as core from '../core/ioc'
import * as pos from '../pos/ioc'

const container = new Container({ autoBindInjectable: true })
const modules = [core.module, pos.module]
container.load(...modules)

export { container }

export async function containerDispose() {
  await core.dispose(container)
  container.unload(...modules)
}
