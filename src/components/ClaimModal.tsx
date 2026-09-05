import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Copy, X, Sparkles, ShieldCheck, Trophy } from 'lucide-react'
import type { ClaimRecord } from '../lib/types'

interface ClaimModalProps {
  isOpen: boolean
  onClose: () => void
  record: ClaimRecord | null
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ isOpen, onClose, record }) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FBD023', '#FF532F', '#2DD4BF', '#121417']
        })
      } catch (e) {
        console.warn('Confetti error:', e)
      }
    }
  }, [isOpen])

  if (!isOpen || !record) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-3 border-[#121417] rounded-[36px] p-6 shadow-retro-lg text-[#121417]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4 text-[#121417]" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FBD023] border-2 border-[#121417] flex items-center justify-center shadow-retro-sm mb-3">
            <Trophy className="w-8 h-8 text-[#121417]" />
          </div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#FF532F] bg-orange-100 px-3 py-1 rounded-full">
            Drop Confirmed
          </span>
          <h2 className="font-display font-black text-3xl tracking-tight mt-2 text-[#121417]">
            Reward Claimed!
          </h2>
          <p className="text-xs text-[#121417]/70 font-medium mt-1">
            Your event bounty has been dispatched directly to your Nimiq Pay wallet.
          </p>
        </div>

        {/* Reward Card */}
        <div className="mt-5 p-4 bg-[#F4F4F6] border-2 border-[#121417] rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#121417]/70">Amount Received:</span>
            <span className="font-display font-black text-2xl text-[#FF532F]">
              +{record.rewardAmount} {record.rewardType}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2 text-[11px] font-medium text-[#121417]/80">
            <div className="flex items-center justify-between">
              <span>Wallet Address:</span>
              <span className="font-mono font-bold text-[10px] text-[#121417]">
                {record.walletAddress.slice(0, 8)}...{record.walletAddress.slice(-6)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Anti-Sybil Proof:
              </span>
              <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Device Attested
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Tx Hash:</span>
              <button
                onClick={() => copyToClipboard(record.txHash)}
                className="flex items-center gap-1 font-mono text-[10px] text-[#FF532F] hover:underline cursor-pointer"
                title="Copy Hash"
              >
                <span>{record.txHash.slice(0, 10)}...</span>
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              const text = `I just completed quests and claimed ${record.rewardAmount} ${record.rewardType} via @nimiq Pay! ⚡🎯`
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
            }}
            className="flex-1 py-3 px-4 rounded-full bg-[#121417] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-retro-sm active:translate-y-0.5 active:shadow-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBD023]" />
            <span>Share on X</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-full border-2 border-[#121417] bg-white hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
