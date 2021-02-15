import { Application } from '../dist/js-components.js'

const app = new Application

app.define('hello', ({ ref }) => {
    function onInput(event) {
        ref('text').textContent = `Hello, ${event.target.value}!`
    }

    return {
        onInput
    }
})

app.define('collapsible', ({ ref }) => {
    function toggle() {
        ref('content').hidden = !ref('content').hidden
    }

    return {
        toggle
    }
})

app.define('tabs', ({ refs }) => {
    function selectTab(index) {
        refs('tab').forEach(tab => tab.hidden = true)
        refs('tab')[index].hidden = false
    }

    return {
        selectTab
    }
})

document.addEventListener('DOMContentLoaded', () => {
    app.run()
})
