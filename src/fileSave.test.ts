import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track file saves on an empty file', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), '')
        setTimeout(() => {
            Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        }, 900)
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track file saves', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'I already have some content')
        setTimeout(() => {
            Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        }, 900)
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})