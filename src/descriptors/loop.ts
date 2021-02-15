// capture groups:              12     3       3       4       4     2 5   51   6     6   78   8       7 9   9
const loopDescriptorPattern = /^((\(\s*([^\s,]+)\s*,\s*([^\s)]+)\s*\))|(\S+))\s+(in|of)\s+((\S+)\s*#\s*)?(\S+)$/i

export interface LoopDescriptor {
    iterator: string
    key?: string,
    identifier?: string
    property: string
}

/**
 * Parser for property loops
 * 
 * Schemes:
 * - `([iterator], [key]) in [namespace]#[object.prop]`
 * - `[iterator] in [namespace]#[object.prop]`
 */
export function parseLoopDescriptor(descriptor: string): LoopDescriptor|undefined {
    const matches = descriptor.trim().match(loopDescriptorPattern)

    if( !matches ){
        console.error(`Descriptor '${descriptor}' is invalid.`)
        return
    }

    return {
        iterator: matches[5] ? matches[5] : matches[3],
        key: matches[4],
        identifier: matches[8],
        property: matches[9]
    }
}