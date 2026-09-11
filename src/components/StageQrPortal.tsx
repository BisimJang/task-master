import React, { useState } from 'react'
import { QrCode, Star, ArrowRight, Search, Check, Copy } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQrEvent, setSelectedQrEvent] = useState<StageEvent | null>(events[0] || null)
  const [copiedLink, setCopiedLink] = useState(false)

  const starredEvents = events.filter((e) => starredEventIds.includes(e.id))
  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.organizer?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const featuredEvent = selectedQrEvent || events[0] || null
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const featuredEventUrl = featuredEvent ? `${origin}?event=${featuredEvent.slug}` : ''

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="space-y-6 pt-2 pb-24">
      {/* FEATURED QR CODE STAGE CARD */}
      {featuredEvent ? (
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

            {/* Event Info & Star Action */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF532F] bg-white/10 px-2.5 py-0.5 rounded-full">
                  Live Stage QR
                </span>
                <button
                  onClick={() => onToggleStar(featuredEvent.id)}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                    starredEventIds.includes(featuredEvent.id)
                      ? 'bg-[#FBD023] text-[#121417] border-[#FBD023]'
                      : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                  }`}
                  title={starredEventIds.includes(featuredEvent.id) ? 'Starred' : 'Star this event'}
                >
                  <Star className={`w-3.5 h-3.5 ${starredEventIds.includes(featuredEvent.id) ? 'fill-[#121417]' : ''}`} />
                  <span>{starredEventIds.includes(featuredEvent.id) ? 'Starred' : 'Star'}</span>
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
      ) : (
        <div className="bg-white border-3 border-dashed border-[#121417]/20 rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#FBD023] border-2 border-[#121417] flex items-center justify-center mx-auto shadow-retro-sm">
            <QrCode className="w-7 h-7 text-[#121417]" />
          </div>
          <h3 className="font-display font-black text-xl text-[#121417]">No Stages Created Yet</h3>
          <p className="text-xs text-[#121417]/60 font-bold max-w-sm mx-auto">
            Create an event in Creator Hub or ask your host for their QR code or link to enter a live stage.
          </p>
          <button
            onClick={onOpenCreator}
            className="px-5 py-2.5 bg-[#121417] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-retro-sm hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            + Create First Event
          </button>
        </div>
      )}

      {/* STARRED EVENTS SECTION (WHEN THEY LOGIN IT'S THERE) */}
      {starredEvents.length > 0 && (
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
                      title="Remove from Starred"
                    >
                      <Star className="w-4 h-4 fill-[#FBD023]" />
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
      )}

      {/* ALL AVAILABLE EVENTS WITH QUICK STAR & QR */}
      {events.length > 1 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-display font-black text-lg text-[#121417] tracking-tight uppercase">
              All Stages
            </h3>
            {events.length > 3 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#121417]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search stages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border-2 border-[#121417] rounded-xl font-bold text-[#121417] outline-hidden placeholder:text-[#121417]/40 w-full sm:w-48"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {filteredEvents.map((evt) => {
              const isStarred = starredEventIds.includes(evt.id)
              const isCurrentFeatured = featuredEvent?.id === evt.id

              return (
                <div
                  key={evt.id}
                  className={`bg-white border-2 border-[#121417] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-[#FF532F] transition-all ${
                    isCurrentFeatured ? 'ring-2 ring-[#FF532F]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleStar(evt.id)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                        isStarred
                          ? 'bg-[#FBD023] border-[#121417] text-[#121417]'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-400 hover:text-neutral-600'
                      }`}
                      title={isStarred ? 'Unstar' : 'Star'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-[#121417]' : ''}`} />
                    </button>

                    <div className="min-w-0">
                      <p className="font-black text-sm text-[#121417] truncate">{evt.title}</p>
                      <p className="text-[10px] text-[#121417]/60 font-medium">
                        {evt.organizer || 'Stage Event'} • {evt.tasks?.length || 0} Quizzes •{' '}
                        <span className="text-[#FF532F] font-bold">{evt.totalPoolNIM} NIM</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedQrEvent(evt)}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#121417] transition-colors cursor-pointer"
                      title="Show QR Code on Stage"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="px-3.5 py-2 bg-[#121417] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* WALLET CONNECT CTA PROMPT (IF NOT CONNECTED) */}
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
