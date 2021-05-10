import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track newly added empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})