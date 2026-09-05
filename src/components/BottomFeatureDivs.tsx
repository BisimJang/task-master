import React from 'react'
import { Zap, ShieldCheck, Coins } from 'lucide-react'

export const BottomFeatureDivs: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-[#121417]/10 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Feature 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF532F]">
            <Zap className="w-4 h-4" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#121417]/60">
              Albatross Consensus
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#121417] tracking-tight">
            1-Second Instant Settlement
          </h3>
          <p className="text-xs text-[#121417]/70 font-medium leading-relaxed">
            Feeless, sub-second block confirmations. Attendees receive rewards directly into their Nimiq Pay wallet without waiting for block miners or transaction queues.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF532F]">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#121417]/60">
              Hardware Attestation
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#121417] tracking-tight">
            Anti-Sybil Device Lock
          </h3>
          <p className="text-xs text-[#121417]/70 font-medium leading-relaxed">
            Leverages Nimiq Pay's native <code className="bg-neutral-200 px-1 py-0.5 rounded text-[10px]">requestDeviceIdentifier</code> to cryptographically guarantee exactly 1 reward claim per physical attendee device.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FF532F]">
            <Coins className="w-4 h-4" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#121417]/60">
              Dual Ecosystems
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-[#121417] tracking-tight">
            NIM & Polygon USDT Rails
          </h3>
          <p className="text-xs text-[#121417]/70 font-medium leading-relaxed">
            Seamlessly rewards attendees with native feeless NIM or dollar-pegged Polygon USDT via standard injected <code className="bg-neutral-200 px-1 py-0.5 rounded text-[10px]">window.ethereum</code> providers.
          </p>
        </div>

      </div>
    </div>
  )
}
