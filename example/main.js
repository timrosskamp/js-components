import { define, run } from '../dist/js-components.js'

define('hello', ({ ref }) => {
    function onInput(event) {
        ref('text').textContent = `Hello, ${event.target.value}!`
    }

    return {
        onInput
    }
})

define('collapsible', ({ ref }) => {
    function toggle() {
        ref('content').hidden = !ref('content').hidden
    }

    return {
        toggle
    }
})

define('tabs', ({ refs }) => {
    function selectTab(index) {
        refs('tab').forEach(tab => tab.hidden = true)
        refs('tab')[index].hidden = false
    }

    return {
        selectTab
    }
})

document.addEventListener('DOMContentLoaded', () => {
    run()
})
