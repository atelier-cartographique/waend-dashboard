
/**
 * A source of states
 */


import { Lens } from 'monocle-ts';

export type KeyOfIShape<IShape> = keyof IShape;
export type SubTypeOfIShape<IShape> = IShape[KeyOfIShape<IShape>];

export interface IReducer<IShape, S extends SubTypeOfIShape<IShape>> {
    (a: S): S;
}

export interface IObserver<IShape, K extends KeyOfIShape<IShape>> {
    key: K;
    handler(a: IShape[K]): void;
}

export interface IStoreInteractions<IShape> {
    dispatch<K extends KeyOfIShape<IShape>>(key: K, handler: IReducer<IShape, IShape[K]>): void;
    observe<K extends KeyOfIShape<IShape>>(key: K, handler: (a: IShape[K]) => void): void;
    get<K extends keyof IShape>(key: K): IShape[K];
    version(): number;
    reset(n: number): void;
}

const getLocaleStorage =
    () => {
        try {
            const storage = window.localStorage;
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return storage;
        }
        catch (e) {
            return false;
        }
    };

const proxyfyObject =
    <T extends object>(a: T): T => {
        const set = <K extends keyof T>(_target: T, prop: K, value: T[K]) => {
            throw (new Error(`Immutable target: cannot set ${prop} to ${value}`));
        };

        const get = <K extends keyof T>(target: T, prop: K) => {
            const v = Reflect.get(target, prop);
            if ('constructor' === prop) {
                return v;
            }
            if (null === v) {
                return null;
            }
            if (v instanceof Object) {
                return proxyfy(v);
            }
            return v;
        };

        return (new Proxy(a, { get, set }));
    };

const proxyfy =
    <T extends object>(a: T): T => {
        return proxyfyObject(a);
    };


export const source =
    <IShape, KI extends keyof IShape>(localKeys: KI[]) => {


        const toLocalStorage =
            (state: IShape) => {
                const storage = getLocaleStorage();
                if (storage) {
                    localKeys.forEach((key) => {
                        storage.setItem(key, JSON.stringify(state[key]));
                    });
                }
            };

        const getLocalStorageValue =
            <K extends keyof IShape>(storage: Storage, key: K): IShape[K] | null => {
                const jsonString = storage.getItem(key);
                if (jsonString) {
                    return JSON.parse(jsonString);
                }
                return null;
            };

        const importLocalStorage =
            (state: IShape) => {
                const storage = getLocaleStorage();
                if (storage) {
                    localKeys.forEach((key) => {
                        const localState = getLocalStorageValue(storage, key);
                        if (localState) {
                            state[key] = localState;
                        }
                    });
                }
                return state;
            };

        const getLens =
            <K extends keyof IShape>(k: K) => {
                const L = Lens.fromProp<IShape, K>(k);
                return L;
            };




        const start =
            (initialState: IShape, withLocalStorage = true): IStoreInteractions<IShape> => {

                const store = [initialState];
                const observers: IObserver<IShape, KeyOfIShape<IShape>>[] = [];

                // let logDev = (_handler: IReducer, _state: IShape): void => {
                //     // noop
                // };

                const head = () => store[store.length - 1];

                const get = <K extends keyof IShape>(key: K): IShape[K] => {
                    const state = head();
                    const value = state[key];

                    if (value instanceof Object) {
                        return proxyfy(value);
                    }

                    return value;
                };





                const observe =
                    <K extends KeyOfIShape<IShape>>(key: K, handler: (a: IShape[K]) => void): void => {
                        if (observers.findIndex(o => o.handler === handler) === -1) {
                            observers.push({ key, handler });
                        }
                    };

                const processObservers =
                    <K extends KeyOfIShape<IShape>>(a: K) => {
                        observers.filter(o => o.key === a)
                            .forEach((o) => {
                                const state = get(a);
                                setTimeout(() => {
                                    o.handler(state);
                                }, 1);
                            });
                    };

                const dispatch =
                    <K extends KeyOfIShape<IShape>>(key: K, handler: IReducer<IShape, IShape[K]>): void => {
                        const lens = getLens(key);
                        const newState = lens.modify(handler, head());
                        toLocalStorage(newState);
                        store.push(newState);
                        processObservers(key);
                        // logDev(handler, newState);

                    };


                if (withLocalStorage) {
                    const ns = importLocalStorage(initialState);
                    store.push(ns);
                }

                const version = () => store.length;

                const reset =
                    (n: number) => {
                        const end = Math.max(1, store.length - n);
                        store.splice(end);
                    };

                return { dispatch, get, version, reset, observe };
            };


        return start;
    };


