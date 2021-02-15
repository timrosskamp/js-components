import { ActionDesciptor, UnquotedString } from './descriptors/action'
import { LoopDescriptor } from './descriptors/loop'
import { PropertyDescriptor } from './descriptors/property'
import { getElementDefaultEvent } from './utils'

type ReferencesByName = {
    [name: string]: Element[]
}

export interface InitializerArgs {
    element: Element
    ref(name: string): Element|null
    refs(name: string): Element[]
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

    addLoop(element: Element, descriptor: LoopDescriptor) {
        
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
}