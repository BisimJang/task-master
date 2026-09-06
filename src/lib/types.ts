export type TaskType = 'quiz'

export interface SessionTask {
  id: string
  type: TaskType
  title: string
  description: string
  rewardNIM: number     // FINAL — locked on publish
  maxWinners: number    // 1 = first wins, N = first N win
  winnerCount: number   // tracks claims on this device
  isLocked?: boolean
  // Quiz
  options?: string[]
  correctIndex?: number
  // Link-based tasks
  actionUrl?: string
  actionLabel?: string
  platform?: string
}

export interface StageEvent {
  id: string
  slug: string
  title: string
  description: string
  organizer: string
  totalPoolNIM: number  // LOCKED after publish
  published: boolean    // true = locked, links generated
  tasks: SessionTask[]  // flat — no session layer
  creatorAddress?: string
}

export interface AttendeeClaimRecord {
  id: string
  eventId: string
  taskId: string
  walletAddress: string
  deviceIdentifier: string
  amountNIM: number
  txHash: string
  claimedAt: string
}

