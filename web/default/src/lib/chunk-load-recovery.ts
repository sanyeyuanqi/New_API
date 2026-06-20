const CHUNK_RELOAD_STORAGE_KEY = 'new-api:chunk-load-recovery-at'
const CHUNK_RELOAD_COOLDOWN_MS = 30 * 1000

function readLastReloadAt(): number {
  try {
    const raw = window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY)
    const parsed = raw ? Number(raw) : 0
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

function writeLastReloadAt(value: number) {
  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(value))
  } catch {
    /* empty */
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return `${error.name} ${error.message}`
  if (typeof error !== 'object' || error === null) return ''

  const record = error as Record<string, unknown>
  const target = record.target as Record<string, unknown> | undefined
  const parts = [
    record.name,
    record.message,
    record.reason,
    record.error,
    target?.src,
    target?.href,
  ]

  return parts
    .map((part) => {
      if (typeof part === 'string') return part
      if (part instanceof Error) return `${part.name} ${part.message}`
      return ''
    })
    .filter(Boolean)
    .join(' ')
}

function isChunkLoadError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()
  if (!message) return false

  return [
    'chunkloaderror',
    'loading chunk',
    'loading css chunk',
    'failed to fetch dynamically imported module',
    'importing a module script failed',
    'error loading dynamically imported module',
    'modulepreload',
  ].some((pattern) => message.includes(pattern))
}

function reloadOnceForFreshAssets() {
  const now = Date.now()
  const lastReloadAt = readLastReloadAt()

  if (lastReloadAt && now - lastReloadAt < CHUNK_RELOAD_COOLDOWN_MS) {
    return
  }

  writeLastReloadAt(now)
  window.location.reload()
}

export function installChunkLoadRecovery() {
  if (typeof window === 'undefined') return

  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error || event)) {
      event.preventDefault()
      reloadOnceForFreshAssets()
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      event.preventDefault()
      reloadOnceForFreshAssets()
    }
  })
}
