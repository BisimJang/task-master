import { useState, useEffect } from 'react'
import { Sparkles, Zap, Settings, ArrowLeft, Wallet, Menu, Plus, X } from 'lucide-react'
import { CreatorUtilityModal } from './components/CreatorUtilityModal'
import { LiveSessionsSection } from './components/LiveSessionsSection'
import { AudienceTerminalSection } from './components/AudienceTerminalSection'
import { CollapsiblePlatformHero } from './components/CollapsiblePlatformHero'
import { WalletConnectModal } from './components/WalletConnectModal'
import { StageQrPortal } from './components/StageQrPortal'
import { FirstRunGuide } from './components/FirstRunGuide'
import type { StageEvent, AttendeeClaimRecord, GiveawayEntry } from './lib/types'
import { getEvents, saveEvent, getClaims, saveClaim, createPayout, hasClaimedTask, clearAllStorage, updateTaskWinnerCount, joinGiveaway, getGiveawayEntries } from './lib/db'
import { initNimiqProvider, requestNimiqAccount, type NimiqProviderInstance } from './lib/nimiq'

function SettingsPanel({ 
  nimiqAddress, 
  isInsideNimiqPay, 
  totalEarned, 
  claims,
  onConnect,
  onDisconnect,
  onShowGuide,
  onOpenCreatorMenu,
  onResetPreferences,
  creatorName,
  onCreatorNameChange,
}: {
  nimiqAddress: string | null
  isInsideNimiqPay: boolean
  totalEarned: number
  claims: AttendeeClaimRecord[]
  onConnect: () => void
  onDisconnect: () => void
  onShowGuide: () => void
  onOpenCreatorMenu: () => void
  onResetPreferences: () => void
  creatorName: string
  onCreatorNameChange: (name: string) => void
}) {
  const joinedCount = new Set(claims.filter(c => c.walletAddress && c.walletAddress === nimiqAddress).map(c => c.eventId)).size

  return (
    <div className="space-y-4 pt-4 pb-28">
      {/* Wallet Card */}
      <div className="bg-[#121417] rounded-3xl p-5 text-white">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Your Wallet</p>
          {nimiqAddress && (
            <button 
              onClick={onDisconnect}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2.5 h-2.5 rounded-full ${nimiqAddress ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
          <span className="text-[10px] font-bold text-white/60">
            {nimiqAddress ? (isInsideNimiqPay ? 'Connected via Nimiq Pay' : 'Wallet Connected') : 'Not Connected'}
          </span>
        </div>

        {nimiqAddress ? (
          <p className="font-mono text-xs break-all text-[#FBD023] select-all">{nimiqAddress}</p>
        ) : (
          <div className="py-2">
            <button
              onClick={onConnect}
              className="w-full py-2.5 px-4 bg-[#FBD023] hover:bg-[#ebd52a] text-[#121417] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Connect Nimiq Wallet</span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs font-black text-white/60">Total Earned</span>
          <span className="font-black text-xl text-[#FBD023]">{totalEarned} NIM</span>
        </div>
      </div>

      <div className="bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm space-y-2">
        <label htmlFor="creator-name" className="text-[10px] font-black uppercase tracking-widest text-[#121417]/50">Creator name (saved once)</label>
        <input id="creator-name" value={creatorName} onChange={e => onCreatorNameChange(e.target.value)} placeholder="Your name or organization" maxLength={60} className="w-full text-xs font-bold p-2.5 rounded-xl border border-neutral-300" />
        <p className="text-[10px] text-[#121417]/55">Set this once in Settings. New events reuse it automatically.</p>
      </div>

      <div className="bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#121417]/50">Creator tools</p>
            <p className="text-xs font-bold mt-1">Create events, manage entries, and send the payout queue.</p>
          </div>
          <button onClick={onOpenCreatorMenu} className="rounded-xl bg-[#FF532F] px-3 py-2 text-[10px] font-black uppercase text-white">Open Hub</button>
        </div>
        <p className="text-[10px] text-[#121417]/55">Giveaways are event types: create one, share its link, then review every wallet submission in Creator Hub.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#121417]/50 mb-1">Events Joined</p>
          <p className="font-black text-2xl text-[#121417]">{joinedCount}</p>
        </div>
        <div className="bg-[#FBD023] border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#121417]/50 mb-1">NIM Earned</p>
          <p className="font-black text-2xl text-[#121417]">{totalEarned}</p>
        </div>
      </div>

      <button onClick={onShowGuide} className="w-full bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm text-left flex items-center justify-between"><span className="text-xs font-black">How to use EventQuest</span><span className="text-xs font-black text-[#FF532F]">Open guide ?</span></button>

      <details className="bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm">
        <summary className="cursor-pointer text-xs font-black">Data & privacy</summary>
        <div className="mt-3 space-y-2 text-[11px] font-bold text-[#121417]/65">
          <p>Your creator name, starred stages, guide status, and device identifier are stored locally on this device.</p>
          <p>Wallet addresses and event activity may be used for participation, winner records, and host payout review.</p>
          <button onClick={onResetPreferences} className="mt-1 text-[#FF532F] font-black uppercase tracking-wider">Reset local preferences</button>
        </div>
      </details>

      {/* App Info */}
      <div className="bg-white border-2 border-[#121417] rounded-2xl p-4 shadow-retro-sm space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#121417]/50">About</p>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-[#121417]/60">App</span>
          <span>EventQuest</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-[#121417]/60">Network</span>
          <span>Nimiq Mainnet</span>
        </div>
        <div className="flex justify-between text-xs font-bold">
          <span className="text-[#121417]/60">Platform</span>
          <span>{isInsideNimiqPay ? 'Nimiq Pay Mini App' : 'Browser'}</span>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<'stage' | 'terminal' | 'settings'>('stage')
  const [events, setEvents] = useState<StageEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState<StageEvent | null>(null)
  
  // Wallet state
  const [nimiqAddress, setNimiqAddress] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isInsideNimiqPay, setIsInsideNimiqPay] = useState(false)
  const [nimiqProvider, setNimiqProvider] = useState<NimiqProviderInstance | null>(null)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

  // Starred events
  const [starredEventIds, setStarredEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eventquest_starred_events')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const handleToggleStar = (eventId: string) => {
    setStarredEventIds((prev) => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
      try {
        localStorage.setItem('eventquest_starred_events', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Claims
  const [claims, setClaims] = useState<AttendeeClaimRecord[]>([])
  const [totalEarned, setTotalEarned] = useState(0)

  // Modals
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false)
  const [isCreatorMenuOpen, setIsCreatorMenuOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(() => localStorage.getItem('eventquest_guide_seen') !== 'true')
  const [creatorName, setCreatorName] = useState(() => localStorage.getItem('eventquest_creator_name') || '')

  // State to track async lookups for claims
  const [earnedPerTask, setEarnedPerTask] = useState<Record<string, boolean>>({})
  const [giveawayJoined, setGiveawayJoined] = useState(false)

  // INITIAL LOAD
  useEffect(() => {
    const loadData = async () => {
      const loadedEvents = await getEvents()
      setEvents(loadedEvents)
      const loadedClaims = await getClaims()
      setClaims(loadedClaims)

      // URL Parsing for specific event
      const searchParams = new URLSearchParams(window.location.search)
      const eventSlug = searchParams.get('event')
      let active = null
      if (loadedEvents.length > 0 && eventSlug) {
        active = loadedEvents.find(e => e.slug === eventSlug) || null
        setCurrentEvent(active)
      }
    }
    loadData()

    // Setup Nimiq & Wallet
    const initNimiq = async () => {
      // Purge any legacy simulated fake address from previous runs
      try {
        localStorage.removeItem('stagedrop_wallet_addr')
      } catch {}

      try {
        const provider = await initNimiqProvider()
        setNimiqProvider(provider)
        if (provider) {
          try {
            // Check if accounts already approved by user in session
            const accts = await provider.listAccounts()
            if (Array.isArray(accts) && accts.length > 0) {
              const firstAcct = accts[0] as any
              setNimiqAddress(typeof firstAcct === 'string' ? firstAcct : firstAcct.address)
              setIsInsideNimiqPay(true)
            }
          } catch {
            // Awaiting user explicit tap on "Connect Wallet"
          }
        }
      } catch (err) {
        console.warn('Failed to init Nimiq Provider:', err)
      }

      try {
        // @ts-ignore
        if (window.nimiq && window.nimiq.requestDeviceIdentifier) {
          // @ts-ignore
          const id = await window.nimiq.requestDeviceIdentifier()
          setDeviceId(id)
        } else {
          let id = localStorage.getItem('stagedrop_device_id')
          if (!id) {
            id = 'dev-' + Math.random().toString(36).substr(2, 9)
            localStorage.setItem('stagedrop_device_id', id)
          }
          setDeviceId(id)
        }
      } catch (err) {
        console.warn('Nimiq Device ID not available:', err)
      }
    }
    initNimiq()
  }, [])

  const handleConnectWallet = async () => {
    try {
      const { address, provider } = await requestNimiqAccount()
      if (address) {
        setNimiqAddress(address)
        setIsInsideNimiqPay(true)
        if (provider) setNimiqProvider(provider)
      } else {
        setIsWalletModalOpen(true)
      }
    } catch (err) {
      console.warn('Connect error:', err)
      setIsWalletModalOpen(true)
    }
  }

  const handleDisconnectWallet = () => {
    setNimiqAddress(null)
    setIsInsideNimiqPay(false)
    try {
      localStorage.removeItem('stagedrop_wallet_addr')
    } catch {}
  }

  // Calc Total Earned
  useEffect(() => {
    if (!nimiqAddress && !deviceId) return
    const userClaims = claims.filter(c =>
      (nimiqAddress && c.walletAddress?.toLowerCase() === nimiqAddress.toLowerCase()) ||
      (deviceId && c.deviceIdentifier === deviceId)
    )
    const earned = userClaims.reduce((sum, c) => sum + c.amountNIM, 0)
    setTotalEarned(earned)
  }, [claims, nimiqAddress, deviceId])

  // Check claims asynchronously when currentEvent or wallet changes
  useEffect(() => {
    if (!currentEvent || (!nimiqAddress && !deviceId)) return
    const checkClaims = async () => {
      const map: Record<string, boolean> = {}
      for (const t of currentEvent.tasks) {
        map[t.id] = await hasClaimedTask(currentEvent.id, t.id, nimiqAddress || '', deviceId)
      }
      setEarnedPerTask(map)
    }
    checkClaims()
  }, [currentEvent, nimiqAddress, deviceId, claims])

  // --- Handlers ---

  const handleTaskComplete = async (taskId: string, _optIdx: number) => {
    if (!currentEvent) return

    const task = currentEvent.tasks.find((x) => x.id === taskId)
    if (!task) return

    if (task.winnerCount >= task.maxWinners) {
      console.log('Task already claimed max times.')
      return
    }

    const alreadyClaimed = await hasClaimedTask(currentEvent.id, taskId, nimiqAddress || '', deviceId)
    if (alreadyClaimed) {
      console.log('Already claimed by this user.')
      return
    }

    // 1. Increment winnerCount in DB
    const updatedEvent = await updateTaskWinnerCount(currentEvent.id, taskId)
    if (updatedEvent) {
      setCurrentEvent(updatedEvent)
      setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e))
    }

    // 2. Grant Claim locally
    const claimRecord: AttendeeClaimRecord = {
      id: 'clm-' + Date.now(),
      eventId: currentEvent.id,
      taskId: taskId,
      walletAddress: nimiqAddress || 'unlinked',
      deviceIdentifier: deviceId,
      amountNIM: task.rewardNIM,
      txHash: 'pending',
      claimedAt: new Date().toISOString()
    }
    
    await saveClaim(claimRecord)
    const payoutCreated = await createPayout({
      id: 'payout-' + claimRecord.id,
      claimId: claimRecord.id,
      eventId: claimRecord.eventId,
      taskId: claimRecord.taskId,
      recipientAddress: claimRecord.walletAddress,
      amountLuna: Math.round(claimRecord.amountNIM * 100000),
      status: 'pending',
      txHash: null,
      createdAt: claimRecord.claimedAt,
    })
    if (!payoutCreated) {
      alert('Winner recorded, but the payout queue could not be saved. Apply the Supabase payouts migration before sending rewards.')
    }
    setClaims([...claims, claimRecord])
  }

  const handleJoinGiveaway = async (): Promise<boolean> => {
    if (!currentEvent || currentEvent.mode !== 'giveaway') return false
    if (currentEvent.giveawayClosed) return false
    if (!nimiqAddress) {
      setIsWalletModalOpen(true)
      return false
    }
    if (currentEvent.giveawayLimit !== undefined &&
      (await getGiveawayEntries(currentEvent.id)).length >= currentEvent.giveawayLimit) return false
    const entry: GiveawayEntry = {
      id: `giveaway-${currentEvent.id}-${nimiqAddress}`,
      eventId: currentEvent.id,
      walletAddress: nimiqAddress,
      deviceIdentifier: deviceId,
      joinedAt: new Date().toISOString(),
    }
    const joined = await joinGiveaway(entry)
    if (joined) setGiveawayJoined(true)
    return joined
  }

  // Creator Modal Handlers
  const handleCreateEvent = async (newEvent: StageEvent) => {
    // Inject creator address when creating
    const eventWithCreator = {
      ...newEvent,
      creatorAddress: nimiqAddress || 'unlinked'
    }
    await saveEvent(eventWithCreator)
    setEvents([eventWithCreator, ...events])
    setCurrentEvent(eventWithCreator)
    window.history.replaceState({}, '', `?event=${eventWithCreator.slug}`)
  }

  const handleUpdateEvent = async (updatedEvent: StageEvent) => {
    await saveEvent(updatedEvent)
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e))
    setCurrentEvent(updatedEvent)
  }

  const handleSelectEvent = (event: StageEvent) => {
    setCurrentEvent(event)
    window.history.replaceState({}, '', `?event=${event.slug}`)
  }

  const handleFundPool = async (amount: number): Promise<{ success: boolean; message: string }> => {
    if (!currentEvent) return { success: false, message: 'Select an event first.' }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, message: 'Enter a positive NIM amount.' }
    }
    if (!nimiqAddress || !nimiqProvider) {
      return { success: false, message: 'Open EventQuest in Nimiq Pay and connect the creator wallet first.' }
    }

    const requiredBudget = currentEvent.tasks.reduce(
      (sum, task) => sum + task.rewardNIM * task.maxWinners,
      0,
    )
    const nextBudget = currentEvent.totalPoolNIM + amount
    if (nextBudget < requiredBudget) {
      return {
        success: false,
        message: `Budget saved only on paper: add at least ${requiredBudget - nextBudget} more NIM for configured winners.`,
      }
    }

    const updatedEvent = { ...currentEvent, totalPoolNIM: nextBudget }
    await handleUpdateEvent(updatedEvent)
    return {
      success: true,
      message: `Payout budget set to ${nextBudget} NIM. Actual payouts are approved from this wallet in Airdrop & Pool.`,
    }
  }

  const handleClearAllData = () => {
    clearAllStorage()
    setEvents([])
    setCurrentEvent(null)
    setClaims([])
    setTotalEarned(0)
    setIsCreatorModalOpen(false)
    window.history.replaceState({}, '', '/')
  }

  const handleClaimSuccess = (txHash: string, amount: number) => {
     console.log('Claim Success!', txHash, amount)
  }

  const handleGoHome = () => {
    setCurrentEvent(null)
    setActiveTab('stage')
    window.history.replaceState({}, '', window.location.pathname)
  }

  useEffect(() => { setGiveawayJoined(false) }, [currentEvent?.id, nimiqAddress])

  // Determine if current user is the creator
  const isCreator = !currentEvent || 
    (currentEvent.creatorAddress && nimiqAddress && currentEvent.creatorAddress.toLowerCase() === nimiqAddress.toLowerCase())

  const handleOpenCreator = () => {
    if (!nimiqAddress) {
      alert('You must connect your Nimiq wallet before you can create an event.')
      setIsWalletModalOpen(true)
      return
    }
    setIsCreatorModalOpen(true)
    setIsCreatorMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#121417] selection:bg-[#FF532F] selection:text-white pb-24 md:pb-0 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#F7F7F5]/95 backdrop-blur-md border-b border-[#121417]/10 px-4 sm:px-6 py-3 flex items-center gap-4 shadow-[0_8px_24px_-20px_rgba(18,20,23,0.45)]">
        <div className="flex items-center gap-2">
          {currentEvent && (
            <button
              onClick={handleGoHome}
              className="p-1.5 rounded-xl bg-[#F4F4F6] hover:bg-neutral-200 border-2 border-[#121417]/10 transition-all text-[#121417] flex items-center gap-1 text-xs font-black mr-1 cursor-pointer shadow-xs"
              title="Back to All Events / Home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={handleGoHome} title="Go to Home">
            <div className="w-8 h-8 rounded-xl bg-[#121417] flex items-center justify-center shadow-retro-sm">
              <Zap className="w-4 h-4 text-[#FBD023]" />
            </div>
            <div>
              <h1 className="font-display font-black text-sm tracking-tight uppercase">EventQuest</h1>
              <p className="text-[9px] font-black tracking-widest text-[#121417]/50 uppercase">Nimiq Pay</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 order-3 ml-auto">
          {nimiqAddress ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="focus-ring flex bg-white text-[#121417] px-3 py-1.5 rounded-full items-center gap-1.5 border border-[#121417]/15 cursor-pointer hover:border-[#121417]/40 transition-colors"
              title="Wallet Details"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] font-bold">{nimiqAddress.slice(0, 9)}...{nimiqAddress.slice(-4)}</span>
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="focus-ring flex items-center gap-1.5 bg-[#FBD023] hover:bg-[#f6c80b] text-[#121417] px-3 py-1.5 rounded-full border border-[#121417] font-black text-xs uppercase tracking-wider shadow-retro-sm hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
          <div 
            onClick={() => setActiveTab('terminal')}
            className="bg-[#121417] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#121417] hover:bg-[#272b31] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBD023]" />
            <span className="font-black text-xs">{totalEarned} NIM</span>
          </div>
          {isCreator && (
            <button 
              data-open-creator
              onClick={() => setIsCreatorMenuOpen(true)}
              className="focus-ring w-8 h-8 rounded-full bg-white border border-[#121417]/20 flex items-center justify-center hover:bg-neutral-100 transition-all"
              title="Open creator menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>
        <nav className="hidden md:flex items-center gap-1 order-2" aria-label="Primary navigation">
          <button onClick={handleGoHome} className={`focus-ring px-3 py-2 rounded-lg text-xs font-black uppercase transition-colors ${activeTab === 'stage' && !currentEvent ? 'bg-[#121417] text-white' : 'hover:bg-white'}`}>Home</button>
          <button onClick={() => setActiveTab('terminal')} className={`focus-ring px-3 py-2 rounded-lg text-xs font-black uppercase transition-colors ${activeTab === 'terminal' ? 'bg-[#121417] text-white' : 'hover:bg-white'}`}>Rewards</button>
          <button onClick={() => setActiveTab('settings')} className={`focus-ring px-3 py-2 rounded-lg text-xs font-black uppercase transition-colors ${activeTab === 'settings' ? 'bg-[#121417] text-white' : 'hover:bg-white'}`}>Wallet</button>
          <button onClick={handleOpenCreator} className="focus-ring ml-1 px-3 py-2 rounded-lg bg-[#FF532F] text-white text-xs font-black uppercase hover:bg-[#e64522] transition-colors">Create</button>
        </nav>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#121417] shadow-[0_-4px_0_0_rgba(0,0,0,0.05)]">
        <div className="flex">
          {/* Home */}
          <button
            onClick={() => setActiveTab('stage')}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all ${
              activeTab === 'stage' ? 'text-[#121417]' : 'text-[#121417]/40'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${activeTab === 'stage' ? 'text-[#FF532F]' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </button>

          {/* Rewards */}
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all ${
              activeTab === 'terminal' ? 'text-[#121417]' : 'text-[#121417]/40'
            }`}
          >
            <Zap className={`w-5 h-5 ${activeTab === 'terminal' ? 'text-[#FBD023]' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Rewards</span>
          </button>

          {/* Quick creator access */}
          <button
            onClick={handleOpenCreator}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[#121417]/55 transition-all"
            aria-label="Create event and open Creator Hub"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#121417] bg-[#FF532F] text-white shadow-retro-sm transition-transform hover:-translate-y-0.5 active:translate-y-0">
              <Plus className="h-5 w-5 stroke-[3]" />
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest">Create</span>
          </button>

          {/* Settings / Wallet */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all ${
              activeTab === 'settings' ? 'text-[#121417]' : 'text-[#121417]/40'
            }`}
          >
            <div className="relative">
              <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-[#121417]' : ''}`} />
              {nimiqAddress && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">
              {nimiqAddress ? 'Wallet' : 'Settings'}
            </span>
          </button>
        </div>
      </div>

      {isCreatorMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Creator menu">
          <button className="absolute inset-0 bg-[#121417]/35" onClick={() => setIsCreatorMenuOpen(false)} aria-label="Close creator menu" />
          <aside className="shape-surface-white absolute right-0 top-0 h-full w-[min(86vw,340px)] bg-white p-5 shadow-[-8px_0_24px_rgba(18,20,23,0.2)]">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-[#FF532F]">Creator workspace</p><h2 className="font-display text-xl font-black">Creator Hub</h2></div>
              <button onClick={() => setIsCreatorMenuOpen(false)} className="rounded-xl bg-neutral-100 p-2" aria-label="Close creator menu"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 space-y-2">
              <button onClick={handleOpenCreator} className="w-full rounded-xl bg-[#FF532F] px-4 py-3 text-left text-xs font-black uppercase text-white">Manage events & payouts</button>
              <button onClick={() => { setActiveTab('stage'); setIsCreatorMenuOpen(false) }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold hover:bg-neutral-100">Home</button>
              <button onClick={() => { setActiveTab('terminal'); setIsCreatorMenuOpen(false) }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold hover:bg-neutral-100">Rewards</button>
              <button onClick={() => { setActiveTab('settings'); setIsCreatorMenuOpen(false) }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold hover:bg-neutral-100">Wallet & Settings</button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="shape-field max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {!currentEvent && activeTab === 'stage' && <CollapsiblePlatformHero onOpenCreator={handleOpenCreator} />}
        <button data-open-creator className="hidden" onClick={handleOpenCreator} />

        {/* MOBILE VIEW (always switches based on activeTab) */}
        <div className="md:hidden">
          {activeTab === 'stage' ? (
            currentEvent ? (
              <LiveSessionsSection 
                event={currentEvent} 
                onTaskComplete={handleTaskComplete}
                earnedPerTask={earnedPerTask}
                onOpenCreatorMenu={isCreator ? handleOpenCreator : undefined}
                onBack={handleGoHome}
                isStarred={starredEventIds.includes(currentEvent.id)}
                onToggleStar={() => handleToggleStar(currentEvent.id)}
                onJoinGiveaway={handleJoinGiveaway}
                giveawayJoined={giveawayJoined}
              />
            ) : (
              <StageQrPortal
                events={events}
                starredEventIds={starredEventIds}
                onToggleStar={handleToggleStar}
                onSelectEvent={handleSelectEvent}
                onOpenCreator={handleOpenCreator}
                nimiqAddress={nimiqAddress}
                onConnectWallet={handleConnectWallet}
              />
            )
          ) : activeTab === 'terminal' ? (
            <AudienceTerminalSection 
              event={currentEvent}
              totalEarnedNIM={totalEarned}
              nimiqAddress={nimiqAddress}
              deviceId={deviceId}
              isInsideNimiqPay={isInsideNimiqPay}
              nimiqProvider={nimiqProvider}
              onOpenCreatorMenu={isCreator ? handleOpenCreator : undefined}
              onClaimSuccess={handleClaimSuccess}
            />
          ) : (
            <SettingsPanel 
              nimiqAddress={nimiqAddress} 
              isInsideNimiqPay={isInsideNimiqPay} 
              totalEarned={totalEarned} 
              claims={claims}
              onConnect={handleConnectWallet}
              onDisconnect={handleDisconnectWallet}
              onShowGuide={() => setIsGuideOpen(true)}
                onOpenCreatorMenu={handleOpenCreator}
                onResetPreferences={() => { localStorage.removeItem('eventquest_creator_name'); localStorage.removeItem('eventquest_starred_events'); localStorage.removeItem('eventquest_guide_seen'); setCreatorName(''); setStarredEventIds([]); setIsGuideOpen(true) }}
              creatorName={creatorName}
              onCreatorNameChange={(name) => { setCreatorName(name); localStorage.setItem('eventquest_creator_name', name) }}
            />
          )}
        </div>

        {/* DESKTOP CONTENT */}
        <div className="hidden md:block">
          {activeTab === 'settings' ? (
            <div className="max-w-xl mx-auto">
              <SettingsPanel
                nimiqAddress={nimiqAddress}
                isInsideNimiqPay={isInsideNimiqPay}
                totalEarned={totalEarned}
                claims={claims}
                onConnect={handleConnectWallet}
                onDisconnect={handleDisconnectWallet}
                onShowGuide={() => setIsGuideOpen(true)}
                onOpenCreatorMenu={handleOpenCreator}
                onResetPreferences={() => { localStorage.removeItem('eventquest_creator_name'); localStorage.removeItem('eventquest_starred_events'); localStorage.removeItem('eventquest_guide_seen'); setCreatorName(''); setStarredEventIds([]); setIsGuideOpen(true) }}
                creatorName={creatorName}
                onCreatorNameChange={(name) => { setCreatorName(name); localStorage.setItem('eventquest_creator_name', name) }}
              />
            </div>
          ) : activeTab === 'terminal' ? (
            <div className="max-w-xl mx-auto">
              <AudienceTerminalSection
                event={currentEvent}
                totalEarnedNIM={totalEarned}
                nimiqAddress={nimiqAddress}
                deviceId={deviceId}
                isInsideNimiqPay={isInsideNimiqPay}
                nimiqProvider={nimiqProvider}
                onOpenCreatorMenu={isCreator ? handleOpenCreator : undefined}
                onClaimSuccess={handleClaimSuccess}
              />
            </div>
          ) : currentEvent ? (
            <div className="max-w-3xl mx-auto">
              <LiveSessionsSection
                event={currentEvent}
                onTaskComplete={handleTaskComplete}
                earnedPerTask={earnedPerTask}
                onOpenCreatorMenu={isCreator ? handleOpenCreator : undefined}
                onBack={handleGoHome}
                isStarred={starredEventIds.includes(currentEvent.id)}
                onToggleStar={() => handleToggleStar(currentEvent.id)}
                onJoinGiveaway={handleJoinGiveaway}
                giveawayJoined={giveawayJoined}
              />
            </div>
          ) : (
            <StageQrPortal
              events={events}
              starredEventIds={starredEventIds}
              onToggleStar={handleToggleStar}
              onSelectEvent={handleSelectEvent}
              onOpenCreator={handleOpenCreator}
              nimiqAddress={nimiqAddress}
              onConnectWallet={handleConnectWallet}
            />
          )}
        </div>

      </main>

      <FirstRunGuide isOpen={isGuideOpen} onClose={() => { setIsGuideOpen(false); localStorage.setItem('eventquest_guide_seen', 'true') }} />

      {/* WALLET CONNECT / DETAILS MODAL */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        nimiqAddress={nimiqAddress}
        isInsideNimiqPay={isInsideNimiqPay}
        totalEarned={totalEarned}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      {isCreatorModalOpen && (
        <CreatorUtilityModal 
          isOpen={isCreatorModalOpen}
          onClose={() => setIsCreatorModalOpen(false)}
          events={events}
          activeEvent={currentEvent}
          connectedAddress={nimiqAddress}
          defaultCreatorName={creatorName}
          onSelectEvent={handleSelectEvent}
          onCreateEvent={handleCreateEvent}
          onUpdateEvent={handleUpdateEvent}
          onFundPool={handleFundPool}
          onClearAllData={handleClearAllData}
        />
      )}
    </div>
  )
}

export default App
