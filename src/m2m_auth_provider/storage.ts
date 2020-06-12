/**
 * Interface of the storage object
 */
export interface Storage {
    /**
     * This function must return an item stored with the key given in parameter
     * @param key Is the key of the item
     */
    getItem: (key: string) => any

    /**
     * This function must save an item in the store with the key given in parameter
     * @param key Is the key of the item
     * @param value Is the value of the item
     */
    setItem: (key: string, value: any) => void

    /**
     * This function must remove an item from the store
     * @param key Is the key of the item
     */
    removeItem: (key: string) => void
}
