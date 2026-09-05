import React from 'react'
import { Wallet, Plus, Zap } from 'lucide-react'

interface HeaderNavProps {
  nimiqAddress: string | null
  isInsideNimiqPay: boolean
  onOpenCreatorMenu: () => void
  onConnectWallet: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  nimiqAddress,
  isInsideNimiqPay,
  onOpenCreatorMenu,
  onConnectWallet,
}) => {
  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Connect Wallet'
    const clean = addr.replace(/\s+/g, '')
    return clean.slice(0, 4) + '...' + clean.slice(-4)
  }

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FBD023] border-2 border-[#121417] flex items-center justify-center font-black text-xl shadow-retro-sm">
          <Zap className="w-5 h-5 text-[#121417]" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-black text-2xl tracking-tighter text-[#121417]">
            STAGEDROP<span className="text-[#FF532F]">.</span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-[#121417]/60 -mt-1 uppercase">
            Live Panel Session Drops
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* The PLUS (+) Button for Creator Utility Menu */}
        <button
          onClick={onOpenCreatorMenu}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FF532F] hover:bg-[#e64522] text-white font-black text-xs tracking-wider uppercase transition-all shadow-retro-sm active:translate-y-0.5 active:shadow-none cursor-pointer"
          title="Creator Utility Menu (Add Sessions, Drop Questions)"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Creator Hub</span>
        </button>

        {/* Wallet Pill Button */}
        <button
          onClick={onConnectWallet}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121417] hover:bg-[#23272e] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-retro-sm active:translate-y-0.5 active:shadow-none cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 text-[#FBD023]" />
          <span>{formatAddress(nimiqAddress)}</span>
          {isInsideNimiqPay && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Nimiq Pay Active" />
          )}
        </button>
      </div>
    </header>
  )
}
