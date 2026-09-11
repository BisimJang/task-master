import React, { useState } from 'react'
import { Wallet, Copy, Check, LogOut, Zap, ShieldCheck } from 'lucide-react'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  nimiqAddress: string | null
  isInsideNimiqPay: boolean
  totalEarned: number
  onConnect: () => void
  onDisconnect: () => void
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  nimiqAddress,
  isInsideNimiqPay,
  totalEarned,
  onConnect,
  onDisconnect,
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    if (!nimiqAddress) return
    navigator.clipboard.writeText(nimiqAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white border-3 border-[#121417] rounded-3xl p-6 shadow-retro relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FBD023] border-2 border-[#121417] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#121417]" />
            </div>
            <h3 className="font-display font-black text-lg text-[#121417] tracking-tight">
              {nimiqAddress ? 'Wallet Details' : 'Connect Wallet'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#121417] font-black text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {nimiqAddress ? (
          /* CONNECTED STATE */
          <div className="mt-5 space-y-4">
            {/* Status Pill */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border-2 border-emerald-500 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  {isInsideNimiqPay ? 'Nimiq Pay Active' : 'Wallet Connected'}
                </span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            {/* Address Box */}
            <div className="bg-[#121417] p-4 rounded-2xl text-white space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Nimiq Address
              </p>
              <p className="font-mono text-xs break-all text-[#FBD023] leading-relaxed select-all">
                {nimiqAddress}
              </p>
              <button
                onClick={handleCopy}
                className="mt-2 w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Address'}</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#FBD023] border-2 border-[#121417] rounded-2xl p-3 shadow-retro-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#121417]/60">Quest Rewards</p>
                <p className="font-display font-black text-xl text-[#121417]">{totalEarned} NIM</p>
              </div>
              <div className="bg-white border-2 border-[#121417] rounded-2xl p-3 shadow-retro-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#121417]/60">Network</p>
                <p className="font-black text-xs text-[#121417] mt-1">Nimiq Mainnet</p>
              </div>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => {
                onDisconnect()
                onClose()
              }}
              className="w-full py-3 px-4 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        ) : (
          /* DISCONNECTED STATE */
          <div className="mt-5 space-y-4 text-center">
            <p className="text-sm font-bold text-[#121417]/70">
              Connect your Nimiq Pay wallet to unlock live stage tasks, claim instant rewards, and track your earnings.
            </p>

            <button
              onClick={() => {
                onConnect()
                onClose()
              }}
              className="w-full py-4 px-4 bg-[#FBD023] hover:bg-[#ebd52a] text-[#121417] border-2 border-[#121417] rounded-2xl font-black text-sm uppercase tracking-wider shadow-retro-sm hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#121417]" />
              <span>Connect Nimiq Pay</span>
            </button>

            <p className="text-[11px] font-bold text-[#121417]/40">
              Inside Nimiq Pay, this prompts your native wallet address securely.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
