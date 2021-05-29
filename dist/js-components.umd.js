(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.jscomponents = {}));
}(this, (function (exports) { 'use strict';

    class UnquotedString {
        constructor(string) {
            this.value = string;
        }
    }
    function parseOptions(str) {
        return str.split(',').map(s => s.trim()).filter(s => s.length).map((option) => {
            if (option == 'undefined')
                return undefined;
            if (option == 'null')
                return null;
            if (option == 'true')
                return true;
            if (option == 'false')
                return false;
            if (!isNaN(parseFloat(option))) {
                return parseFloat(option);
            }
            // If the option is quoted, remove the quotes and return as literal string
            if ((option.charAt(0) == '\'' && option.charAt(option.length) == '\'') ||
                (option.charAt(0) == '\"' && option.charAt(option.length) == '\"')) {
                return option.slice(1, option.length - 1);
            }
            // Anything else will be treated as an unquoted string
            return new UnquotedString(option);
        });
    }
    // capture groups:                12   2        1 34       4       3 5       5     6     6     7  7
    const actionDescriptorPattern = /^((\S+)\s*->\s*)?(([^\s#]+)\s*#\s*)?([^\s(]+)\s*\(([^)]*)\)\s*(.+)?$/i;
    /**
     * Parser for action descriptors
     *
     * Scheme: "[event]->[namespace]#[method]([option, ...options]) ..."
     */
    function parseActionDescriptor(descriptor) {
        const descriptors = [];
        while (descriptor.trim()) {
            const matches = descriptor.match(actionDescriptorPattern);
            if (!matches) {
                console.error(`Descriptor '${descriptor}' is invalid.`);
                return [];
            }
            descriptors.push({
                event: matches[1] ? matches[1].slice(0, -2).trim() : undefined,
                identifier: matches[4],
                method: matches[5],
                options: matches[6] ? parseOptions(matches[6]) : []
            });
            descriptor = matches[7] || '';
        }
        return descriptors;
    }

    function getOrSet(map, key, create) {
        if (map.has(key)) {
            return map.get(key);
        }
        const value = create();
        map.set(key, value);
        return value;
    }
    function getElementDefaultEvent(element) {
        switch (element.tagName.toLowerCase()) {
            case 'a':
            case 'button':
                return 'click';
            case 'form':
                return 'submit';
            case 'input':
                return (element.getAttribute('type') == 'submit') ? 'click' : 'input';
            case 'select':
                return 'change';
            case 'textarea':
                return 'input';
        }
    }

    class Component {
        constructor(element) {
            this.references = {};
            this.element = element;
        }
        get data() {
            if (!this._data) {
                throw new Error(`Can't access data before component has been set up.`);
            }
            return this._data;
        }
        setup(initializer) {
            this._data = initializer({
                element: this.element,
                ref: (name) => {
                    var _a;
                    return ((_a = this.references[name]) === null || _a === void 0 ? void 0 : _a[0]) || null;
                },
                refs: (name) => {
                    return this.references[name] || [];
                }
            });
        }
        addReference(element, descriptor) {
            if (this.references[descriptor.property]) {
                this.references[descriptor.property].push(element);
            }
            else {
                this.references[descriptor.property] = [element];
            }
        }
        addDispatcher(element, descriptor) {
            if (!(descriptor.method in this.data)) {
                console.warn(`Function '${descriptor.method}' does not exist in Component.`, element);
                return;
            }
            const method = this.data[descriptor.method];
            if (typeof method !== 'function') {
                console.warn(`'${descriptor.method}' is not a function.`, element);
                return;
            }
            let event = descriptor.event;
            if (!event) {
                event = getElementDefaultEvent(element);
                if (!event) {
                    console.warn(`No default event type found for element. Add an event type to the on directive.`, element);
                    return;
                }
            }
            element.addEventListener(event, function listener(event) {
                // copy options and replace magic argument '$event' with Event object
                const options = descriptor.options.map(option => {
                    if (option instanceof UnquotedString) {
                        if (option.value == '$event') {
                            return event;
                        }
                        return option.value;
                    }
                    return option;
                });
                method(...options);
            });
        }
    }

    // capture groups:        12       2       1 3   3   4  4
    const propertyPattern = /^(([^\s#]+)\s*#\s*)?(\S+)\s*(.*)$/i;
    /**
     * Parser for property references
     *
     * Scheme: "[namespace]#[object.prop] ..."
     */
    function parsePropertyDescriptor(descriptor) {
        const descriptors = [];
        while (descriptor.trim()) {
            const matches = descriptor.match(propertyPattern);
            if (!matches) {
                console.error(`Descriptor '${descriptor}' is invalid.`);
                return [];
            }
            descriptors.push({
                identifier: matches[2],
                property: matches[3]
            });
            descriptor = matches[4] || '';
        }
        return descriptors;
    }

    class Application {
        constructor(options = {}) {
            this.definitions = new Map;
            this.repository = new WeakMap;
            this.prefix = options.prefix || 'x';
        }
        define(name, initializer) {
            this.definitions.set(name, initializer);
        }
        run(root = document.body) {
            root.querySelectorAll(`[${this.prefix}-ref]`).forEach(element => {
                const descriptors = parsePropertyDescriptor(element.getAttribute(`${this.prefix}-ref`));
                descriptors.forEach(descriptor => {
                    const scope = this.findClosestScope(element, descriptor.identifier);
                    if (scope) {
                        const component = this.pickComponent(scope.element, scope.identifier);
                        component.addReference(element, descriptor);
                    }
                });
            });
            root.querySelectorAll(`[${this.prefix}-component]`).forEach(scope => {
                let identifiers = scope.getAttribute(`${this.prefix}-component`).split(/\s+/).filter(s => s.length);
                identifiers.forEach(identifier => {
                    const initialize = this.definitions.get(identifier);
                    if (!initialize) {
                        console.warn(`Definition for '${identifier}' is missing.`);
                        return;
                    }
                    const component = this.pickComponent(scope, identifier);
                    component.setup(initialize);
                });
            });
            root.querySelectorAll(`[${this.prefix}-on]`).forEach(element => {
                const descriptors = parseActionDescriptor(element.getAttribute(`${this.prefix}-on`));
                descriptors.forEach(descriptor => {
                    const scope = this.findClosestScope(element, descriptor.identifier);
                    if (scope) {
                        const component = this.pickComponent(scope.element, scope.identifier);
                        component.addDispatcher(element, descriptor);
                    }
                });
            });
        }
        /**
         * Get or create a Component based on the scope and identifier. If called
         * multiple times with the same arguments, it will return the same Component.
         */
        pickComponent(scope, identifier) {
            const identifiers = getOrSet(this.repository, scope, () => new Map());
            return getOrSet(identifiers, identifier, () => {
                return new Component(scope);
            });
        }
        findClosestScope(origin, identifier = null) {
            let element;
            if (!identifier) {
                element = origin.closest(`[${this.prefix}-component]`);
                if (!element) {
                    console.warn(`Element is not inside a component.`, origin);
                    return;
                }
                const identifiers = element.getAttribute(`${this.prefix}-component`).split(/\s+/).filter(s => s.length);
                if (identifiers.length > 1) {
                    console.warn(`Element requires the component name. Add the name of the component to all directives.`, origin);
                    return;
                }
                identifier = identifiers[0];
            }
            else {
                element = origin.closest(`[${this.prefix}-component~="${identifier}"]`);
                if (!element) {
                    console.warn(`Element is not inside a component named '${identifier}'.`, origin);
                    return;
                }
            }
            return {
                identifier,
                element
            };
        }
    }

    exports.Application = Application;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
