import { getOrSet } from './utils'
import { parsePropertyDescriptor } from './descriptors/property'
import { parseActionDescriptor } from './descriptors/action'
import { Component, InitializerArgs } from './Component'

const definitions: Map<string, (component: InitializerArgs) => any> = new Map

function findClosestScope(origin: Element, identifier: string|null = null, prefix: string) {
    let element

    if( !identifier ){
        element = origin.closest(`[${prefix}-component]`)

        if( !element ){
            console.warn(`Element is not inside a component.`, origin)
            return
        }

        const identifiers = (element.getAttribute(`${prefix}-component`) as string).split(/\s+/).filter(s => s.length)
        
        if( identifiers.length > 1 ){
            console.warn(`Element requires the component name. Add the name of the component to all directives.`, origin)
            return
        }

        identifier = identifiers[0]
    }else{
        element = origin.closest(`[${prefix}-component~="${identifier}"]`)

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

export function define(name: string, initializer: (component: InitializerArgs) => any){
    definitions.set(name, initializer)
}

export function run(root: Element = document.body, options: { prefix?: string } = {}){

    const prefix = options.prefix || 'x'

    const components: Component[] = []
    const repository: WeakMap<Element, Map<string, Component>> = new WeakMap

    /**
     * Get or create a Component based on the scope and identifier. If called
     * multiple times with the same arguments, it will return the same Component.
     */
    function pickComponent(scope: Element, identifier: string): Component {
        const identifiers = getOrSet(repository, scope, () => new Map<string, Component>())
        
        return getOrSet(identifiers, identifier, () => {
            const component = new Component(scope)

            components.push(component)
            
            return component
        })
    }

    root.querySelectorAll(`[${prefix}-ref]`).forEach(element => {
        const descriptors = parsePropertyDescriptor(element.getAttribute(`${prefix}-ref`) as string)

        descriptors.forEach(descriptor => {
            const scope = findClosestScope(element, descriptor.identifier, prefix)

            if( scope ){
                const component = pickComponent(scope.element, scope.identifier)

                component.addReference(element, descriptor)
            }
        })
    })

    root.querySelectorAll(`[${prefix}-component]`).forEach(scope => {
        let identifiers = (scope.getAttribute(`${prefix}-component`) as string).split(/\s+/).filter(s => s.length)

        identifiers.forEach(identifier => {
            const initialize = definitions.get(identifier)

            if( !initialize ){
                console.warn(`Definition for '${identifier}' is missing.`)
                return
            }

            const component = pickComponent(scope, identifier)

            component.setup(initialize)
        })
    })
    
    root.querySelectorAll(`[${prefix}-on]`).forEach(element => {
        const descriptors = parseActionDescriptor(element.getAttribute(`${prefix}-on`) as string)

        descriptors.forEach(descriptor => {
            const scope = findClosestScope(element, descriptor.identifier, prefix)

            if( scope ){
                const component = pickComponent(scope.element, scope.identifier)

                component.addDispatcher(element, descriptor)
            }
        })
    })

}