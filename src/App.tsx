import { useState, useEffect } from 'react'
import { Sparkles, Zap, Mic2, Settings, ArrowLeft, Wallet } from 'lucide-react'
import { CreatorUtilityModal } from './components/CreatorUtilityModal'
import { LiveSessionsSection } from './components/LiveSessionsSection'
import { AudienceTerminalSection } from './components/AudienceTerminalSection'
import { CollapsiblePlatformHero } from './components/CollapsiblePlatformHero'
import { WalletConnectModal } from './components/WalletConnectModal'
import { StageQrPortal } from './components/StageQrPortal'
import type { StageEvent, AttendeeClaimRecord } from './lib/types'
import { getEvents, saveEvent, getClaims, saveClaim, hasClaimedTask, clearAllStorage, updateTaskWinnerCount } from './lib/db'
import { initNimiqProvider, requestNimiqAccount, type NimiqProviderInstance } from './lib/nimiq'

function SettingsPanel({ 
  nimiqAddress, 
  isInsideNimiqPay, 
  totalEarned, 
  claims,
  onConnect,
  onDisconnect,
}: {
  nimiqAddress: string | null
  isInsideNimiqPay: boolean
  totalEarned: number
  claims: AttendeeClaimRecord[]
  onConnect: () => void
  onDisconnect: () => void
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

  // State to track async lookups for claims
  const [earnedPerTask, setEarnedPerTask] = useState<Record<string, boolean>>({})

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
    setClaims([...claims, claimRecord])
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

  const handleFundPool = (amount: number) => {
    if (!currentEvent) return
    console.log('Funding pool via Nimiq Pay:', amount)
    alert(`Triggering Nimiq Pay transaction for ${amount} NIM to fund the pool...`)
    
    // Simulate updating pool
    const updatedEvent = {
      ...currentEvent,
      totalPoolNIM: currentEvent.totalPoolNIM + amount
    }
    handleUpdateEvent(updatedEvent)
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

  // Determine if current user is the creator
  const isCreator = !currentEvent || 
    (currentEvent.creatorAddress && nimiqAddress && currentEvent.creatorAddress.toLowerCase() === nimiqAddress.toLowerCase())

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-[#121417] selection:bg-[#FF532F] selection:text-white pb-24 md:pb-0 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-2 border-[#121417] px-4 py-3 flex items-center justify-between shadow-retro-sm">
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome} title="Go to Home">
            <div className="w-8 h-8 rounded-full bg-[#121417] flex items-center justify-center border-2 border-white shadow-[0_0_0_2px_#121417]">
              <Zap className="w-4 h-4 text-[#FBD023]" />
            </div>
            <div>
              <h1 className="font-display font-black text-sm tracking-tight uppercase">EventQuest</h1>
              <p className="text-[9px] font-black tracking-widest text-[#121417]/50 uppercase">Nimiq Pay</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {nimiqAddress ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex bg-white text-[#121417] px-3 py-1.5 rounded-full items-center gap-1.5 shadow-retro-xs border-2 border-[#121417] cursor-pointer hover:bg-neutral-50"
              title="Wallet Details"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] font-bold">{nimiqAddress.slice(0, 9)}...{nimiqAddress.slice(-4)}</span>
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="flex items-center gap-1.5 bg-[#FBD023] hover:bg-[#ebd52a] text-[#121417] px-3 py-1.5 rounded-full border-2 border-[#121417] font-black text-xs uppercase tracking-wider shadow-retro-xs hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
          <div 
            onClick={() => setActiveTab('terminal')}
            className="bg-[#121417] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 border-2 border-transparent hover:border-[#FBD023] transition-colors shadow-retro-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBD023]" />
            <span className="font-black text-xs">{totalEarned} NIM</span>
          </div>
          {isCreator && (
            <button 
              data-open-creator
              onClick={() => setIsCreatorModalOpen(true)}
              className="w-8 h-8 rounded-full bg-white border-2 border-[#121417] flex items-center justify-center hover:bg-neutral-100 shadow-retro-sm transition-all"
            >
              <div className="w-1 h-1 rounded-full bg-[#121417] space-x-1 flex gap-0.5">
                <span className="w-1 h-1 bg-[#121417] rounded-full"></span>
                <span className="w-1 h-1 bg-[#121417] rounded-full"></span>
              </div>
            </button>
          )}
        </div>
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

          {/* Create */}
          <button
            onClick={() => setIsCreatorModalOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all text-[#121417]/40 relative"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#121417] flex items-center justify-center shadow-retro-sm -mt-6 border-2 border-white">
              <Mic2 className="w-5 h-5 text-[#FBD023]" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Create</span>
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

      {/* MAIN CONTENT */}
      <main className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
        
        <CollapsiblePlatformHero />
        <button data-open-creator className="hidden" onClick={() => setIsCreatorModalOpen(true)} />

        {/* MOBILE VIEW (always switches based on activeTab) */}
        <div className="md:hidden">
          {activeTab === 'stage' ? (
            currentEvent ? (
              <LiveSessionsSection 
                event={currentEvent} 
                onTaskComplete={handleTaskComplete}
                earnedPerTask={earnedPerTask}
                onOpenCreatorMenu={isCreator ? () => setIsCreatorModalOpen(true) : undefined}
                onBack={handleGoHome}
                isStarred={starredEventIds.includes(currentEvent.id)}
                onToggleStar={() => handleToggleStar(currentEvent.id)}
              />
            ) : (
              <StageQrPortal
                events={events}
                starredEventIds={starredEventIds}
                onToggleStar={handleToggleStar}
                onSelectEvent={handleSelectEvent}
                onOpenCreator={() => setIsCreatorModalOpen(true)}
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
              onOpenCreatorMenu={isCreator ? () => setIsCreatorModalOpen(true) : undefined}
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
            />
          )}
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:block">
          {currentEvent ? (
            <div className="grid grid-cols-[1.5fr_1fr] gap-6 items-start">
              <div className="sticky top-24">
                <LiveSessionsSection 
                  event={currentEvent} 
                  onTaskComplete={handleTaskComplete}
                  earnedPerTask={earnedPerTask}
                  onOpenCreatorMenu={isCreator ? () => setIsCreatorModalOpen(true) : undefined}
                  onBack={handleGoHome}
                  isStarred={starredEventIds.includes(currentEvent.id)}
                  onToggleStar={() => handleToggleStar(currentEvent.id)}
                />
              </div>
              <div className="sticky top-24">
                <AudienceTerminalSection 
                  event={currentEvent}
                  totalEarnedNIM={totalEarned}
                  nimiqAddress={nimiqAddress}
                  deviceId={deviceId}
                  isInsideNimiqPay={isInsideNimiqPay}
                  nimiqProvider={nimiqProvider}
                  onOpenCreatorMenu={isCreator ? () => setIsCreatorModalOpen(true) : undefined}
                  onClaimSuccess={handleClaimSuccess}
                />
              </div>
            </div>
          ) : (
            <StageQrPortal
              events={events}
              starredEventIds={starredEventIds}
              onToggleStar={handleToggleStar}
              onSelectEvent={handleSelectEvent}
              onOpenCreator={() => setIsCreatorModalOpen(true)}
              nimiqAddress={nimiqAddress}
              onConnectWallet={handleConnectWallet}
            />
          )}
        </div>

      </main>

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
