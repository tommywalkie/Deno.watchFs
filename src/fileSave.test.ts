import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track file saves', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), '')
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track file save inside subfolders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.writeTextFileSync(join(path, 'foo/A.txt'), 'Foo bar')
        Deno.writeTextFileSync(join(path, 'foo/A.txt'), 'Hello world')
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})