import type { StageEvent, AttendeeClaimRecord } from './types'

const STORAGE_EVENTS_KEY = 'stagedrop_events_v6'
const STORAGE_CLAIMS_KEY = 'stagedrop_claims_v6'
const STORAGE_VERSION_KEY = 'stagedrop_db_version'
const CURRENT_DB_VERSION = '6'

/** One-time migration: wipe all old stagedrop_* data on version bump */
function runMigration(): void {
  if (localStorage.getItem(STORAGE_VERSION_KEY) === CURRENT_DB_VERSION) return
  const keys = Object.keys(localStorage)
  for (const k of keys) {
    if (k.startsWith('stagedrop_')) localStorage.removeItem(k)
  }
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_DB_VERSION)
}

runMigration()

export function getEvents(): StageEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse stored events:', e)
  }
  return []
}

export function saveEvent(event: StageEvent): void {
  const events = getEvents()
  const idx = events.findIndex(e => e.id === event.id)
  if (idx >= 0) {
    events[idx] = event
  } else {
    events.unshift(event)
  }
  localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events))
}

export function deleteEvent(eventId: string): void {
  const events = getEvents().filter(e => e.id !== eventId)
  localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events))
}

/** Competition: increment winnerCount on a task, returns updated event */
export function updateTaskWinnerCount(eventId: string, taskId: string): StageEvent | null {
  const events = getEvents()
  const eventIdx = events.findIndex(e => e.id === eventId)
  if (eventIdx < 0) return null
  const event = events[eventIdx]
  const taskIdx = event.tasks.findIndex(t => t.id === taskId)
  if (taskIdx < 0) return null
  event.tasks[taskIdx].winnerCount = (event.tasks[taskIdx].winnerCount || 0) + 1
  events[eventIdx] = event
  localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events))
  return event
}

export function getClaims(): AttendeeClaimRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_CLAIMS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse claims:', e)
  }
  return []
}

export function saveClaim(claim: AttendeeClaimRecord): void {
  const claims = getClaims()
  claims.push(claim)
  localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify(claims))
}

export function hasClaimedTask(eventId: string, taskId: string, wallet: string, deviceId: string): boolean {
  return getClaims().some(c =>
    c.eventId === eventId &&
    c.taskId === taskId &&
    (c.walletAddress.toLowerCase() === wallet.toLowerCase() || (deviceId && c.deviceIdentifier === deviceId))
  )
}

export function clearAllStorage(): void {
  const keys = Object.keys(localStorage)
  for (const k of keys) {
    if (k.startsWith('stagedrop_')) localStorage.removeItem(k)
  }
}