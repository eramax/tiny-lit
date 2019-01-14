export { Template } from './template';

import { TemplateInterface } from './types';
import { Template } from './template';
import { removeNodes } from './utils';

export function render(template: TemplateInterface, container: HTMLElement) {
    if (!render.instances.has(container)) {
        render.instances.set(container, template);
        removeNodes(container.firstChild!, container.lastChild!, container);

        container.appendChild(template.create());
    } else {
        render.instances.get(container)!.update(template.values);
    }
}
render.instances = new WeakMap<HTMLElement, TemplateInterface>();

export function html(strings: any, ...values: any[]): Template {
    return new Template(strings, values);
}
