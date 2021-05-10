import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track newly added files', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})