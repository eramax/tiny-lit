import { Element as TlElement } from '../src/Element';
import { html } from '@tiny-lit/core';

describe('Element', () => {
    const root = document.createElement('div');
    const template = text => html`<div>${text}</div>`;
    customElements.define('a-element', Element);
    customElements.define(
        'c-element',
        class extends TlElement {
            render() {
                return template(this.state.text);
            }
        }
    );
    customElements.define(
        's-element',
        class extends TlElement {
            render() {
                return template(this.state.text);
            }
        }
    );

    customElements.define(
        'p-element',
        class extends TlElement {
            static get properties() {
                return {
                    a: String,
                    b: Number,
                    c: Boolean,
                    myProp: String,
                    mySuperProp: Boolean,
                };
            }

            a = 'a';
            b = 1;
            c = false;
            myProp = null;
            mySuperProp = null;

            render() {
                return template(this.state.text);
            }
        }
    );

    beforeAll(() => {
        document.body.appendChild(root);
    });

    afterEach(() => {
        root.innerHTML = '';
    });

    it('should init with empty state', () => {
        const e = <any>document.createElement('c-element');

        expect(e.state).toEqual({});
    });

    it('state should be immutable', () => {
        const e = <any>document.createElement('c-element');
        const s = e.state;

        e.setState({});

        expect(e.state).not.toBe(s);
    });

    it('setState should run callback after render', () => {
        const callback = jasmine.createSpy('elem');
        const e = <any>document.createElement('s-element');

        e.setState({}, callback);
        e.setState({}, callback);

        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should update on setState', () => {
        const e = <any>document.createElement('c-element');
        const r = e.update.bind(e);

        let updated = false;
        e.update = function() {
            updated = true;
            r();
        };
        e.setState({});

        expect(updated).toBe(true);
    });

    it('should accept functions as setState argument', () => {
        const e = <any>document.createElement('c-element');
        const increment = state => ({
            value: state.value + 1,
        });

        e.setState({
            value: 0,
        });
        expect(e.state.value).toBe(0);

        e.setState(increment);
        expect(e.state.value).toBe(1);
    });

    it('should pass state and element as setState function arguments', done => {
        const e = <any>document.createElement('c-element');
        const increment = (state, instance) => {
            expect(state).toEqual({});
            expect(instance).toBe(e);

            done();
        };

        e.setState(increment);
    });

    it('should save shadowRoot when attaching', () => {
        const e: any = document.createElement('c-element');
        const shadowRoot = e.attachShadow({ mode: 'open' });

        expect(shadowRoot).toBe(e.renderRoot);
    });

    it('should render inside shadow dom', done => {
        const e: any = document.createElement('c-element');
        const shadowRoot = e.attachShadow({ mode: 'open' });

        e.setState({ text: 'ciaone' }, () => {
            expect(shadowRoot.innerHTML).toBe('<div>ciaone</div>');
            done();
        });
    });

    describe('withProps', () => {
        it('should reflect props to attributes', done => {
            const e: any = document.createElement('p-element');

            expect(e.constructor.observedAttributes).toEqual([
                'a',
                'b',
                'c',
                'my-prop',
                'my-super-prop',
            ]);

            e.setAttribute('my-prop', 'true');
            e.setAttribute('my-super-prop', 'true');

            requestAnimationFrame(() => {
                // expect(e.constructor.properties.mySuperProp).toHaveBeenCalled();
                // expect(e.constructor.properties.myProp).toHaveBeenCalled();

                expect(e.mySuperProp).toBe(true);
                expect(e.myProp).toBe('true');

                done();
            });
        });

        it('should initialize observed properties', () => {
            const e: any = document.createElement('p-element');

            e.constructor.observedAttributes.forEach(attrName => {
                const desc = Object.getOwnPropertyDescriptor(
                    e.constructor.prototype,
                    e.constructor.__attrsMap[attrName]
                );

                expect(desc).toBeDefined();
                expect(typeof desc!.get).toBe('function');
                expect(typeof desc!.set).toBe('function');
            });

            expect(e.__props).toBeDefined();
            e.remove();
        });

        it('should trigger update when props changing', () => {
            const e: any = document.createElement('p-element');
            const callback = jasmine.createSpy('elem');

            e.update();
            e.update = callback;

            e.a = 1;

            expect(callback).toHaveBeenCalled();
        });

        it('should coerce property value', () => {
            const e: any = document.createElement('p-element');
            const callback = jasmine.createSpy('elem');

            e.update();
            e.update = callback;

            e.setAttribute('a', '1'); // string
            e.setAttribute('b', '1'); // number
            e.setAttribute('c', ''); // boolean

            expect(e.a).toBe('1');
            expect(e.b).toBe(1);
            expect(e.c).toBe(false);
        });
    });
});
