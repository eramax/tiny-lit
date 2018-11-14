import { Constructor } from './types';

function defineProps(constructor: any): string[] {
    if (!constructor.__attrsMap) {
        const props: { [key: string]: Function } = constructor.properties;
        const attrsMap: { [key: string]: string } = Object.create(null);

        if (props) {
            for (const name in props) {
                attrsMap[
                    name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
                ] = name;

                Object.defineProperty(constructor.prototype, name, {
                    get(): any {
                        return (<any>this).__props[name];
                    },
                    set(newValue: any) {
                        const oldValue = (<any>this).__props[name];
                        (<any>this).__props[name] = props[name](newValue);

                        (<any>this).rendered &&
                            oldValue !== newValue &&
                            !this.update._scheduled &&
                            this.update();
                    }
                });
            }
        }

        constructor.__attrsMap = attrsMap;
        constructor.__observedProps = Object.keys(attrsMap);
    }

    return constructor.__observedProps;
}

export function withProps<T extends Constructor>(Base: T) {
    return class extends Base {
        __props: object = Object.create(null);
        [propName: string]: any;

        static get observedAttributes(): string[] {
            return defineProps(this);
        }

        attributeChangedCallback(name: string, _: string, newValue: string) {
            this[(<any>this.constructor).__attrsMap[name]] = newValue;
        }
    };
}
