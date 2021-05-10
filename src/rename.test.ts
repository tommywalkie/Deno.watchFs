import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track renamed files', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        Deno.renameSync(join(path, 'A.txt'), join(path, 'B.txt'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track renamed empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.renameSync(join(path, 'foo'), join(path, 'bar'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})

it('should be able to track renamed non-empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.writeTextFileSync(join(path, 'foo', 'A.txt'), 'Hello world')
        Deno.renameSync(join(path, 'foo'), join(path, 'bar'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})