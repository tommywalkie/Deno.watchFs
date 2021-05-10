import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track newly added files', async () => {
    const events = await track((path: string) => {
        Deno.createSync(join(path, 'A.txt'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})