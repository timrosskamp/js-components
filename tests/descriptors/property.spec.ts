import { parsePropertyDescriptor as parse } from '../../src/descriptors/property'

describe('Parser for property descriptors', () => {
    test('property with component identifier', () => {
        expect(parse('mycomponent#property')).toStrictEqual([{
            identifier: 'mycomponent',
            property: 'property'
        }])
    })

    test('property without component identifier', () => {
        expect(parse('property')).toStrictEqual([{
            identifier: undefined,
            property: 'property'
        }])
    })
})