import { render, Template } from '@tiny-lit/core';
import {
    Constructor,
    Element as ElementInterface,
} from './types';

export function withElement<T extends Constructor<HTMLElement>>(Base: T) {
    return class extends Base implements ElementInterface {
        state: any = {};
        rendered: boolean = false;
        renderCallbacks: Array<Function> = [];
        renderRoot: HTMLElement | ShadowRoot = this;

        attachShadow(shadowRootInitDict: ShadowRootInit) {
            return (this.renderRoot = super.attachShadow.call(
                this,
                shadowRootInitDict
            ));
        }

        connectedCallback() {
            this.update();
        }

        setState(nextState: object | Function, callback?: Function): void {
            const state: any = this.state;

            this.state = {
                ...state,
                ...(typeof nextState === 'function'
                    ? nextState(state, this)
                    : nextState)
            };

            callback && this.renderCallbacks.push(callback);

            this.update();
        }

        render(): Template | null {
            return null;
        }

        update() {
            this.rendered = true;

            const template = this.render();
            template && render(template, this.renderRoot as any);

            while (this.renderCallbacks.length) this.renderCallbacks.shift()!();
        };
    };
}
