import { expect, it, join } from '../deps.ts'

try { Deno.removeSync(join(Deno.cwd(), '__TEST__'), { recursive: true }) } catch (_) {}
Deno.mkdirSync(join(Deno.cwd(), '__TEST__'), { recursive: true })

it('should be able to run and pause a watcher', async () => {
    const watcher = Deno.watchFs(join(Deno.cwd(), './'));
    setTimeout(() => (watcher as any).return(), 300);
    for await (const _ of watcher) {}
    expect(true).toBeTruthy()
})