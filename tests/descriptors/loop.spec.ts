import { parseLoopDescriptor as parse } from '../../src/descriptors/loop'

describe('Parser for loop descriptors', () => {
    test('simple loop', () => {
        expect(parse('item in items')).toStrictEqual({
            iterator: 'item',
            key: undefined,
            identifier: undefined,
            property: 'items'
        })
    })

    test('simple loop `of`', () => {
        expect(parse('item of items')).toStrictEqual({
            iterator: 'item',
            key: undefined,
            identifier: undefined,
            property: 'items'
        })
    })

    test('iterator with key', () => {
        expect(parse('(item, key) in items')).toStrictEqual({
            iterator: 'item',
            key: 'key',
            identifier: undefined,
            property: 'items'
        })
    })

    test('with component identifier', () => {
        expect(parse('item in mycomponent#items')).toStrictEqual({
            iterator: 'item',
            key: undefined,
            identifier: 'mycomponent',
            property: 'items'
        })
    })
})