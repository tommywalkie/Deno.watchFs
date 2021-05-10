import { expect, it, join, moveSync } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track moved files', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        Deno.writeTextFileSync(join(path, 'foo', 'A.txt'), 'Hello world')
        Deno.mkdirSync(join(path, 'bar'), { recursive: true })
        moveSync(join(path, 'foo'), join(path, 'bar', 'foo'), { overwrite: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})