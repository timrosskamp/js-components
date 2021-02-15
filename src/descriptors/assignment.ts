// capture groups:          1           1   2           2   3   3
const expressionPattern = /^([^\s\!=<>]+)\s*([!=<>]{1,2})\s*(\S+)$/i

interface Expression {
    leftHand: string
    operator: string
    rightHand: string
}

function parseExpression(expression: string): Expression|undefined {
    const matches = expression.match(expressionPattern)

    if( !matches ){
        console.error(`Expression '${expression}' is invalid.`)
        return
    }

    return {
        leftHand: matches[1],
        operator: matches[2],
        rightHand: matches[3]
    }
}

// capture groups:                    1       1       23       3       2 4 5     5  6   64   7  7
const assignmentDescriptorPattern = /^([^\s:]+)\s*:\s*(([^\s#]+)\s*#\s*)?({([^}]+)}|(\S+))\s*(.*)$/i

export interface AssignmentDescriptor {
    attribute: string
    identifier?: string
    property?: string
    expression?: Expression
}

/**
 * Parser for property assignments
 * 
 * Schemes:
 * - "[html-attribute]:[namespace]#[object.prop] ..."
 * - "[html-attribute]:[namespace]#{[Expression]}"
 */
export function parseAssignmentDescriptor(descriptor: string): AssignmentDescriptor[] {
    const descriptors: AssignmentDescriptor[] = []

    while( descriptor.trim() ){
        const matches = descriptor.match(assignmentDescriptorPattern)

        if( !matches ){
            console.error(`Descriptor '${descriptor}' is invalid.`)
            return []
        }

        descriptors.push({
            attribute: matches[1],
            identifier: matches[3],
            property: matches[6],
            expression: matches[5] ? parseExpression(matches[5]) : undefined
        })

        descriptor = matches[7] || ''
    }

    return descriptors
}