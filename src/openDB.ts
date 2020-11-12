import { open } from 'sqlite'
import { Database } from 'sqlite3'

export async function openDB () {
  return open({
    filename: 'cars.sqlite',
    driver: Database
  })
}