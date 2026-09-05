import React from 'react'
import { Check, Search } from 'lucide-react'
import type { Campaign } from '../lib/types'

interface CenterQuestSectionProps {
  campaign: Campaign
  activeTaskIndex: number
  onSelectTask: (index: number) => void
  completedCount: number
  totalCount: number
}

export const CenterQuestSection: React.FC<CenterQuestSectionProps> = ({
  campaign,
  activeTaskIndex,
  onSelectTask,
}) => {
  return (
    <div className="relative w-full h-[540px] sm:h-[580px] bg-[#FBD023] border-3 border-[#121417] rounded-[36px] p-6 shadow-retro flex flex-col justify-between overflow-hidden select-none">
      
      {/* 1. TOP BAR: Sponsor Avatars & Search Strip (Top-left space left empty) */}
      <div className="relative z-20 flex items-center justify-end">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-2 border-[#121417] p-1.5 rounded-full shadow-retro-sm">
          <div className="w-8 h-8 rounded-full bg-[#FF532F] flex items-center justify-center text-white cursor-pointer hover:opacity-90">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center -space-x-1.5 px-1">
            {campaign.sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                title={`${sponsor.name} (${sponsor.booth})`}
                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-neutral-100 shadow-sm relative group cursor-pointer hover:scale-110 transition-transform"
              >
                <img
                  src={sponsor.avatar}
                  alt={sponsor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      sponsor.name
                    )}&background=121417&color=fff`
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CENTER AREA: Completely Empty as requested */}
      <div className="flex-1" />

      {/* 3. BOTTOM: Task Pills Capsule */}
      <div className="relative z-20 flex justify-center">
        <div className="bg-[#FF532F] border-2 border-[#121417] px-4 py-2 rounded-full shadow-retro-sm flex items-center gap-2">
          {campaign.tasks.map((task, idx) => (
            <button
              key={task.id}
              onClick={() => onSelectTask(idx)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTaskIndex === idx
                  ? 'bg-[#121417] text-white shadow-sm'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {task.completed ? (
                <Check className="w-3 h-3 text-emerald-300" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
              <span>Task {idx + 1}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
