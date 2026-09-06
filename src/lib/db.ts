import type { StageEvent, AttendeeClaimRecord } from './types'
import { supabase } from './supabase'

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
  const { data, error } = await supabase.from('claims').select('*')
  if (error) {
    console.error('Error fetching claims:', error)
    return []
  }
  return (data || []) as AttendeeClaimRecord[]
}

export async function saveClaim(claim: AttendeeClaimRecord): Promise<void> {
  const { error } = await supabase.from('claims').insert(claim)
  if (error) console.error('Error saving claim:', error)
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
