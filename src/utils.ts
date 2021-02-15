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