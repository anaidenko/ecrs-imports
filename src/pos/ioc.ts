import { ContainerModule } from 'inversify'

import { ECRS } from './ECRS'
import { WinePOS } from './WinePOS'
import * as PosTypes from './types'

export const module = new ContainerModule(bind => {
  bind(PosTypes.WinePOS).to(WinePOS)
  bind(PosTypes.ECRS).to(ECRS)
})
