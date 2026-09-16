import type { StageEvent, AttendeeClaimRecord, PayoutRecord, PayoutStatus, GiveawayEntry } from './types'
import { supabase, isSupabaseConfigured } from './supabase'

const LOCAL_CLAIMS_KEY = 'eventquest_local_claims'
const LOCAL_PAYOUTS_KEY = 'eventquest_local_payouts'
const LOCAL_GIVEAWAY_ENTRIES_KEY = 'eventquest_local_giveaway_entries'

function readLocal<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeLocal<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function payoutSchemaError(error: { message?: string; code?: string }): Error {
  const message = error.message || 'Unknown Supabase error.'
  const missingTable = error.code === 'PGRST205' || message.includes("Could not find the table 'public.payouts'")
  return new Error(
    missingTable
      ? 'Payout ledger is not installed in Supabase. Apply supabase/migrations/20260912143000_create_payouts.sql, then reload the app.'
      : `Payout ledger unavailable: ${message}`,
  )
}

export async function getEvents(): Promise<StageEvent[]> {
  const { data, error } = await supabase.from('events').select('*').order('id', { ascending: false })
  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return (data || []) as StageEvent[]
}

export async function saveEvent(event: StageEvent): Promise<void> {
  const { error } = await supabase.from('events').upsert(event)
  if (error) console.error('Error saving event:', error)
}

export async function getClaims(): Promise<AttendeeClaimRecord[]> {
  if (!isSupabaseConfigured) return readLocal<AttendeeClaimRecord>(LOCAL_CLAIMS_KEY)
  const { data, error } = await supabase.from('claims').select('*')
  if (error) {
    console.error('Error fetching claims:', error)
    return []
  }
  return (data || []) as AttendeeClaimRecord[]
}

export async function saveClaim(claim: AttendeeClaimRecord): Promise<void> {
  if (!isSupabaseConfigured) {
    const claims = readLocal<AttendeeClaimRecord>(LOCAL_CLAIMS_KEY)
    writeLocal(LOCAL_CLAIMS_KEY, [...claims.filter(existing => existing.id !== claim.id), claim])
    return
  }
  const { error } = await supabase.from('claims').insert(claim)
  if (error) console.error('Error saving claim:', error)
}

export async function updateClaimTxHash(claimId: string, txHash: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const claims = readLocal<AttendeeClaimRecord>(LOCAL_CLAIMS_KEY).map(claim => claim.id === claimId ? { ...claim, txHash } : claim)
    writeLocal(LOCAL_CLAIMS_KEY, claims)
    return
  }
  const { error } = await supabase.from('claims').update({ txHash }).eq('id', claimId)
  if (error) console.error('Error updating claim txHash:', error)
}

export async function createPayout(payout: PayoutRecord): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const payouts = readLocal<PayoutRecord>(LOCAL_PAYOUTS_KEY)
    writeLocal(LOCAL_PAYOUTS_KEY, [...payouts.filter(existing => existing.id !== payout.id), payout])
    return true
  }
  const { error } = await supabase.from('payouts').insert(payout)
  if (error) {
    console.error('Error creating payout:', error)
    return false
  }
  return true
}

export async function getPayouts(eventId: string): Promise<PayoutRecord[]> {
  if (!isSupabaseConfigured) {
    return readLocal<PayoutRecord>(LOCAL_PAYOUTS_KEY).filter(payout => payout.eventId === eventId)
  }
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('eventId', eventId)
    .order('createdAt', { ascending: true })
  if (error) {
    console.error('Error fetching payout ledger:', error)
    throw payoutSchemaError(error)
  }
  return (data || []) as PayoutRecord[]
}

export async function getPendingPayouts(eventId: string): Promise<PayoutRecord[]> {
  if (!isSupabaseConfigured) {
    return readLocal<PayoutRecord>(LOCAL_PAYOUTS_KEY).filter(payout => payout.eventId === eventId && (payout.status === 'pending' || payout.status === 'failed'))
  }
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('eventId', eventId)
    .in('status', ['pending', 'failed'])
    .order('createdAt', { ascending: true })
  if (error) {
    console.error('Error fetching payouts:', error)
    throw payoutSchemaError(error)
  }
  return (data || []) as PayoutRecord[]
}

export async function updatePayout(
  payoutId: string,
  status: PayoutStatus,
  details: { txHash?: string; failureMessage?: string } = {},
): Promise<boolean> {
  const now = new Date().toISOString()
  if (!isSupabaseConfigured) {
    const payouts = readLocal<PayoutRecord>(LOCAL_PAYOUTS_KEY).map(payout => {
      if (payout.id !== payoutId) return payout
      return { ...payout, status, ...(status === 'submitted' ? { submittedAt: now } : {}), ...(details.txHash ? { txHash: details.txHash } : {}), ...(details.failureMessage ? { failureMessage: details.failureMessage } : {}) }
    })
    writeLocal(LOCAL_PAYOUTS_KEY, payouts)
    return true
  }
  const update: Record<string, string> = { status }
  if (status === 'submitted') update.submittedAt = now
  if (details.txHash) {
    update.txHash = details.txHash
    if (status === 'confirmed') update.confirmedAt = now
  }
  if (details.failureMessage) update.failureMessage = details.failureMessage
  const { error } = await supabase.from('payouts').update(update).eq('id', payoutId)
  if (error) {
    console.error('Error updating payout:', error)
    return false
  }
  return true
}

