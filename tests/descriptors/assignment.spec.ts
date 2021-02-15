import { parseAssignmentDescriptor as parse } from '../../src/descriptors/assignment'

describe('Parser for assignment descriptors', () => {
    test('assignment with component identifier', () => {
        expect(parse('html-attribute:mycomponent#property')).toStrictEqual([{
            attribute: 'html-attribute',
            identifier: 'mycomponent',
            property: 'property',
            expression: undefined
        }])
    })

    test('assignment without component identifier', () => {
        expect(parse('html-attribute:property')).toStrictEqual([{
            attribute: 'html-attribute',
            identifier: undefined,
            property: 'property',
            expression: undefined
        }])
    })
})