export function getOrSet<K, T>(map: K extends Object ? WeakMap<K, T> : Map<K, T>, key: K, create: () => T): T {
    if( map.has(key) ){
        return map.get(key) as T
    }

    const value = create()
    map.set(key, value)
    return value
}

export function getElementDefaultEvent(element: Element) {
    switch( element.tagName.toLowerCase() ){
        case 'a':
        case 'button':
            return 'click'
        case 'form':
            return 'submit'
        case 'input':
            return (element.getAttribute('type') == 'submit') ? 'click' : 'input'
        case 'select':
            return 'change'
        case 'textarea':
            return 'input'
    }
}

export function isBooleanAttribute(attribute: string) {
    // https://html.spec.whatwg.org/multipage/indices.html#attributes-3:boolean-attribute
    const booleanAttributes = [
        'disabled', 'checked', 'required', 'readonly', 'hidden', 'open', 'selected',
        'autofocus', 'itemscope', 'multiple', 'novalidate','allowfullscreen',
        'allowpaymentrequest', 'formnovalidate', 'autoplay', 'controls', 'loop',
        'muted', 'playsinline', 'default', 'ismap', 'reversed', 'async', 'defer',
        'nomodule'
    ]

    return booleanAttributes.includes(attribute)
}

/**
 * Checks if an Element is an `<input>`, `<select>` or `<textarea>`.
 */
export function isControl(element: Element): element is HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement {
    const tag = element.tagName.toLowerCase()

    return tag == 'input' || tag == 'select' || tag == 'textarea'
}

export function setAttribute(element: Element, attribute: string, value: any){
    if( value === undefined || value === null || value === false ){
        element.removeAttribute(attribute)
    }else{
        if( isBooleanAttribute(attribute) || value === true ){
            element.setAttribute(attribute, attribute)
        }else{
            element.setAttribute(attribute, value)
        }
    }
}

export function setText(element: Element, text: any){
    if( text == undefined || text == null ){
        element.textContent = ''
    }else{
        element.textContent = text.toString()
    }
}

export function setHTML(element: Element, html: any){
    if( html == undefined || html == null ){
        element.innerHTML = ''
    }else{
        element.innerHTML = html.toString()
    }
}

export function closest(element: Element, filter: (element: Element) => boolean): Element|null {
    do {
        if( filter(element) ) return element

        element = (element.parentElement || element.parentNode) as Element
    }while(element !== null && element.nodeType === 1)

    return null
}