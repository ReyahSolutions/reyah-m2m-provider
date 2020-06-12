import { LocalStorage } from 'node-localstorage';
import { Storage } from './storage';

/**
 * NodeStorage is the default storage implementation, designed to be used with node
 */
export default class NodeStorage implements Storage {
    private storage: LocalStorage;

    /**
     * @param path Is the path where to store the tokens
     */
    constructor(path: string = 'reyah-m2m-storage') {
        this.storage = new LocalStorage(path);
    }

    /**
     * Implementation of the getItem function
     * @param key Is the key of the item
     * @return The item with the key given in parameter
     */
    getItem(key: string): any {
        return this.storage.getItem(key);
    }

    /**
     * Implementation of the removeItem function
     * @param key Is the key of the item to remove
     */
    removeItem(key: string): void {
        return this.storage.removeItem(key);
    }

    /**
     * Implementation of the setItem function
     * @param key Is the key of the item to store
     * @param value Is the value of the item to store
     */
    setItem(key: string, value: any): void {
        return this.storage.setItem(key, value);
    }
}
