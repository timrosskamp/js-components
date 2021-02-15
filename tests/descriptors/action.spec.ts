import { parseActionDescriptor as parse } from '../../src/descriptors/action'

describe('Parser for action descriptors', () => {
    test('action with event name and component identifier', () => {
        expect(parse('click->mycomponent#onClick()')).toStrictEqual([{
            event: 'click',
            identifier: 'mycomponent',
            method: 'onClick',
            options: []
        }])
    })

    test('action with component identifier and without event name', () => {
        expect(parse('mycomponent#onClick()')).toStrictEqual([{
            event: undefined,
            identifier: 'mycomponent',
            method: 'onClick',
            options: []
        }])
    })

    test('action with event name and without compnent identifier', () => {
        expect(parse('click->onClick()')).toStrictEqual([{
            event: 'click',
            identifier: undefined,
            method: 'onClick',
            options: []
        }])
    })

    test('just the action', () => {
        expect(parse('onClick()')).toStrictEqual([{
            event: undefined,
            identifier: undefined,
            method: 'onClick',
            options: []
        }])
    })
})