export async function hasClaimedTask(eventId: string, taskId: string, walletAddress: string, deviceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('claims')
    .select('id')
    .eq('eventId', eventId)
    .eq('taskId', taskId)
    .or(`walletAddress.eq.${walletAddress},deviceIdentifier.eq.${deviceId}`)
    .limit(1)
  
  if (error) {
    console.error('Error checking claim:', error)
    return false
  }
  return data && data.length > 0
}

export async function updateTaskWinnerCount(eventId: string, taskId: string): Promise<StageEvent | null> {
  // Fetch current event
  const { data: event, error: fetchErr } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (fetchErr || !event) return null

  // Modify tasks array
  const typedEvent = event as StageEvent
  let taskUpdated = false
  const newTasks = typedEvent.tasks.map(t => {
    if (t.id === taskId) {
      taskUpdated = true
      return { ...t, winnerCount: (t.winnerCount || 0) + 1 }
    }
    return t
  })

  if (!taskUpdated) return null
  typedEvent.tasks = newTasks

  // Save back to DB
  await saveEvent(typedEvent)
  return typedEvent
}

export function clearAllStorage(): void {
  console.log("Local storage fallback cleared. For DB, reset data manually via Supabase dashboard.")
  localStorage.clear()
}

export async function toggleTaskLock(eventId: string, taskId: string, isLocked: boolean): Promise<StageEvent | null> {
  const { data: event, error: fetchErr } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (fetchErr || !event) return null
  const typedEvent = event as StageEvent
  let taskUpdated = false
  const newTasks = typedEvent.tasks.map(t => {
    if (t.id === taskId) {
      taskUpdated = true
      return { ...t, isLocked }
    }
    return t
  })
  if (!taskUpdated) return null
  typedEvent.tasks = newTasks
  await saveEvent(typedEvent)
  return typedEvent
}


export async function joinGiveaway(entry: GiveawayEntry): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const entries = readLocal<GiveawayEntry>(LOCAL_GIVEAWAY_ENTRIES_KEY)
    if (entries.some(existing => existing.eventId === entry.eventId && existing.walletAddress === entry.walletAddress)) return true
    writeLocal(LOCAL_GIVEAWAY_ENTRIES_KEY, [...entries, entry])
    return true
  }
  const { error } = await supabase.from('giveaway_entries').upsert(entry, { onConflict: 'eventId,walletAddress' })
  if (error) { console.error('Error joining giveaway:', error); return false }
  return true
}

export async function getGiveawayEntries(eventId: string): Promise<GiveawayEntry[]> {
  if (!isSupabaseConfigured) return readLocal<GiveawayEntry>(LOCAL_GIVEAWAY_ENTRIES_KEY).filter(entry => entry.eventId === eventId)
  const { data, error } = await supabase.from('giveaway_entries').select('*').eq('eventId', eventId).order('joinedAt', { ascending: true })
  if (error) { console.error('Error fetching giveaway entries:', error); throw new Error(`Giveaway entries unavailable: ${error.message}`) }
  return (data || []) as GiveawayEntry[]
}

/** Create one pending payout for every eligible giveaway entry, without duplicates. */
export async function createGiveawayPayouts(
  eventId: string,
  rewardNIM: number,
  entries: GiveawayEntry[],
): Promise<number> {
  if (!Number.isFinite(rewardNIM) || rewardNIM <= 0) return 0
  const eligible = entries.filter(entry => entry.eventId === eventId && entry.walletAddress && entry.walletAddress !== 'unlinked')
  if (!isSupabaseConfigured) {
    const payouts = readLocal<PayoutRecord>(LOCAL_PAYOUTS_KEY)
    const existing = new Set(payouts.filter(payout => payout.eventId === eventId).map(payout => payout.claimId))
    const additions = eligible
      .filter(entry => !existing.has(`giveaway:${entry.id}`))
      .map(entry => ({
        id: `payout-giveaway-${entry.id}`,
        claimId: `giveaway:${entry.id}`,
        eventId,
        taskId: 'giveaway',
        recipientAddress: entry.walletAddress,
        amountLuna: Math.round(rewardNIM * 100000),
        status: 'pending' as const,
        txHash: null,
        createdAt: new Date().toISOString(),
      }))
    writeLocal(LOCAL_PAYOUTS_KEY, [...payouts, ...additions])
    return additions.length
  }
  const payouts = eligible.map(entry => ({
    id: `payout-giveaway-${entry.id}`,
    claimId: `giveaway:${entry.id}`,
    eventId,
    taskId: 'giveaway',
    recipientAddress: entry.walletAddress,
    amountLuna: Math.round(rewardNIM * 100000),
    status: 'pending' as const,
    txHash: null,
    createdAt: new Date().toISOString(),
  }))
  if (!payouts.length) return 0
  const { data, error } = await supabase.from('payouts').upsert(payouts, { onConflict: 'claimId', ignoreDuplicates: true }).select('id')
  if (error) {
    console.error('Error creating giveaway payouts:', error)
    return 0
  }
  return data?.length || 0
}
