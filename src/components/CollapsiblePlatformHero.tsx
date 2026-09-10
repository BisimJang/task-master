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
  onHostClick?: () => void;
}

export const CollapsiblePlatformHero: React.FC<HeroProps> = ({ onHostClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-4">
      {isCollapsed ? (
        /* COLLAPSED STATE (Compact 1-line bar) */
        <div className="bg-white border-2 border-[#121417] rounded-2xl p-3 px-5 shadow-retro-sm flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF532F] animate-pulse" />
            <span className="font-display font-black text-xs sm:text-sm text-[#121417]">
              STAGEDROP: Live Audience Engagement & Panel Rewards
            </span>
            <span className="hidden md:inline text-[11px] font-bold text-[#121417]/60">
              • Drop questions after talks & reward attendees with real NIM
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#121417] hover:text-[#FF532F] bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span>Expand Platform Overview</span>
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
                <span>Nimiq Pay Stage Platform</span>
              </span>
              <span className="text-xs font-bold text-[#121417]/80 hidden sm:inline">
                Agnostic Audience Reward & Micro-Drop Engine for Live Conferences
              </span>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1.5 text-xs font-black text-[#121417] bg-white/70 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#121417]/20 transition-all cursor-pointer shadow-xs"
              title="Collapse Platform Overview"
            >
              <span>Collapse Header</span>
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
                Turn Conference Panels into{' '}
                <span className="text-[#FF532F] underline decoration-4 decoration-[#121417]">
                  Live Reward Sessions
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#121417]/85 font-medium leading-relaxed mt-3 max-w-3xl">
                EventQuest transforms passive conference audiences into active participants. Event creators
                configure panel sessions, attach trivia questions with custom NIM bounties per question,
                and drop them live to audience phones the moment speakers wrap up. Payouts confirm
                on-chain in 1 second directly inside Nimiq Pay with zero gas fees.
              </p>
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
                  Define Panels & Bounties
                </h3>
                <p className="text-xs text-[#121417]/75 font-medium mt-1 leading-relaxed">
                  Creators use the <strong>+ Creator Hub</strong> to organize panel sessions, add questions based on the talk, and assign custom NIM rewards per question.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-[#FF532F]">
                <Coins className="w-3.5 h-3.5" />
                <span>Custom NIM Reward Per Question</span>
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
                  Trigger Live Stage Drop
                </h3>
                <p className="text-xs text-[#121417]/75 font-medium mt-1 leading-relaxed">
                  When panelists conclude their talk on stage, the host taps <strong>"Drop Questions Live ⚡"</strong>. The session questions unlock instantly on audience phones.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-[#121417]">
                <Zap className="w-3.5 h-3.5 text-[#FF532F]" />
                <span>Real-Time Stage Synchronization</span>
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
                  Feeless On-Chain Claim
                </h3>
                <p className="text-xs text-[#121417]/75 font-medium mt-1 leading-relaxed">
                  Attendees answer the questions, unlock their earnings, and claim directly to their Nimiq Pay address via non-custodial one-use gift vaults.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1-Second Confirmation (0 Gas)</span>
              </div>
            </div>
          </div>

          {/* Bottom Feature Badges Strip */}
          <div className="mt-5 pt-4 border-t border-[#121417]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-[#121417]">
            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <Zap className="w-4 h-4 text-[#FF532F]" />
              <span>1-Second Albatross Finality</span>
            </div>

            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Anti-Sybil Hardware Device Lock</span>
            </div>

            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <Coins className="w-4 h-4 text-[#121417]" />
              <span>Non-Custodial Gift Vault Architecture</span>
            </div>

            <div className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-xl">
              <Smartphone className="w-4 h-4 text-[#FF532F]" />
              <span>Native Nimiq Pay Mini App</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
