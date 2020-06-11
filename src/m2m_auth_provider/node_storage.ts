import { LocalStorage } from 'node-localstorage';
import { Storage } from './storage';

export default class NodeStorage implements Storage {
    private storage: LocalStorage;

    constructor(path: string = 'reyah-m2m-storage') {
        this.storage = new LocalStorage(path);
    }

    getItem(key: string): any {
        return this.storage.getItem(key);
    }

    removeItem(key: string): void {
        return this.storage.removeItem(key);
    }

    setItem(key: string, value: any): void {
        return this.storage.setItem(key, value);
    }
}
