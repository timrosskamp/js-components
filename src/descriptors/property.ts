// capture groups:        12       2       1 3   3   4  4
const propertyPattern = /^(([^\s#]+)\s*#\s*)?(\S+)\s*(.*)$/i

export interface PropertyDescriptor {
    identifier?: string
    property: string
}

/**
 * Parser for property references
 * 
 * Scheme: "[namespace]#[object.prop] ..."
 */
export function parsePropertyDescriptor(descriptor: string): PropertyDescriptor[] {
    const descriptors: PropertyDescriptor[] = []

    while( descriptor.trim() ){
        const matches = descriptor.match(propertyPattern)

        if( !matches ){
            console.error(`Descriptor '${descriptor}' is invalid.`)
            return []
        }

        descriptors.push({
            identifier: matches[2],
            property: matches[3]
        })

        descriptor = matches[4] || ''
    }

    return descriptors
}