import * as api from '../api'

export interface IDataReader {
  readData(): Promise<api.ImportPayload | undefined>
}
