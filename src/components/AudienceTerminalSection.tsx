import React, { useState } from 'react'
import {
  ShieldCheck,
  Wallet,
  Coins,
  Radio,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Send,
  Loader2,
  Trophy,
  Users,
  Clock,
  Zap,
} from 'lucide-react'
import type { StageEvent, AttendeeClaimRecord } from '../lib/types'
import type { NimiqProviderInstance } from '../lib/nimiq'
import { claimNimiqReward } from '../lib/nimiq'
import { updateClaimTxHash } from '../lib/db'

interface AudienceTerminalSectionProps {
  event: StageEvent | null
  isCreator: boolean
  claims: AttendeeClaimRecord[]
  totalEarnedNIM: number
  nimiqAddress: string | null
  deviceId: string | null
  isInsideNimiqPay: boolean
  nimiqProvider: NimiqProviderInstance | null
  onOpenCreatorMenu?: () => void
  onUpdateClaimTxHash?: (claimId: string, txHash: string) => void
}

export const AudienceTerminalSection: React.FC<AudienceTerminalSectionProps> = ({
  event,
  isCreator,
  claims,
  totalEarnedNIM: _totalEarnedNIM,
  nimiqAddress,
  deviceId,
  isInsideNimiqPay,
  nimiqProvider,
  onOpenCreatorMenu,
  onUpdateClaimTxHash,
}) => {
  const [isAirdropping, setIsAirdropping] = useState(false)
  const [airdropStatus, setAirdropStatus] = useState<string | null>(null)

  // Filter claims for this specific active event
  const eventClaims = event ? claims.filter(c => c.eventId === event.id) : []
  const pendingEventClaims = eventClaims.filter(
    c => c.txHash === 'pending' && c.walletAddress && c.walletAddress !== 'unlinked'
  )
  const completedEventClaims = eventClaims.filter(c => c.txHash && c.txHash !== 'pending')

  const totalPendingNIM = pendingEventClaims.reduce((sum, c) => sum + c.amountNIM, 0)
  const totalCompletedNIM = completedEventClaims.reduce((sum, c) => sum + c.amountNIM, 0)

  // Filter claims for current attendee
  const myEventClaims = event
    ? eventClaims.filter(
        c =>
          (nimiqAddress && c.walletAddress?.toLowerCase() === nimiqAddress.toLowerCase()) ||
          (deviceId && c.deviceIdentifier === deviceId)
      )
    : []
  const myPendingClaims = myEventClaims.filter(c => c.txHash === 'pending')
  const myCompletedClaims = myEventClaims.filter(c => c.txHash && c.txHash !== 'pending')
  const myPendingNIM = myPendingClaims.reduce((sum, c) => sum + c.amountNIM, 0)
  const myCompletedNIM = myCompletedClaims.reduce((sum, c) => sum + c.amountNIM, 0)

  // Host Airdrop Execution
  const handleExecuteAirdrop = async () => {
    if (!event || pendingEventClaims.length === 0 || isAirdropping) return

    setIsAirdropping(true)
    setAirdropStatus(`Connecting Nimiq wallet to airdrop to ${pendingEventClaims.length} winner(s)...`)

    try {
      let sentCount = 0
      for (let i = 0; i < pendingEventClaims.length; i++) {
        const claim = pendingEventClaims[i]
        setAirdropStatus(`Airdropping ${claim.amountNIM} NIM to ${claim.walletAddress.slice(0, 10)}... (${i + 1}/${pendingEventClaims.length})`)
        
        try {
          const tx = await claimNimiqReward(nimiqProvider, claim.walletAddress, claim.amountNIM)
          if (tx) {
            await updateClaimTxHash(claim.id, tx)
            if (onUpdateClaimTxHash) {
              onUpdateClaimTxHash(claim.id, tx)
            }
            sentCount++
          }
        } catch (err) {
          console.error('Failed to airdrop to', claim.walletAddress, err)
        }
      }

      setAirdropStatus(`Successfully airdropped to ${sentCount} winner(s)!`)
      setTimeout(() => setAirdropStatus(null), 5000)
    } catch (err) {
      console.error('Airdrop execution failed:', err)
      setAirdropStatus('Airdrop failed. Please try again.')
      setTimeout(() => setAirdropStatus(null), 5000)
    } finally {
      setIsAirdropping(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 1: HOST STAGE AIRDROP COMMAND TERMINAL (isCreator === true)
  // ─────────────────────────────────────────────────────────────
  if (isCreator) {
    return (
      <div className="bg-[#121417] border-3 border-[#121417] rounded-[32px] p-6 text-white shadow-retro flex flex-col justify-between h-full select-none min-h-[440px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBD023] animate-pulse" />
              <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#FBD023]" />
                <span>Host Airdrop Command</span>
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#FBD023] text-[#121417] px-2.5 py-1 rounded-full uppercase">
              Host Controller
            </span>
          </div>

          {/* Stage Overview Stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#FBD023] tracking-wider">
                  Total Pool
                </span>
                <Coins className="w-3.5 h-3.5 text-[#FBD023]" />
              </div>
              <p className="font-display font-black text-2xl text-white mt-1">
                {event ? event.totalPoolNIM : 0} <span className="text-xs text-[#FF532F]">NIM</span>
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">{event?.title || 'Stage'}</p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  Airdropped
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="font-display font-black text-2xl text-white mt-1">
                {totalCompletedNIM} <span className="text-xs text-emerald-400">NIM</span>
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">{completedEventClaims.length} payouts confirmed</p>
            </div>
          </div>

          {/* Pending Airdrop Distribution Card */}
          <div className="mt-4 p-5 bg-gradient-to-br from-white/10 to-white/5 border-2 border-[#FBD023]/40 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#FBD023] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Audience Winners Awaiting Airdrop</span>
              </span>
              <span className="text-xs font-mono font-black text-white bg-white/10 px-2.5 py-0.5 rounded-full">
                {pendingEventClaims.length} Pending
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display font-black text-4xl text-white tracking-tight">
                {totalPendingNIM}
              </span>
              <span className="font-display font-black text-xl text-[#FBD023]">NIM</span>
              <span className="text-xs text-white/60 font-medium">to distribute</span>
            </div>

            {airdropStatus && (
              <div className="mt-3 p-2.5 rounded-xl text-xs font-bold bg-[#FBD023]/20 border border-[#FBD023] text-[#FBD023] flex items-center gap-2 animate-in fade-in">
                {isAirdropping && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                <span>{airdropStatus}</span>
              </div>
            )}
          </div>

          {/* Live Winners Queue Ledger */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white/70">
              <span className="uppercase text-[10px] font-black tracking-widest">Live Winners Queue</span>
              <span>{eventClaims.length} recorded</span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {eventClaims.length > 0 ? (
                eventClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-2.5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-mono text-[11px] font-bold text-white/90">
                        {claim.walletAddress.slice(0, 14)}...
                      </p>
                      <p className="text-[10px] text-white/50">
                        +{claim.amountNIM} NIM • {new Date(claim.claimedAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      {claim.txHash === 'pending' ? (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Pending</span>
                        </span>
                      ) : (
                        <a
                          href={`https://nimiq.watch/#${claim.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 hover:underline"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Sent</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-white/40">
                  No audience winners yet. When attendees answer your quizzes correctly, they appear here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Airdrop Action Button */}
        <div className="space-y-3 pt-4 border-t border-white/15 mt-4">
          <button
            onClick={handleExecuteAirdrop}
            disabled={pendingEventClaims.length === 0 || isAirdropping}
            className={`w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-between shadow-retro cursor-pointer ${
              pendingEventClaims.length > 0 && !isAirdropping
                ? 'bg-[#FBD023] hover:bg-[#ffe169] text-[#121417] active:scale-95'
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {isAirdropping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {isAirdropping
                  ? 'Airdropping on Nimiq...'
                  : pendingEventClaims.length > 0
                  ? `Execute Airdrop (${totalPendingNIM} NIM to ${pendingEventClaims.length} Winners)`
                  : 'No Pending Airdrops'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#121417] text-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#FBD023]" />
            </div>
          </button>

          {onOpenCreatorMenu && (
            <div className="flex items-center justify-between text-[11px] text-white/60 pt-1">
              <span>Creator Options:</span>
              <button
                onClick={onOpenCreatorMenu}
                className="text-[#FF532F] hover:underline font-bold cursor-pointer"
              >
                Open Creator Hub (+)
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 2: AUDIENCE REWARDS TERMINAL (Attendee View)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121417] border-3 border-[#121417] rounded-[32px] p-6 text-white shadow-retro flex flex-col justify-between h-full select-none min-h-[440px]">
      <div>
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBD023] animate-pulse" />
            <h2 className="font-display font-black text-xl text-white tracking-tight">
              Audience Rewards Terminal
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#FF532F] text-white px-2.5 py-1 rounded-full uppercase">
            Host Airdrops
          </span>
        </div>

        {/* Stage Status Card */}
        <div className="mt-5 p-5 bg-white/5 border-2 border-white/15 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FBD023]">
              Your Stage Payouts:
            </span>
            <span className="text-[10px] font-mono font-bold text-white/60">
              {myPendingNIM > 0 ? 'Awaiting Host Airdrop' : myCompletedNIM > 0 ? 'Airdropped' : '0 NIM'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
              {myPendingNIM + myCompletedNIM}
            </span>
            <span className="font-display font-black text-xl text-[#FF532F]">NIM</span>
            <span className="text-xs text-white/60 font-medium">earned on this stage</span>
          </div>

          {/* Qualified status banner */}
          {myPendingNIM > 0 && (
            <div className="mt-3 p-3 bg-[#FBD023]/15 border border-[#FBD023]/40 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#FBD023] font-black uppercase tracking-wide">
                <Trophy className="w-3.5 h-3.5" />
                <span>You Won {myPendingNIM} NIM!</span>
              </div>
              <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                Your Nimiq wallet is registered in the Host Airdrop Queue. The host will dispatch your NIM directly from the stage — no gas fees or manual claiming needed!
              </p>
            </div>
          )}

          {myCompletedNIM > 0 && (
            <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-xs space-y-1 text-emerald-200">
              <div className="flex items-center gap-1.5 font-black uppercase tracking-wide text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{myCompletedNIM} NIM Airdropped!</span>
              </div>
              <p className="text-[11px] text-white/80 font-medium">
                The host has sent NIM directly to your wallet on the Nimiq blockchain.
              </p>
            </div>
          )}

          {myEventClaims.length === 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
              <span>Status:</span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Play quiz on stage to qualify</span>
              </span>
            </div>
          )}
        </div>

        {/* Identity & Wallet Verification Card */}
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/70 font-bold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#FF532F]" />
              <span>Registered Airdrop Wallet:</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {isInsideNimiqPay ? 'Nimiq Pay Active' : 'Connected'}
            </span>
          </div>

          <div className="font-mono text-[11px] font-bold text-white/90 bg-black/40 p-2 rounded-xl border border-white/5 break-all">
            {nimiqAddress || 'Connecting wallet...'}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-white/70 border-t border-white/10">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti-Sybil Device Lock:</span>
            </span>
            <span className="font-mono text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
              {deviceId ? `${deviceId.slice(0, 10)}... (1 per device)` : 'Attested'}
            </span>
          </div>
        </div>

        {/* List of completed airdrops */}
        {myCompletedClaims.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
              Confirmed Blockchain Receipts:
            </p>
            {myCompletedClaims.map(c => (
              <div
                key={c.id}
                className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs flex items-center justify-between"
              >
                <span className="font-bold text-emerald-300">+{c.amountNIM} NIM</span>
                <a
                  href={`https://nimiq.watch/#${c.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FBD023] underline flex items-center gap-1 font-mono text-[10px]"
                >
                  <span>Tx: {c.txHash.slice(0, 8)}...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Status Info (No fake claim button!) */}
      <div className="pt-6 border-t border-white/15 mt-4">
        {myPendingNIM > 0 ? (
          <div className="w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center gap-2 text-center">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{myPendingNIM} NIM Queued for Host Airdrop</span>
          </div>
        ) : myCompletedNIM > 0 ? (
          <div className="w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider bg-emerald-600 text-white flex items-center justify-center gap-2 text-center">
            <CheckCircle2 className="w-4 h-4" />
            <span>All Stage Rewards Airdropped!</span>
          </div>
        ) : (
          <div className="w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider bg-white/10 text-white/60 border border-white/10 flex items-center justify-center gap-2 text-center">
            <Sparkles className="w-4 h-4 text-[#FBD023]" />
            <span>Answer Stage Questions to Win NIM</span>
          </div>
        )}
      </div>
    </div>
  )
}
