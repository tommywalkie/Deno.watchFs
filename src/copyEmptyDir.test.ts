import { expect, it, join, copySync } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track newly copied empty folders', async () => {
    const events = await track((path: string) => {
        Deno.mkdirSync(join(path, 'foo'), { recursive: true })
        copySync(join(path, 'foo'), join(path, 'bar'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})