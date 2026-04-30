import { db } from './db'

export const Settings = {
  get: <T>(key: string): Promise<T | undefined> =>
    db.settings.get(key).then((r) => r?.value as T | undefined),
  set: (key: string, value: unknown): Promise<string> =>
    db.settings.put({ key, value }),
  delete: (key: string): Promise<void> =>
    db.settings.delete(key),
}
