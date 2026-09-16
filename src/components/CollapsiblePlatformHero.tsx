import React from 'react'
import { ArrowDown, ArrowRight, CheckCircle2, Coins, Gift, Gamepad2, Plus, QrCode, ShieldCheck, Sparkles, Zap } from 'lucide-react'

interface HeroProps {
  onOpenCreator: () => void
}

export const CollapsiblePlatformHero: React.FC<HeroProps> = ({ onOpenCreator }) => {
  return (
    <section className="w-full max-w-7xl mx-auto pt-2 pb-8 scroll-mt-24" aria-labelledby="landing-title">
      <div className="shape-surface-yellow grid overflow-hidden rounded-[2rem] bg-[#FBD023] shadow-retro-lg lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative p-6 sm:p-10 lg:p-14">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden text-[#121417]/[0.1]">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border-[18px]" />
            <div className="absolute right-24 top-20 h-14 w-14 rotate-12 rounded-xl border-4" />
            <div className="absolute bottom-8 right-12 h-3 w-3 rounded-full bg-[#FF532F]" />
            <div className="absolute bottom-12 left-1/2 h-12 w-12 rotate-45 border-4" />
            <Gamepad2 className="absolute -bottom-8 right-36 h-32 w-32 -rotate-12 stroke-[1.2]" />
            <div className="absolute right-10 top-44 h-8 w-8 rotate-45 border-4" />
          </div>
          <div className="relative max-w-2xl">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#121417]/70">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF532F] shadow-[0_0_0_4px_rgba(255,83,47,0.16)]" />
              Live stages on Nimiq Pay
            </div>
            <h1 id="landing-title" className="font-display text-4xl font-black leading-[0.98] tracking-[-0.045em] text-[#121417] sm:text-6xl lg:text-7xl">
              Turn any moment into a reward.
            </h1>
            <p className="mt-6 max-w-xl text-sm font-semibold leading-7 text-[#121417]/75 sm:text-base">
              Join a live quiz or submit your wallet to a giveaway event. Hosts create the event, share one link, and review every entry in Creator Hub.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#stage-portal" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#121417] px-5 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-retro transition-transform hover:translate-y-0.5 hover:shadow-retro-sm">
                Find a stage <ArrowDown className="h-4 w-4 text-[#FBD023]" />
              </a>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#121417]/25 bg-white/60 px-5 py-3.5 text-sm font-black uppercase tracking-wider text-[#121417] transition-colors hover:bg-white">
                How it works <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
              <a href="#stage-portal" className="group rounded-2xl border border-[#121417]/20 bg-white/65 p-4 transition-transform hover:-translate-y-0.5 hover:bg-white">
                <div className="flex items-center justify-between">
                  <Zap className="h-5 w-5 text-[#FF532F]" />
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-5 text-base font-black">Join a quiz</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#121417]/65">Answer live questions and compete for NIM.</p>
              </a>
              <a href="#stage-portal" className="group rounded-2xl border border-[#121417]/20 bg-white/65 p-4 transition-transform hover:-translate-y-0.5 hover:bg-white">
                <div className="flex items-center justify-between">
                  <Gift className="h-5 w-5 text-[#FF532F]" />
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-5 text-base font-black">Enter a giveaway</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#121417]/65">Submit your wallet once. No trivia required.</p>
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#121417]/70">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-700" /> Wallet-native</span>
              <span className="inline-flex items-center gap-1.5"><Coins className="h-4 w-4" /> Host-approved payouts</span>
            </div>
            <p className="mt-5 text-xs font-bold text-[#121417]/60">
              Hosting? Use <strong className="text-[#121417]">Create</strong> above, then choose Quiz or Giveaway event.
            </p>
            <button
              type="button"
              onClick={onOpenCreator}
              className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-[#121417] bg-[#FF532F] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-retro-sm transition-transform hover:-translate-y-0.5 hover:shadow-retro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#121417] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBD023]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#FF532F]">
                <Plus className="h-4 w-4 stroke-[3]" />
              </span>
              Open Creator Hub
            </button>
          </div>
        </div>

        <div id="how-it-works" className="relative flex min-h-[340px] flex-col justify-between bg-[#121417] p-6 text-white sm:p-8 lg:p-10">
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#FF532F]/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white/55">The live loop</span>
              <Sparkles className="h-5 w-5 text-[#FBD023]" />
            </div>
            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FBD023] text-sm font-black text-[#121417]">1</div>
                <div><h2 className="font-display text-lg font-black">Scan or open a stage</h2><p className="mt-1 text-xs font-medium leading-5 text-white/60">Save your favourites so they are ready on the home screen.</p></div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF532F] text-sm font-black text-white">2</div>
                <div><h2 className="font-display text-lg font-black">Play or submit</h2><p className="mt-1 text-xs font-medium leading-5 text-white/60">Join a quiz to play, or submit your wallet to a giveaway event.</p></div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-white">3</div>
                <div><h2 className="font-display text-lg font-black">Receive your NIM</h2><p className="mt-1 text-xs font-medium leading-5 text-white/60">The host approves the payout directly to your connected wallet.</p></div>
              </div>
            </div>
          </div>
          <div className="relative mt-8 flex items-center justify-between border-t border-white/10 pt-5">
            <div className="flex items-center gap-2 text-xs font-bold text-white/65"><QrCode className="h-4 w-4 text-[#FBD023]" /> One link, two event types</div>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </div>
    </section>
  )
}
