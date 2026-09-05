import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Gift,
  ArrowRight,
  Copy,
  ExternalLink,
  Coins,
  RefreshCw,
  Wallet,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react'
import type { Campaign } from '../lib/types'
import {
  createRealGiftAccount,
  queryOnChainBalance,
  claimFromGiftAccount,
  GiftAccount,
} from '../lib/nimiq-gift-vault'
import type { NimiqProviderInstance } from '../lib/nimiq'

interface RealVaultTerminalProps {
  campaign: Campaign
  allQuestsCompleted: boolean
  nimiqAddress: string | null
  deviceId: string | null
  isInsideNimiqPay: boolean
  nimiqProvider: NimiqProviderInstance | null
  hasClaimed: boolean
  onClaimSuccess: (txHash: string) => void
}

export const RealVaultTerminal: React.FC<RealVaultTerminalProps> = ({
  campaign,
  allQuestsCompleted,
  nimiqAddress,
  deviceId,
  isInsideNimiqPay,
  nimiqProvider,
  hasClaimed,
  onClaimSuccess,
}) => {
  const [giftAccount, setGiftAccount] = useState<GiftAccount | null>(null)
  const [vaultBalanceNIM, setVaultBalanceNIM] = useState<number>(campaign.rewardAmount)
  const [isQueryingBalance, setIsQueryingBalance] = useState(false)
  const [isFunding, setIsFunding] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [copiedAddr, setCopiedAddr] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [fundingTxHash, setFundingTxHash] = useState<string | null>(null)

  // Initialize or load one-use gift account for this campaign
  useEffect(() => {
    async function initVault() {
      const storageKey = `hopdrop_gift_vault_${campaign.id}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setGiftAccount(parsed)
          checkBalance(parsed.address)
          return
        } catch {
          // Continue to generate
        }
      }

      // Generate a REAL one-use Nimiq gift account
      const newGift = await createRealGiftAccount()
      setGiftAccount(newGift)
      localStorage.setItem(storageKey, JSON.stringify(newGift))
      checkBalance(newGift.address)
    }

    initVault()
  }, [campaign.id])

  // Query live balance from Nimiq blockchain RPC
  const checkBalance = async (address: string) => {
    setIsQueryingBalance(true)
    try {
      const info = await queryOnChainBalance(address)
      if (info.balanceNIM > 0) {
        setVaultBalanceNIM(info.balanceNIM)
      }
    } catch (e) {
      console.warn('Balance query error:', e)
    } finally {
      setIsQueryingBalance(false)
    }
  }

  // Real Funding in Nimiq Pay (Organizer Action)
  const handleFundVault = async () => {
    if (!giftAccount || !nimiqProvider) {
      alert('Please open inside Nimiq Pay on mobile to fund via your real wallet.')
      return
    }

    setIsFunding(true)
    try {
      const amountLuna = Math.round(campaign.rewardAmount * 100000)
      const txHash = await nimiqProvider.sendBasicTransactionWithData({
        recipient: giftAccount.address,
        value: amountLuna,
        data: `EventQuest Drop: ${campaign.title}`,
      })

      if (typeof txHash === 'string') {
        setFundingTxHash(txHash)
        setVaultBalanceNIM(campaign.rewardAmount)
        alert(`Vault funded successfully on-chain! Tx: ${txHash}`)
      }
    } catch (err: any) {
      console.warn('Funding cancelled or failed:', err)
      alert(err?.message || 'Funding transaction cancelled.')
    } finally {
      setIsFunding(false)
    }
  }

  // Real Claim from Gift Account to Attendee Address
  const handleClaim = async () => {
    if (!giftAccount || !allQuestsCompleted || hasClaimed || isClaiming) return

    const recipient = nimiqAddress
    if (!recipient) {
      setClaimError('No recipient Nimiq address detected.')
      return
    }

    setIsClaiming(true)
    setClaimError(null)

    try {
      const res = await claimFromGiftAccount(
        giftAccount,
        recipient,
        campaign.rewardAmount
      )

      if (res.success && res.txHash) {
        onClaimSuccess(res.txHash)
      } else {
        setClaimError(res.error || 'Claim transaction could not be broadcast.')
      }
    } catch (err: any) {
      setClaimError(err?.message || 'Failed to claim reward.')
    } finally {
      setIsClaiming(false)
    }
  }

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopiedAddr(true)
    setTimeout(() => setCopiedAddr(false), 2000)
  }

  return (
    <div className="bg-[#121417] border-3 border-[#121417] rounded-[32px] p-6 text-white shadow-retro flex flex-col justify-between h-full select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBD023] animate-pulse" />
            <h2 className="font-display font-black text-xl text-white tracking-tight">
              One-Use Reward Vault
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#FF532F] text-white px-2.5 py-1 rounded-full uppercase">
            Real On-Chain NIM
          </span>
        </div>

        {/* Real Vault Account Card */}
        <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#FBD023] uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              <span>One-Use Gift Account Address:</span>
            </span>
            <button
              onClick={() => giftAccount && checkBalance(giftAccount.address)}
              className="text-white/60 hover:text-white cursor-pointer transition-colors"
              title="Refresh On-Chain Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isQueryingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10">
            <span className="font-mono text-xs text-white/90 break-all select-all font-bold">
              {giftAccount?.address || 'Generating real Nimiq keypair...'}
            </span>
            <button
              onClick={() => giftAccount && copyAddress(giftAccount.address)}
              className="ml-2 p-1 text-white/60 hover:text-[#FBD023] cursor-pointer"
              title="Copy Gift Address"
            >
              {copiedAddr ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="font-bold text-white/70">Vault Balance:</span>
            <span className="font-display font-black text-base text-[#FBD023]">
              {vaultBalanceNIM} NIM{' '}
              <span className="text-[10px] text-white/60 font-normal">
                ({(vaultBalanceNIM * 100000).toLocaleString()} Luna)
              </span>
            </span>
          </div>
        </div>

        {/* Attendee Identity & Destination Card */}
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/70 font-bold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#FF532F]" />
              <span>Your Destination Wallet:</span>
            </span>
            <span className="font-bold text-[10px] text-emerald-400">
              {isInsideNimiqPay ? 'Nimiq Pay Active' : 'Connected'}
            </span>
          </div>

          <div className="font-mono text-[11px] font-bold text-white/90 bg-black/30 p-2 rounded-xl border border-white/5 break-all">
            {nimiqAddress || 'Open in Nimiq Pay to detect wallet address'}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-white/70 border-t border-white/10">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti-Sybil Device Lock:</span>
            </span>
            <span className="font-mono text-[10px] text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
              {deviceId ? `${deviceId.slice(0, 10)}... (1 per phone)` : 'Attested'}
            </span>
          </div>
        </div>

        {/* Claim Error Notice */}
        {claimError && (
          <div className="mt-3 p-3 bg-red-900/60 border border-red-500 text-red-200 rounded-xl text-xs font-bold">
            {claimError}
          </div>
        )}

        {/* Funding confirmation badge */}
        {fundingTxHash && (
          <div className="mt-3 p-2.5 bg-emerald-900/60 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>Funded on-chain!</span>
            <a
              href={`https://nimiq.watch/#${fundingTxHash}`}
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

      {/* Action Buttons: Organizer Funding & Attendee Claim */}
      <div className="space-y-3 pt-6 border-t border-white/15">
        {/* Claim Button */}
        {hasClaimed ? (
          <div className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-black text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Reward Claimed to Wallet</span>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={!allQuestsCompleted || isClaiming}
            className={`w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center justify-between shadow-retro cursor-pointer ${
              allQuestsCompleted
                ? 'bg-[#FBD023] hover:bg-[#ffe169] text-[#121417] animate-pulse active:scale-95'
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {allQuestsCompleted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>
                {isClaiming
                  ? 'Broadcasting On-Chain...'
                  : allQuestsCompleted
                  ? `Claim ${campaign.rewardAmount} NIM Now`
                  : 'Complete All Quests to Unlock'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#121417] text-white flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Organizer Funding Trigger */}
        <div className="flex items-center justify-between text-[11px] text-white/60 pt-1">
          <span>Are you the event organizer?</span>
          <button
            onClick={handleFundVault}
            disabled={isFunding}
            className="text-[#FF532F] hover:underline font-bold cursor-pointer"
          >
            {isFunding ? 'Confirming in Nimiq Pay...' : 'Fund this Vault in Nimiq Pay'}
          </button>
        </div>
      </div>
    </div>
  )
}
