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
  mode?: 'quiz' | 'giveaway'
  giveawayLimit?: number
  giveawayRewardNIM?: number
  giveawayClosed?: boolean
}

export interface GiveawayEntry {
  id: string
  eventId: string
  walletAddress: string
  deviceIdentifier: string
  joinedAt: string
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

export type PayoutStatus = 'pending' | 'submitted' | 'confirmed' | 'failed'

export interface PayoutRecord {
  id: string
  claimId: string
  eventId: string
  taskId: string
  recipientAddress: string
  amountLuna: number
  status: PayoutStatus
  txHash: string | null
  failureMessage?: string | null
  submittedAt?: string | null
  confirmedAt?: string | null
  createdAt: string
}
