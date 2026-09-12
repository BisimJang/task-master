import React, { useState } from 'react'
import { QrCode, Star, ArrowRight, Check, Copy, Scan, ArrowUpRight } from 'lucide-react'
// @ts-ignore
import { QRCodeSVG } from 'qrcode.react'
import type { StageEvent } from '../lib/types'

interface StageQrPortalProps {
  events: StageEvent[]
  starredEventIds: string[]
  onToggleStar: (eventId: string) => void
  onSelectEvent: (event: StageEvent) => void
  onOpenCreator: () => void
  nimiqAddress: string | null
  onConnectWallet: () => void
}

export const StageQrPortal: React.FC<StageQrPortalProps> = ({
  events,
  starredEventIds,
  onToggleStar,
  onSelectEvent,
  onOpenCreator,
  nimiqAddress,
  onConnectWallet,
}) => {
  const [selectedQrEvent, setSelectedQrEvent] = useState<StageEvent | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [stageCodeInput, setStageCodeInput] = useState('')
  const [joinError, setJoinError] = useState('')

  const starredEvents = events.filter((e) => starredEventIds.includes(e.id))
  const featuredEvent = selectedQrEvent || starredEvents[0] || null

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const featuredEventUrl = featuredEvent ? `${origin}?event=${featuredEvent.slug}` : ''

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    setJoinError('')
    const input = stageCodeInput.trim()
    if (!input) return

    let targetSlug = input
    if (input.includes('?event=')) {
      targetSlug = input.split('?event=')[1].split('&')[0]
    } else if (input.includes('/')) {
      targetSlug = input.split('/').pop() || input
    }

    const matched = events.find(
      (ev) => ev.slug.toLowerCase() === targetSlug.toLowerCase() || ev.id.toLowerCase() === targetSlug.toLowerCase()
    )

    if (matched) {
      onSelectEvent(matched)
    } else {
      setJoinError('Stage not found. Please verify the code or scan the host QR code.')
    }
  }

  return (
    <div id="stage-portal" className="space-y-6 pt-2 pb-24 scroll-mt-24">
      {/* 1. STARRED STAGES PRESENT ON HOME */}
      {starredEvents.length > 0 ? (
        <div className="space-y-6">
          {/* Active Starred Event QR Spotlight */}
          {featuredEvent && (
            <div className="bg-[#121417] border-3 border-[#121417] rounded-3xl p-6 text-white shadow-retro relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Direct QR Code */}
                <div className="bg-white p-3.5 rounded-2xl border-2 border-white shadow-sm flex flex-col items-center justify-center shrink-0">
                  <QRCodeSVG
                    value={featuredEventUrl}
                    size={140}
                    level="M"
                    includeMargin={false}
                  />
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#121417] mt-2 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" /> Scan to Join
                  </span>
                </div>

                {/* Event Info & Actions */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex items-center justify-center sm:justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF532F] bg-white/10 px-2.5 py-0.5 rounded-full">
                      Live Stage
                    </span>
                    <button
                      onClick={() => onToggleStar(featuredEvent.id)}
                      className="p-2 rounded-xl bg-[#FBD023] text-[#121417] border border-[#FBD023] transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold"
                      title="Unstar this stage"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#121417]" />
                      <span>Starred</span>
                    </button>
                  </div>

                  <h2 className="font-display font-black text-2xl tracking-tight text-white">
                    {featuredEvent.title}
                  </h2>
                  {featuredEvent.organizer && (
                    <p className="text-xs text-white/60 font-medium">{featuredEvent.organizer}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="bg-[#FBD023] text-[#121417] font-black text-xs px-2.5 py-1 rounded-lg">
                      {featuredEvent.totalPoolNIM} NIM Pool
                    </span>
                    <span className="text-xs text-white/60 font-bold">
                      {featuredEvent.tasks?.length || 0} Quizzes
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      onClick={() => onSelectEvent(featuredEvent)}
                      className="px-5 py-2.5 bg-[#FF532F] hover:bg-[#e64522] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Enter Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopy(featuredEventUrl)}
                      className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List of available stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#FBD023] fill-[#FBD023]" />
                <h3 className="font-display font-black text-lg text-[#121417] tracking-tight uppercase">
                  My Starred Stages
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#121417]/60">
                {starredEvents.length} Saved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {starredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm flex flex-col justify-between hover:border-[#FF532F] transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-sm text-[#121417] tracking-tight line-clamp-1">
                        {evt.title}
                      </h4>
                      <button
                        onClick={() => onToggleStar(evt.id)}
                        className="text-[#FBD023] hover:opacity-75 cursor-pointer p-0.5"
                        title="Remove from saved stages"
                      >
                        <Star className="w-4 h-4 fill-[#FBD023] text-[#FBD023]" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#121417]/60 font-medium mt-0.5">
                      {evt.organizer || 'Live Event'} • {evt.tasks?.length || 0} Quizzes
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="font-black text-xs text-[#FF532F]">
                      {evt.totalPoolNIM} NIM Pool
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedQrEvent(evt)}
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#121417] text-xs font-bold cursor-pointer"
                        title="Show QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectEvent(evt)}
                        className="px-3 py-1.5 bg-[#121417] text-white hover:bg-black rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        Enter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 2. EMPTY HOME: NO EVENTS SHOWN UNLESS STARRED */
        <div className="bg-white border-3 border-[#121417] rounded-3xl p-8 text-center space-y-6 shadow-retro">
          <div className="w-16 h-16 rounded-2xl bg-[#FBD023] border-2 border-[#121417] flex items-center justify-center mx-auto shadow-retro-sm">
            <QrCode className="w-8 h-8 text-[#121417]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-display font-black text-2xl text-[#121417] tracking-tight">
              Scan QR Code to Join
            </h3>
            <p className="text-xs text-[#121417]/70 font-bold leading-relaxed">
              Use your camera or the Nimiq Pay scanner to enter a stage presentation. Star any stage to keep it pinned to your home screen.
            </p>
          </div>

          {/* Quick Code / Link Input */}
          <form onSubmit={handleJoinByCode} className="max-w-md mx-auto space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter event slug or paste link..."
                value={stageCodeInput}
                onChange={(e) => setStageCodeInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-neutral-50 border-2 border-[#121417] rounded-xl font-bold text-[#121417] outline-hidden placeholder:text-[#121417]/40"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#121417] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
              >
                Join
              </button>
            </div>
            {joinError && <p className="text-[11px] font-bold text-red-500">{joinError}</p>}
          </form>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setJoinError('Open the QR scanner in Nimiq Pay, then scan the presenter’s stage code.')}
              className="w-full sm:w-auto px-6 py-3 bg-[#FBD023] hover:bg-[#ebd52a] text-[#121417] border-2 border-[#121417] font-black text-xs uppercase tracking-wider rounded-xl shadow-retro-sm hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Stage QR</span>
            </button>

            <button
              onClick={onOpenCreator}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-neutral-50 text-[#121417] border-2 border-[#121417] font-black text-xs uppercase tracking-wider rounded-xl shadow-retro-sm hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Host a Stage</span>
            </button>
          </div>
          {joinError && <p role="status" className="text-[11px] font-bold text-[#FF532F]">{joinError}</p>}
        </div>
      )}

      {/* QUICK JOIN BAR IF USER ALREADY HAS STARRED STAGES */}
      {starredEvents.length > 0 && (
        <div className="bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-xs">
          <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#121417]/70 shrink-0">
              <Scan className="w-4 h-4 text-[#FF532F]" />
              <span>Join Another Stage:</span>
            </div>
            <input
              type="text"
              placeholder="Paste stage link or event slug..."
              value={stageCodeInput}
              onChange={(e) => setStageCodeInput(e.target.value)}
              className="flex-1 w-full px-3 py-2 text-xs bg-neutral-50 border-2 border-[#121417] rounded-xl font-bold text-[#121417] outline-hidden placeholder:text-[#121417]/40"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[#121417] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shrink-0"
            >
              Enter
            </button>
          </form>
          {joinError && <p className="text-[11px] font-bold text-red-500 mt-2">{joinError}</p>}
        </div>
      )}

      {/* WALLET CONNECT PROMPT (IF NOT SIGNED IN) */}
      {!nimiqAddress && (
        <div className="bg-[#FBD023] border-3 border-[#121417] rounded-3xl p-5 shadow-retro-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display font-black text-base text-[#121417]">
              Connect Nimiq Wallet to Claim NIM
            </h4>
            <p className="text-xs font-bold text-[#121417]/80">
              Answer quizzes on stage and claim rewards directly to your Nimiq address.
            </p>
          </div>
          <button
            onClick={onConnectWallet}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#121417] hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs cursor-pointer shrink-0"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  )
}
