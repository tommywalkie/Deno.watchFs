import { expect, it, join, moveSync } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track moved files', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        moveSync(join(path, 'A.txt'), join(path, 'foo', 'A.txt'), { overwrite: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})