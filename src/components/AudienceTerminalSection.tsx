import React from 'react'
import {
  ShieldCheck,
  Wallet,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react'
import type { StageEvent } from '../lib/types'
import type { NimiqProviderInstance } from '../lib/nimiq'

interface AudienceTerminalSectionProps {
  event: StageEvent | null
  totalEarnedNIM: number
  nimiqAddress: string | null
  deviceId: string | null
  isInsideNimiqPay: boolean
  nimiqProvider: NimiqProviderInstance | null
  onOpenCreatorMenu?: () => void
  onClaimSuccess: (txHash: string, amount: number) => void
}

export const AudienceTerminalSection: React.FC<AudienceTerminalSectionProps> = ({
  totalEarnedNIM,
  nimiqAddress,
  deviceId,
  isInsideNimiqPay,
  onOpenCreatorMenu,
}) => {
  return (
    <div className="bg-[#121417] border-3 border-[#121417] rounded-[32px] p-6 text-white shadow-retro flex flex-col justify-between h-full select-none min-h-[420px]">
      <div>
        <details open className="group">
          <summary className="list-none cursor-pointer">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#FBD023] animate-pulse" /><h2 className="font-display font-black text-xl text-white tracking-tight">Your rewards</h2></div>
              <span className="text-[10px] font-mono font-bold bg-[#FF532F] text-white px-2.5 py-1 rounded-full uppercase">{totalEarnedNIM} NIM</span>
            </div>
          </summary>
          {/* Total Earned Counter Card */}
        <div className="mt-5 p-5 bg-white/5 border-2 border-white/15 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FBD023]">
              Available to claim:
            </span>
            <span className="text-[10px] font-mono font-bold text-white/60">
              {totalEarnedNIM > 0 ? 'Ready to Claim' : '0 NIM'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
              {totalEarnedNIM}
            </span>
            <span className="font-display font-black text-xl text-[#FF532F]">NIM</span>
            <span className="text-xs text-white/60 font-medium">
              ({(totalEarnedNIM * 100000).toLocaleString()} Luna)
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
            <span>Network:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fast confirmation</span>
            </span>
          </div>
        </div>

        {/* Identity & Wallet Verification Card */}
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/70 font-bold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#FF532F]" />
              <span>Attendee Wallet:</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {isInsideNimiqPay ? 'Nimiq Pay Active' : 'Connected'}
            </span>
          </div>

          <div className="font-mono text-[11px] font-bold text-white/90 bg-black/40 p-2 rounded-xl border border-white/5 break-all">
            {nimiqAddress || 'Connecting...'}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-white/70 border-t border-white/10">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Device eligibility:</span>
            </span>
            <span className="font-mono text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
              {deviceId ? `${deviceId.slice(0, 10)}... (1 per device)` : 'Attested'}
            </span>
          </div>
        </div>
        </details>

        <details className="group mt-4 border-t border-white/15 pt-4">
          <summary className="cursor-pointer list-none text-xs font-black uppercase tracking-wider text-white/70">What happens next <span className="float-right text-[#FBD023] group-open:rotate-180 transition-transform">?</span></summary>
          <p className="text-xs text-white/60 leading-relaxed mt-2">Your wallet is recorded as a winner. The host reviews the winner list and approves the NIM transfer from their creator wallet. You do not need to sign a payment.</p>
        </details>
      </div>

      {/* Bottom Claim Action Button */}
      <div className="space-y-3 pt-6 border-t border-white/15 mt-4">
        <div className={`w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 ${
          totalEarnedNIM > 0 ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/40 border border-white/10'
        }`}>
          {totalEarnedNIM > 0 ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{totalEarnedNIM > 0 ? 'Reward pending host payout' : 'Win a task to earn NIM'}</span>
        </div>

        {onOpenCreatorMenu && (
          <div className="flex items-center justify-between text-[11px] text-white/60 pt-1">
            <span>Host Controls:</span>
            <button
              onClick={onOpenCreatorMenu}
              className="text-[#FF532F] hover:underline font-bold cursor-pointer"
            >
              Creator Hub (+)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
