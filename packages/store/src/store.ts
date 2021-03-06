import {
    Action,
    StoreConfig,
    StoreInterface,
    Mutation,
    SubcribeCallback,
    MutationHandler,
    ActionHandler
} from './types';

import { normalizeEvent } from './events';

const StateProp = Symbol();

const objToMap = (obj: any, map: Map<any, any>) => {
    for (const key in obj) map.set(key, obj[key]);
};

export class Store<S> implements StoreInterface {
    [StateProp]: S = {} as S;
    readonly mutations: Map<string, MutationHandler> = new Map();
    readonly actions: Map<string, ActionHandler> = new Map();
    private listeners: Set<Function> = new Set();

    constructor(config: StoreConfig = {}) {
        objToMap(config.mutations, this.mutations);
        objToMap(config.actions, this.actions);

        this[StateProp] = { ...config.initialState };

        if (config.plugins)
            config.plugins!.forEach(plugin => plugin(this));
    }

    dispatch = normalizeEvent((action: Action) => {
        const actions = this.actions;
        if (actions.has(action.type)) actions.get(action.type)!(this, action.data);
    });

    get state(): S {
        return this[StateProp];
    }

    subscribe(callback: SubcribeCallback) {
        const { listeners } = this;

        const handler = (mutation?: Mutation) => callback(this.state, mutation);

        listeners.add(handler);
        callback(this.state);

        return () => listeners.delete(handler);
    }

    commit = normalizeEvent((mutation: Mutation) => {
        const mutations = this.mutations;
        if (mutations.has(mutation.type)) {
            this[StateProp] = <any>mutations.get(mutation.type)!(this.state, mutation.data);
        }

        this.listeners.forEach(listener => listener(mutation));
    });
}

export const createStore = (store: StoreConfig) => {
    return new Store(store);
};
