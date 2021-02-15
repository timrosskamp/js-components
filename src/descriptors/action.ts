export class UnquotedString {
    value: string
    constructor(string: string) {
        this.value = string
    }
}

type Option = UnquotedString|String|Number|Boolean|null|undefined

function parseOptions(str: string): Option[] {
    return str.split(',').map(s => s.trim()).filter(s => s.length).map((option) => {
        if( option == 'undefined' ) return undefined
        if( option == 'null' ) return null
        if( option == 'true' )  return true
        if( option == 'false' ) return false

        if( !isNaN(parseFloat(option)) ){
            return parseFloat(option)
        }

        // If the option is quoted, remove the quotes and return as literal string
        if( (option.charAt(0) == '\'' && option.charAt(option.length) == '\'') ||
            (option.charAt(0) == '\"' && option.charAt(option.length) == '\"') ){
            return option.slice(1, option.length - 1)
        }

        // Anything else will be treated as an unquoted string
        return new UnquotedString(option)
    })
}

// capture groups:                12   2        1 34       4       3 5       5     6     6     7  7
const actionDescriptorPattern = /^((\S+)\s*->\s*)?(([^\s#]+)\s*#\s*)?([^\s(]+)\s*\(([^)]*)\)\s*(.+)?$/i

export interface ActionDesciptor {
    event?: string
    identifier?: string
    method: string
    options: Option[]
}

/**
 * Parser for action descriptors
 * 
 * Scheme: "[event]->[namespace]#[method]([option, ...options]) ..."
 */
export function parseActionDescriptor(descriptor: string): ActionDesciptor[] {
    const descriptors: ActionDesciptor[] = []

    while( descriptor.trim() ){
        const matches = descriptor.match(actionDescriptorPattern)

        if( !matches ){
            console.error(`Descriptor '${descriptor}' is invalid.`)
            return []
        }

        descriptors.push({
            event: matches[1] ? matches[1].slice(0, -2).trim() : undefined,
            identifier: matches[4],
            method: matches[5],
            options: matches[6] ? parseOptions(matches[6]) : []
        })

        descriptor = matches[7] || ''
    }

    return descriptors
}