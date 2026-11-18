import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).replace(/\r?\n$/, '')
}

process.chdir(git('rev-parse', '--show-toplevel'))

const configured = spawnSync('git', ['config', '--show-scope', '--get-all', 'core.hooksPath'], {
  encoding: 'utf8',
})
if (configured.status !== 0 && configured.status !== 1) {
  throw new Error(configured.stderr || 'Unable to inspect core.hooksPath')
}
const paths = configured.stdout.trim().split('\n').filter(Boolean)
if (paths.some((entry) => entry !== 'local\t.githooks')) {
  console.error(`Hook setup refused: existing core.hooksPath configuration:\n${configured.stdout}`)
  console.error('Integrate pnpm check into your existing pre-commit hook, or explicitly remove the conflicting configuration and retry.')
  process.exit(1)
}

const defaultHooks = join(git('rev-parse', '--git-common-dir'), 'hooks')
const customHooks = existsSync(defaultHooks)
  ? readdirSync(defaultHooks).filter((name) => !name.endsWith('.sample'))
  : []
if (paths.length === 0 && customHooks.length > 0) {
  console.error(`Hook setup refused: existing custom hooks in ${defaultHooks}: ${customHooks.join(', ')}`)
  console.error('Integrate pnpm check into your existing pre-commit hook, or explicitly relocate the custom hooks and retry.')
  process.exit(1)
}

git('config', '--local', 'core.hooksPath', '.githooks')
console.log('Installed local hooks: .githooks (pre-commit runs pnpm check).')
