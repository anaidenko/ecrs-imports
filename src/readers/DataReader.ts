export interface DataReader<T> {
  read (): Promise<T[]>
  mapItem (data: any): T
}
