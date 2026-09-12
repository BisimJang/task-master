import React, { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Zap,
  Mic2,
  ShieldCheck,
  Coins,
  Radio,
  Sparkles,
  Layers,
  Smartphone,
  CheckCircle2,
} from 'lucide-react'

interface HeroProps {
  // onHostClick is not needed here anymore, but keeping interface for future expansion if needed, or remove completely
}

export const CollapsiblePlatformHero: React.FC<HeroProps> = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-4">
      {isCollapsed ? (
        /* COLLAPSED STATE (Compact 1-line bar) */
        <div className="bg-white border-2 border-[#121417] rounded-2xl p-3 px-5 shadow-retro-sm flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF532F] animate-pulse" />
            <span className="font-display font-black text-xs sm:text-sm text-[#121417]">
              EVENTQUEST: Live tasks and instant rewards
            </span>
            <span className="hidden md:inline text-[11px] font-bold text-[#121417]/60">
              • Join a stage, complete a task, earn NIM
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#121417] hover:text-[#FF532F] bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span>How rewards work</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* EXPANDED STATE (Doubled length, rich layout explaining StageDrop) */
        <div className="bg-[#FBD023] border-3 border-[#121417] rounded-[32px] p-6 sm:p-8 shadow-retro relative overflow-hidden transition-all">
          {/* Subtle decorative background watermark */}
          <div className="absolute -right-8 -bottom-10 pointer-events-none opacity-5 select-none font-display font-black text-9xl tracking-tighter text-[#121417]">
            STAGE
          </div>

          {/* Top Bar inside Hero */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#121417]/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#121417] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <Mic2 className="w-3 h-3 text-[#FBD023]" />
                <span>EventQuest live stages</span>
              </span>
              <span className="text-xs font-bold text-[#121417]/80 hidden sm:inline">
                Join live tasks and claim your reward in Nimiq Pay
              </span>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1.5 text-xs font-black text-[#121417] bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#121417]/20 transition-all cursor-pointer shadow-xs"
              title="Collapse Platform Overview"
            >
              <span>Hide details</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Headline & Description */}
          <div className="pt-6 pb-6 max-w-4xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-black/10 text-[11px] font-black uppercase tracking-wider text-[#FF532F] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-Time Stage Interactivity</span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#121417] tracking-tight leading-[1.1]">
                Join the live stage and{' '}
                <span className="text-[#FF532F] underline decoration-4 decoration-[#121417]">
                  earn your reward
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#121417]/85 font-medium leading-relaxed mt-3 max-w-3xl">
                Scan the event QR code, answer the next task, and see your NIM reward immediately. No separate app download is needed.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href="#stage-portal"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#121417] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-retro hover:translate-y-[2px] hover:shadow-retro-sm transition-all"
                >
                  <Zap className="w-5 h-5" /> See my starred stages
                </a>
                <div className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 border-2 border-[#121417] rounded-2xl font-black text-sm uppercase tracking-widest shadow-retro-sm">
                  <Smartphone className="w-5 h-5" /> Open Nimiq Pay to claim
                </div>
              </div>
            </div>
          </div>

          {/* 3-Step Interactive Lifecycle Flow (Doubles the content & depth) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Step 1 */}
            <div className="bg-white border-2 border-[#121417] rounded-2xl p-4.5 shadow-retro-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FBD023] border border-[#121417] flex items-center justify-center font-black text-sm">
                    <Layers className="w-4 h-4 text-[#121417]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-100 text-[#121417] px-2 py-0.5 rounded-full">
                    Step 1
                  </span>
                </div>
                <h3 className="font-display font-black text-base text-[#121417] tracking-tight">
                  1. Join the stage
                </h3>
                <p className="text-xs text-[#121417]/75 font-medium mt-1 leading-relaxed">
                  Scan a host QR code or enter an event link to see the live tasks for this stage.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-[#FF532F]">
                <Coins className="w-3.5 h-3.5" />
                <span>Find your next task</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border-2 border-[#121417] rounded-2xl p-4.5 shadow-retro-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF532F] border border-[#121417] flex items-center justify-center font-black text-sm text-white">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FF532F] px-2 py-0.5 rounded-full">
                    Step 2
                  </span>
                </div>
                <h3 className="font-display font-black text-base text-[#121417] tracking-tight">
                  2. Complete a task
                </h3>
                <p className="text-xs text-[#121417]/75 font-medium mt-1 leading-relaxed">
                  Answer a quiz or complete the action shown on your phone while there are still spots available.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-[#121417]">
                <Zap className="w-3.5 h-3.5 text-[#FF532F]" />
                <span>Live availability</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border-2 border-[#121417] rounded-2xl p-4.5 shadow-retro-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 border border-[#121417] flex items-center justify-center font-black text-sm text-white">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Step 3
                  </span>
                </div>
                <h3 className="font-display font-black text-base text-[#121417] tracking-tight">
                  3. Claim your NIM
                </h3>
                <p className="text-xs text-[#121417]/75 font-medium mt-1 leading-relaxed">
                  Connect your Nimiq wallet when you are ready, then claim the reward earned from this stage.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clear reward status</span>
              </div>
            </div>
          </div>

          {/* Bottom Feature Badges Strip */}
          <div className="mt-5 pt-4 border-t border-[#121417]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[#121417]">
            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <Zap className="w-4 h-4 text-[#FF532F]" />
              <span>Fast confirmation</span>
            </div>

            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>One reward per device</span>
            </div>

            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <Coins className="w-4 h-4 text-[#121417]" />
              <span>Your wallet, your reward</span>
            </div>

            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <Smartphone className="w-4 h-4 text-[#FF532F]" />
              <span>Works in Nimiq Pay</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
