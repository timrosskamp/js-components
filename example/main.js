import { Application, ref, computed } from '../dist/js-components.js'

const app = new Application

app.define('hello', () => {
    const name = ref('')
    const greeting = computed(() => `Hello, ${name.value}!`)

    return {
        name,
        greeting
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
