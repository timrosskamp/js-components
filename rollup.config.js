import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

export default {
    input: 'src/index.ts',
    output: [{
        file: 'dist/js-components.js',
        format: 'es'
    }, {
        file: 'dist/js-components.min.js',
        format: 'es',
        plugins: [
            terser({
                mangle: {
                    properties: true
                }
            })
        ]
    }, {
        name: 'jscomponents',
        file: 'dist/js-components.umd.js',
        format: 'umd'
    }],
    plugins: [
        nodeResolve(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        typescript()
    ]
}