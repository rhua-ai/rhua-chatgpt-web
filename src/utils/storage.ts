import localforage from 'localforage';

const instance = localforage.createInstance({
  name: "rhua",
  driver: localforage.INDEXEDDB
});

export class LocalForageService {

  static async setItem<T>(key: string, value: T): Promise<T> {
    return await instance.setItem<T>(key, value);
  }

  static async getItem<T>(key: string): Promise<T | null> {
    return await instance.getItem<T>(key);
  }

  static async removeItem(key: string): Promise<void> {
    return await instance.removeItem(key);
  }

  static async clear(): Promise<void> {
    return await instance.clear();
  }

  static async pushItem<T>(key: string, value: T): Promise<T[]> {
    const array = await instance.getItem<T[]>(key) || [];
    array.push(value);
    return await instance.setItem(key, array);
  }
}