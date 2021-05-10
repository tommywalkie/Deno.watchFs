import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track removed files', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        Deno.removeSync(join(path, 'A.txt'), { recursive: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track removed empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.removeSync(join(path, 'foo'), { recursive: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track removed non-empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.writeTextFileSync(join(path, 'foo/A.txt'), 'Hello world')
        Deno.removeSync(join(path, 'foo'), { recursive: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})