import { Component, InitializerArgs } from './Component'
import { parsePropertyDescriptor } from './descriptors/property'
import { parseAssignmentDescriptor } from './descriptors/assignment'
import { parseActionDescriptor } from './descriptors/action'
import { getOrSet } from './utils'

export class Application {

    private prefix: string
    private definitions: Map<string, (component: InitializerArgs) => any> = new Map
    private repository: WeakMap<Element, Map<string, Component>> = new WeakMap

    constructor(options: { prefix?: string } = {}) {
        this.prefix = options.prefix || 'x'
    }

    define(name: string, initializer: (component: InitializerArgs) => any) {
        this.definitions.set(name, initializer)
    }

    run(root: Element = document.body, ) {
        root.querySelectorAll(`[${this.prefix}-ref]`).forEach(element => {
            const descriptors = parsePropertyDescriptor(element.getAttribute(`${this.prefix}-ref`) as string)
    
            descriptors.forEach(descriptor => {
                const scope = this.findClosestScope(element, descriptor.identifier)
    
                if( scope ){
                    const component = this.pickComponent(scope.element, scope.identifier)
    
                    component.addReference(element, descriptor)
                }
            })
        })
    
        root.querySelectorAll(`[${this.prefix}-component]`).forEach(scope => {
            let identifiers = (scope.getAttribute(`${this.prefix}-component`) as string).split(/\s+/).filter(s => s.length)
    
            identifiers.forEach(identifier => {
                const initialize = this.definitions.get(identifier)
    
                if( !initialize ){
                    console.warn(`Definition for '${identifier}' is missing.`)
                    return
                }
    
                const component = this.pickComponent(scope, identifier)
    
                component.setup(initialize)
            })
        })

        root.querySelectorAll(`[${this.prefix}-bind]`).forEach(element => {
            const descriptors = parseAssignmentDescriptor(element.getAttribute(`${this.prefix}-bind`) as string)
    
            descriptors.forEach(descriptor => {
                const scope = this.findClosestScope(element, descriptor.identifier)
    
                if( scope ){
                    const component = this.pickComponent(scope.element, scope.identifier)
    
                    component.addBinding(element, descriptor)
                }
            })
        })
    
        root.querySelectorAll(`[${this.prefix}-model]`).forEach(element => {
            const descriptors = parsePropertyDescriptor(element.getAttribute(`${this.prefix}-model`) as string)
    
            descriptors.forEach(descriptor => {
                const scope = this.findClosestScope(element, descriptor.identifier)
    
                if( scope ){
                    const component = this.pickComponent(scope.element, scope.identifier)
    
                    component.addModel(element, descriptor)
                }
            })
        })
        
        root.querySelectorAll(`[${this.prefix}-on]`).forEach(element => {
            const descriptors = parseActionDescriptor(element.getAttribute(`${this.prefix}-on`) as string)
    
            descriptors.forEach(descriptor => {
                const scope = this.findClosestScope(element, descriptor.identifier)
    
                if( scope ){
                    const component = this.pickComponent(scope.element, scope.identifier)
    
                    component.addDispatcher(element, descriptor)
                }
            })
        })
    }

    /**
     * Get or create a Component based on the scope and identifier. If called
     * multiple times with the same arguments, it will return the same Component.
     */
    private pickComponent(scope: Element, identifier: string): Component {
        const identifiers = getOrSet(this.repository, scope, () => new Map<string, Component>())
        
        return getOrSet(identifiers, identifier, () => {
            return new Component(scope)
        })
    }

    private findClosestScope(origin: Element, identifier: string|null = null) {
        let element
    
        if( !identifier ){
            element = origin.closest(`[${this.prefix}-component]`)
    
            if( !element ){
                console.warn(`Element is not inside a component.`, origin)
                return
            }
    
            const identifiers = (element.getAttribute(`${this.prefix}-component`) as string).split(/\s+/).filter(s => s.length)
            
            if( identifiers.length > 1 ){
                console.warn(`Element requires the component name. Add the name of the component to all directives.`, origin)
                return
            }
    
            identifier = identifiers[0]
        }else{
            element = origin.closest(`[${this.prefix}-component~="${identifier}"]`)
    
            if( !element ){
                console.warn(`Element is not inside a component named '${identifier}'.`, origin)
                return
            }
        }
    
        return {
            identifier,
            element
        }
    }

}