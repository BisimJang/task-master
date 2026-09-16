import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Trophy, Users, ShieldCheck, Zap } from 'lucide-react'
import type { Campaign } from '../lib/types'

interface CollapsibleHeroProps {
  campaign: Campaign
  allCampaigns: Campaign[]
  onSelectCampaign: (camp: Campaign) => void
}

export const CollapsibleHero: React.FC<CollapsibleHeroProps> = ({
  campaign,
  allCampaigns,
  onSelectCampaign,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-4">
      {/* COLLAPSED STATE */}
      {isCollapsed ? (
        <div className="bg-white border-2 border-[#121417] rounded-2xl p-3 px-4 shadow-retro-sm flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBD023]" />
            <span className="font-display font-black text-sm text-[#121417] tracking-tight">
              {campaign.title}
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#FF532F] text-white px-2 py-0.5 rounded-full">
              +{campaign.rewardAmount} {campaign.rewardType}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#121417]/60 hidden sm:inline">
              {campaign.claimedCount}/{campaign.maxClaims} Claimed
            </span>
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-1 text-xs font-bold text-[#121417] hover:text-[#FF532F] bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <span>Show Details</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* EXPANDED STATE */
        <div className="bg-white border-3 border-[#121417] rounded-[32px] p-6 shadow-retro relative overflow-hidden transition-all">
          {/* Top Row: Tag, Select Dropdown, and Collapse Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF532F] bg-orange-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#FF532F]" />
                <span>Active Event Drop</span>
              </span>
              <span className="text-xs font-bold text-[#121417]/60">
                Hosted by <strong className="text-[#121417]">{campaign.organizerName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Event Switcher Dropdown */}
              <div className="relative">
                <select
                  value={campaign.id}
                  onChange={(e) => {
                    const found = allCampaigns.find((c) => c.id === e.target.value)
                    if (found) onSelectCampaign(found)
                  }}
                  className="appearance-none text-xs font-bold text-[#121417] bg-[#F4F4F6] hover:bg-neutral-200 border border-[#121417]/30 rounded-full px-3.5 py-1.5 pr-7 cursor-pointer focus:outline-none"
                >
                  {allCampaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#121417]">
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Collapse Trigger Button */}
              <button
                onClick={() => setIsCollapsed(true)}
                className="flex items-center gap-1 text-xs font-bold text-[#121417]/70 hover:text-[#121417] bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                title="Collapse Header"
              >
                <span>Collapse</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 items-center">
            {/* Title & Description (Col 1-7) */}
            <div className="md:col-span-7 space-y-2">
              <h1 className="font-display font-black text-3xl sm:text-4xl text-[#121417] tracking-tight leading-tight">
                {campaign.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#121417]/80 font-medium max-w-xl leading-relaxed">
                {campaign.description}
              </p>

              {/* Sponsor Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#121417]/50">
                  Participating Booths:
                </span>
                {campaign.sponsors.map((sp) => (
                  <div
                    key={sp.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F4F6] border border-[#121417]/10 text-xs font-bold text-[#121417]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF532F]" />
                    <span>{sp.name}</span>
                    <span className="text-[10px] font-normal text-[#121417]/60">({sp.booth})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bounty Pool Card (Col 8-12) */}
            <div className="md:col-span-5 bg-[#FBD023] border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#121417]">
                  Verified Drop Per Attendee
                </span>
                <span className="text-[10px] font-bold bg-white/80 border border-black/10 px-2 py-0.5 rounded-full text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>1-Use Gift Account</span>
                </span>
              </div>

              <div className="my-2">
                <div className="font-display font-black text-4xl text-[#121417] tracking-tight">
                  {campaign.rewardAmount}{' '}
                  <span className="text-lg uppercase text-[#FF532F]">{campaign.rewardType}</span>
                </div>
                <div className="text-[11px] font-bold text-[#121417]/80">
                  Creator-approved payout requests through Nimiq Pay
                </div>
              </div>

              <div className="pt-2 border-t border-[#121417]/15 flex items-center justify-between text-xs font-bold text-[#121417]">
                <div className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-[#121417]" />
                  <span>Pool: {campaign.totalPool.toLocaleString()} {campaign.rewardType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#121417]" />
                  <span>{campaign.claimedCount}/{campaign.maxClaims} Claimed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
