import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track file saves', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), '')
        setTimeout(() => {
            Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        }, 500)
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})