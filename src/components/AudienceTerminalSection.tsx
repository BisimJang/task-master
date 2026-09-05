import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Wallet,
  Coins,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import type { StageEvent } from '../lib/types'
import {
  createRealGiftAccount,
  queryOnChainBalance,
  claimFromGiftAccount,
  type GiftAccount,
} from '../lib/nimiq-gift-vault'
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
  event,
  totalEarnedNIM,
  nimiqAddress,
  deviceId,
  isInsideNimiqPay,
  onOpenCreatorMenu,
  onClaimSuccess,
}) => {
  const [giftAccount, setGiftAccount] = useState<GiftAccount | null>(null)
  const [vaultBalanceNIM, setVaultBalanceNIM] = useState<number>(event ? event.totalPoolNIM : 0)
  const [isClaiming, setIsClaiming] = useState(false)
  const [hasClaimedCurrent, setHasClaimedCurrent] = useState(false)
  const [lastClaimTx, setLastClaimTx] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize or load real one-use gift account
  useEffect(() => {
    if (!event) {
      setGiftAccount(null)
      return
    }

    async function initVault() {
      if (!event) return
      const storageKey = `stagedrop_vault_${event.id}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setGiftAccount(parsed)
          checkBalance(parsed.address)
          return
        } catch {
          // Generate new
        }
      }

      const newAccount = await createRealGiftAccount()
      setGiftAccount(newAccount)
      localStorage.setItem(storageKey, JSON.stringify(newAccount))
      checkBalance(newAccount.address)
    }

    initVault()
  }, [event?.id])

  const checkBalance = async (addr: string) => {
    setIsRefreshing(true)
    try {
      const info = await queryOnChainBalance(addr)
      if (info.balanceNIM > 0) {
        setVaultBalanceNIM(info.balanceNIM)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClaimEarnings = async () => {
    if (!giftAccount || totalEarnedNIM <= 0 || isClaiming || hasClaimedCurrent) return

    const recipient = nimiqAddress
    if (!recipient) {
      alert('Wallet address not detected.')
      return
    }

    setIsClaiming(true)
    try {
      const result = await claimFromGiftAccount(
        giftAccount,
        recipient,
        totalEarnedNIM
      )

      if (result.success && result.txHash) {
        setLastClaimTx(result.txHash)
        setHasClaimedCurrent(true)
        onClaimSuccess(result.txHash, totalEarnedNIM)
      } else {
        alert(result.error || 'Claim transaction could not be completed.')
      }
    } catch (e: any) {
      alert(e?.message || 'Error executing claim.')
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="bg-[#121417] border-3 border-[#121417] rounded-[32px] p-6 text-white shadow-retro flex flex-col justify-between h-full select-none min-h-[420px]">
      <div>
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBD023] animate-pulse" />
            <h2 className="font-display font-black text-xl text-white tracking-tight">
              Audience Payout Terminal
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#FF532F] text-white px-2.5 py-1 rounded-full uppercase">
            Instant NIM
          </span>
        </div>

        {/* Total Earned Counter Card */}
        <div className="mt-5 p-5 bg-white/5 border-2 border-white/15 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FBD023]">
              Your Stage Earnings:
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
            <span>Payout Speed:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Second Confirmation (0 Gas)</span>
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
              <span>Anti-Sybil Device Lock:</span>
            </span>
            <span className="font-mono text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
              {deviceId ? `${deviceId.slice(0, 10)}... (1 per device)` : 'Attested'}
            </span>
          </div>
        </div>

        {/* Real Vault Info */}
        {giftAccount && (
          <div className="mt-3 px-3 py-2 bg-white/5 rounded-xl text-[11px] text-white/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Coins className="w-3.5 h-3.5 text-[#FBD023] shrink-0" />
              <span className="truncate">
                Vault: {giftAccount.address.slice(0, 14)}... ({vaultBalanceNIM} NIM)
              </span>
            </div>
            <button
              onClick={() => checkBalance(giftAccount.address)}
              className="ml-2 text-white/50 hover:text-white cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        {/* Claim Receipt */}
        {lastClaimTx && (
          <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>Tx Confirmed on Blockchain!</span>
            <a
              href={`https://nimiq.watch/#${lastClaimTx}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#FBD023] underline flex items-center gap-1"
            >
              <span>View Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Bottom Claim Action Button */}
      <div className="space-y-3 pt-6 border-t border-white/15 mt-4">
        {hasClaimedCurrent ? (
          <div className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-black text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Earnings Claimed to Wallet</span>
          </div>
        ) : (
          <button
            onClick={handleClaimEarnings}
            disabled={totalEarnedNIM <= 0 || isClaiming}
            className={`w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-between shadow-retro cursor-pointer ${
              totalEarnedNIM > 0
                ? 'bg-[#FBD023] hover:bg-[#ffe169] text-[#121417] animate-pulse active:scale-95'
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {totalEarnedNIM > 0 ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>
                {isClaiming
                  ? 'Broadcasting to Nimiq...'
                  : totalEarnedNIM > 0
                  ? `Claim ${totalEarnedNIM} NIM Now`
                  : 'Win a race to earn NIM'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#121417] text-white flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        )}

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
