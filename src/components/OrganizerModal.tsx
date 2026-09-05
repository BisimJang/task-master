import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, CheckCircle2, Copy, Sparkles, QrCode } from 'lucide-react'
import type { Campaign, QuestTask } from '../lib/types'
import { saveCampaign } from '../lib/db'

interface OrganizerModalProps {
  isOpen: boolean
  onClose: () => void
  onCampaignCreated: (newCamp: Campaign) => void
}

export const OrganizerModal: React.FC<OrganizerModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'booth_qr'>('create')

  // Form State
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [rewardType, setRewardType] = useState<'NIM' | 'USDT'>('NIM')
  const [rewardAmount, setRewardAmount] = useState<number>(25)
  const [maxClaims, setMaxClaims] = useState<number>(100)
  const [sponsorName, setSponsorName] = useState('My Sponsor Booth')
  const [boothNumber, setBoothNumber] = useState('Booth #1')

  const defaultTasks: QuestTask[] = [
    {
      id: 'task-new-1',
      title: 'Follow on X',
      description: 'Follow our official project channel.',
      type: 'social',
      completed: false,
      targetUrl: 'https://x.com/nimiq',
      sponsorName: sponsorName || 'Social Task'
    },
    {
      id: 'task-new-2',
      title: 'Event Trivia',
      description: 'Answer our quick booth question.',
      type: 'trivia',
      completed: false,
      triviaQuestion: 'What is the fastest cryptocurrency for browser payments?',
      triviaOptions: ['Bitcoin', 'Nimiq', 'Dogecoin'],
      triviaCorrectIndex: 1,
      sponsorName: sponsorName || 'Trivia Task'
    },
    {
      id: 'task-new-3',
      title: 'Secret Booth Code',
      description: 'Ask the booth team for the secret drop code.',
      type: 'booth_code',
      completed: false,
      secretCode: 'BOOTH2026',
      sponsorName: boothNumber || 'Booth Secret'
    }
  ]

  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCustom, setCopiedCustom] = useState(false)

  if (!isOpen) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)
    const newCamp: Campaign = {
      id: 'camp-' + Date.now(),
      slug,
      title: title || 'Custom Event Quest',
      subtitle: subtitle || 'Complete quests to earn rewards',
      description: 'Organized via HopDrop Studio inside Nimiq Pay.',
      organizerName: organizerName || 'Event Host',
      sponsors: [
        {
          id: 'sp-' + Date.now(),
          name: sponsorName,
          avatar: 'https://nimiq.dev/img/logos/nimiq-logo.svg',
          booth: boothNumber,
          role: 'Primary Sponsor'
        }
      ],
      rewardType,
      rewardAmount: Number(rewardAmount),
      totalPool: Number(rewardAmount) * Number(maxClaims),
      claimedCount: 0,
      maxClaims: Number(maxClaims),
      tasks: defaultTasks,
      organizerAddress: 'NQ07 0000 0000 0000 0000'
    }

    saveCampaign(newCamp)
    setCreatedCampaign(newCamp)
    onCampaignCreated(newCamp)
    setActiveTab('booth_qr')
  }

  // Deep Links
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hopdrop.vercel.app'
  const campaignUrl = createdCampaign ? `${originUrl}?event=${createdCampaign.slug}` : originUrl
  const universalDeepLink = `https://nimpay.app/miniapps/open/${campaignUrl.replace(/^https?:\/\//, '')}`
  const customSchemeLink = `nimiqpay://miniapp?url=${encodeURIComponent(campaignUrl)}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-3 border-[#121417] rounded-[36px] p-6 sm:p-8 shadow-retro-lg text-[#121417] my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4 text-[#121417]" />
        </button>

        {/* Tab Header */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#121417] text-white shadow-retro-sm'
                : 'bg-neutral-100 hover:bg-neutral-200 text-[#121417]'
            }`}
          >
            Campaign Studio
          </button>
          <button
            onClick={() => setActiveTab('booth_qr')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'booth_qr'
                ? 'bg-[#FF532F] text-white shadow-retro-sm'
                : 'bg-neutral-100 hover:bg-neutral-200 text-[#121417]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Booth Card & QR</span>
          </button>
        </div>

        {/* TAB 1: CREATE CAMPAIGN */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <h2 className="font-display font-black text-2xl tracking-tight text-[#121417]">
              Host a New Event Drop
            </h2>
            <p className="text-xs text-[#121417]/70 font-medium">
              Create tasks, deposit rewards in NIM or USDT, and get a printable QR code for your event booth.
            </p>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#121417]/80 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EthBerlin Hack Quest"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-2xl border-2 border-[#121417] bg-[#F4F4F6] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#121417]/80 mb-1">
                  Host / Sponsor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nimiq Foundation"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-2xl border-2 border-[#121417] bg-[#F4F4F6] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#121417]/80 mb-1">
                  Sponsor Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Polygon Booth"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-2xl border-2 border-[#121417] bg-[#F4F4F6] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#121417]/80 mb-1">
                  Booth / Table Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Booth #B4"
                  value={boothNumber}
                  onChange={(e) => setBoothNumber(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-2xl border-2 border-[#121417] bg-[#F4F4F6] focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-[#121417]/80 mb-1">
                Short Tagline / Mission
              </label>
              <input
                type="text"
                placeholder="e.g. Visit our booth, solve trivia & earn instant crypto!"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-2xl border-2 border-[#121417] bg-[#F4F4F6] focus:outline-none focus:bg-white"
              />
            </div>

            {/* Reward Settings */}
            <div className="p-4 bg-[#F4F4F6] border-2 border-[#121417] rounded-3xl space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF532F]">
                Reward Pool Configuration
              </span>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#121417]/70 mb-1">
                    Token Rail
                  </label>
                  <select
                    value={rewardType}
                    onChange={(e) => setRewardType(e.target.value as 'NIM' | 'USDT')}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-2xl border-2 border-[#121417] bg-white cursor-pointer"
                  >
                    <option value="NIM">NIM (Feeless, 1s)</option>
                    <option value="USDT">USDT (Polygon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#121417]/70 mb-1">
                    Reward / User
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-2xl border-2 border-[#121417] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#121417]/70 mb-1">
                    Max Claims
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxClaims}
                    onChange={(e) => setMaxClaims(Number(e.target.value))}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-2xl border-2 border-[#121417] bg-white"
                  />
                </div>
              </div>

              <div className="text-[11px] font-bold text-[#121417]/70 flex justify-between pt-1">
                <span>Total Budget Required:</span>
                <span className="font-display font-black text-sm text-[#FF532F]">
                  {(rewardAmount * maxClaims).toLocaleString()} {rewardType}
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-[#121417] hover:bg-black text-white font-black text-xs uppercase tracking-wider shadow-retro transition-all active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FBD023]" />
                <span>Publish Campaign & Generate QR</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: BOOTH CARD & QR EXPORT */}
        {activeTab === 'booth_qr' && (
          <div className="space-y-6 text-center">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#FF532F] bg-orange-100 px-3 py-1 rounded-full">
                Ready for Attendees
              </span>
              <h2 className="font-display font-black text-2xl tracking-tight mt-2 text-[#121417]">
                Printable Booth Flyer & Deep Links
              </h2>
              <p className="text-xs text-[#121417]/70 font-medium max-w-md mx-auto mt-1">
                Place this QR code at your sponsor table or conference presentation. Attendees scan directly inside Nimiq Pay to open the quest.
              </p>
            </div>

            {/* Physical Booth Card Preview */}
            <div className="max-w-xs mx-auto p-5 bg-[#FBD023] border-3 border-[#121417] rounded-3xl shadow-retro">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#121417]">
                {createdCampaign?.title || 'Nimiq Hackathon Quest'}
              </div>
              <div className="text-xs font-bold text-[#121417]/80 mt-0.5">
                Scan to Claim {createdCampaign?.rewardAmount || 50} {createdCampaign?.rewardType || 'NIM'}
              </div>

              {/* QR Code Container */}
              <div className="my-3 p-3 bg-white border-2 border-[#121417] rounded-2xl inline-block shadow-sm">
                <QRCodeSVG
                  value={universalDeepLink}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="text-[10px] font-bold text-[#121417]/90 uppercase tracking-widest flex items-center justify-center gap-1">
                <span>⚡ 1-Sec Payout in Nimiq Pay</span>
              </div>
            </div>

            {/* Deep Links Box */}
            <div className="text-left p-4 bg-[#F4F4F6] border-2 border-[#121417] rounded-2xl space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#121417]">
                    1. Universal Nimiq Pay Link:
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(universalDeepLink)
                      setCopiedLink(true)
                      setTimeout(() => setCopiedLink(false), 2000)
                    }}
                    className="text-xs font-bold text-[#FF532F] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] break-all bg-white p-2 rounded-xl border border-black/10 mt-1">
                  {universalDeepLink}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-[#121417]">
                    2. Native Custom Scheme Link:
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customSchemeLink)
                      setCopiedCustom(true)
                      setTimeout(() => setCopiedCustom(false), 2000)
                    }}
                    className="text-xs font-bold text-[#FF532F] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedCustom ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCustom ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] break-all bg-white p-2 rounded-xl border border-black/10 mt-1">
                  {customSchemeLink}
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="py-3 px-6 rounded-full bg-[#121417] hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-retro-sm cursor-pointer"
            >
              Print Booth Card
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
