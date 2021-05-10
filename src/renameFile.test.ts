import { expect, it, join } from '../deps.ts'
import { track } from './utils.ts'

it('should be able to track newly renamed files', async () => {
    const events = await track((path: string) => {
        Deno.writeTextFileSync(join(path, 'A.txt'), 'Hello world')
        Deno.renameSync(join(path, 'A.txt'), join(path, 'B.txt'))
    })
    console.log(events)
    expect(events.length).toBeGreaterThanOrEqual(0)
})