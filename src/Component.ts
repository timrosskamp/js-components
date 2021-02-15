import { effect, Ref, toRef } from '@vue/reactivity'
import { ActionDesciptor, UnquotedString } from './descriptors/action'
import { PropertyDescriptor } from './descriptors/property'
import { AssignmentDescriptor } from './descriptors/assignment'
import { getElementDefaultEvent, isControl, setAttribute, setHTML, setText } from './utils'

type ReferencesByName = {
    [name: string]: Element[]
}

export interface InitializerArgs {
    element: Element
    ref(name: string): Element|null
    refs(name: string): Element[]
}

function resolveRef(target: any, path: string): Ref|null {
    if( path.indexOf('.') > -1 ){
        const keys = path.split('.')

        while( keys.length > 1 ){
            const key = keys.shift() as string

            if( !(key in target) ) return null

            target = target[key]
        }

        path = keys[0]
    }

    if( path in target ){
        return toRef(target, path)
    }

    return null
}

export class Component {
    private element: Element
    private _data: any
    private references: ReferencesByName = {}

    get data() {
        if( !this._data ){
            throw new Error(`Can't access data before component has been set up.`)
        }

        return this._data
    }

    constructor(element: Element) {
        this.element = element
    }

    setup(initializer: (component: InitializerArgs) => any) {
        this._data = initializer({
            element: this.element,
            ref: (name: string): Element|null => {
                return this.references[name]?.[0] || null
            },
            refs: (name: string): Element[] => {
                return this.references[name] || []
            }
        })
    }

    addReference(element: Element, descriptor: PropertyDescriptor) {
        if( this.references[descriptor.property] ){
            this.references[descriptor.property].push(element)
        }else{
            this.references[descriptor.property] = [element]
        }
    }

    addDispatcher(element: Element, descriptor: ActionDesciptor) {
        if( !(descriptor.method in this.data) ){
            console.warn(`Function '${descriptor.method}' does not exist in Component.`, element)
            return
        }

        const method = this.data[descriptor.method]

        if( typeof method !== 'function' ){
            console.warn(`'${descriptor.method}' is not a function.`, element)
            return
        }

        let event = descriptor.event

        if( !event ){
            event = getElementDefaultEvent(element)

            if( !event ) {
                console.warn(`No default event type found for element. Add an event type to the on directive.`, element)
                return
            }
        }

        element.addEventListener(event, function listener(event){
            // copy options and replace magic argument '$event' with Event object
            const options = descriptor.options.map(option => {
                if( option instanceof UnquotedString ){
                    if( option.value == '$event' ){
                        return event
                    }
                    return option.value
                }
                
                return option
            })

            method(...options)
        })
    }

    addBinding(element: Element, descriptor: AssignmentDescriptor) {
        if( descriptor.property ){
            const property = resolveRef(this.data, descriptor.property)

            if( !property ){
                console.warn(`Property '${descriptor.property}' does not exist in Component.`, element)
                return
            }

            effect(() => {
                let value = property.value
    
                if( descriptor.attribute == 'text' ){
                    setText(element, value)
                }else if( descriptor.attribute == 'html' ){
                    setHTML(element, value)
                }else{
                    setAttribute(element, descriptor.attribute, value)
                }
            })
        }else if( descriptor.expression ){
            // Todo: Handle expression
            console.log(descriptor.expression)
        }
    }

    addModel(element: Element, descriptor: PropertyDescriptor) {
        const property = resolveRef(this.data, descriptor.property)

        if( !property ){
            console.warn(`'${descriptor.property}' not found in component.`, element)
            return
        }

        if( !isControl(element) ){
            console.warn(`model directive can only be used on <input>, <select> or <textarea> elements.`, element)
            return
        }

        const event = (element.tagName.toLowerCase() == 'select')
            || element.type == 'checkbox'
            || element.type == 'radio' ? 'change' : 'input'

        effect(() => {
            const newValue = property.value == null ? '' : property.value

            if( element.value !== newValue ){
                element.value = newValue as string
            }
        })

        element.addEventListener(event, function listener(){
            property.value = element.value
        })
    }
}