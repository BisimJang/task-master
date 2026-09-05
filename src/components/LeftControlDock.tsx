import React from 'react'
import { Sparkles, CheckCircle2, Trophy } from 'lucide-react'
import type { Campaign, ThemePalette } from '../lib/types'

interface LeftControlDockProps {
  campaign: Campaign
  allCampaigns: Campaign[]
  onSelectCampaign: (c: Campaign) => void
  currentStepIndex: number
  totalSteps: number
  themePalette: ThemePalette
  onChangeTheme: (theme: ThemePalette) => void
  onStartQuest: () => void
  completedCount: number
}

export const LeftControlDock: React.FC<LeftControlDockProps> = ({
  campaign,
  allCampaigns,
  onSelectCampaign,
  currentStepIndex,
  totalSteps,
  themePalette,
  onChangeTheme,
  onStartQuest,
  completedCount
}) => {
  const stepNumber = String(currentStepIndex + 1).padStart(2, '0')
  const totalNumber = String(totalSteps).padStart(2, '0')

  return (
    <div className="flex flex-col justify-between h-full py-2">
      {/* Top Section: Vertical Color Palette + Slide Indicator */}
      <div className="space-y-6">
        {/* Color Palette Pill (recreating the left dock from reference) */}
        <div className="inline-flex flex-col items-center gap-2 p-1.5 bg-white border-2 border-[#121417] rounded-full shadow-retro-sm">
          <button
            onClick={() => onChangeTheme('canary')}
            aria-label="Canary Theme"
            className={`w-5 h-5 rounded-full bg-[#FBD023] border border-black/20 transition-transform cursor-pointer ${
              themePalette === 'canary' ? 'scale-125 ring-2 ring-[#121417]' : 'hover:scale-110'
            }`}
          />
          <button
            onClick={() => onChangeTheme('coral')}
            aria-label="Coral Theme"
            className={`w-5 h-5 rounded-full bg-[#FF532F] border border-black/20 transition-transform cursor-pointer ${
              themePalette === 'coral' ? 'scale-125 ring-2 ring-[#121417]' : 'hover:scale-110'
            }`}
          />
          <button
            onClick={() => onChangeTheme('slate')}
            aria-label="Slate Theme"
            className={`w-5 h-5 rounded-full bg-[#9AA5B1] border border-black/20 transition-transform cursor-pointer ${
              themePalette === 'slate' ? 'scale-125 ring-2 ring-[#121417]' : 'hover:scale-110'
            }`}
          />
          <button
            onClick={() => onChangeTheme('ink')}
            aria-label="Dark Ink Theme"
            className={`w-5 h-5 rounded-full bg-[#121417] border border-white/20 transition-transform cursor-pointer ${
              themePalette === 'ink' ? 'scale-125 ring-2 ring-[#FBD023]' : 'hover:scale-110'
            }`}
          />
        </div>

        {/* Step dots & fraction tracker */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#121417]/60 uppercase">
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStepIndex
                    ? 'bg-[#FF532F] scale-125'
                    : i < completedCount
                    ? 'bg-emerald-500'
                    : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-sm text-[#121417]">
            {stepNumber}/{totalNumber}
          </span>
        </div>

        {/* Main Headline */}
        <div>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#121417] tracking-tight leading-[1.05]">
            Event <br />
            Drops, <br />
            <span className="text-[#FF532F]">Today</span>
          </h1>
          <p className="mt-4 text-sm text-[#121417]/70 font-medium max-w-xs leading-relaxed">
            {campaign.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onStartQuest}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#121417] hover:bg-[#23272e] text-white font-bold text-sm tracking-wide shadow-retro transition-all active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FBD023]" />
            <span>Start Quest</span>
          </button>
          
          {/* Campaign Selector dropdown */}
          <div className="relative">
            <select
              value={campaign.id}
              onChange={(e) => {
                const found = allCampaigns.find(c => c.id === e.target.value)
                if (found) onSelectCampaign(found)
              }}
              className="appearance-none text-xs font-bold text-[#121417] bg-white/70 hover:bg-white border border-[#121417]/20 rounded-full px-4 py-3 pr-8 cursor-pointer focus:outline-none shadow-sm"
            >
              {allCampaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#121417]">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Badge */}
      <div className="mt-8 pt-4 border-t border-neutral-200 flex items-center gap-4 text-xs font-bold text-[#121417]/70">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-[#FBD023]" />
          <span>Pool: {campaign.rewardType === 'NIM' ? `${campaign.totalPool.toLocaleString()} NIM` : `$${campaign.totalPool} USDT`}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{campaign.claimedCount}/{campaign.maxClaims} Claimed</span>
        </div>
      </div>
    </div>
  )
}
