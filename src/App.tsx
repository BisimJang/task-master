import { useState, useEffect } from 'react'
import { Sparkles, Zap } from 'lucide-react'
import { CreatorUtilityModal } from './components/CreatorUtilityModal'
import { LiveSessionsSection } from './components/LiveSessionsSection'
import { AudienceTerminalSection } from './components/AudienceTerminalSection'
import { CollapsiblePlatformHero } from './components/CollapsiblePlatformHero'
import type { StageEvent, AttendeeClaimRecord } from './lib/types'
import { getEvents, saveEvent, getClaims, saveClaim, hasClaimedTask, clearAllStorage, updateTaskWinnerCount } from './lib/db'
import { initNimiqProvider, type NimiqProviderInstance } from './lib/nimiq'

function App() {
  const [activeTab, setActiveTab] = useState<'stage' | 'terminal'>('stage')
  const [events, setEvents] = useState<StageEvent[]>([])
  const [currentEvent, setCurrentEvent] = useState<StageEvent | null>(null)
  
  // Wallet state
  const [nimiqAddress, setNimiqAddress] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isInsideNimiqPay, setIsInsideNimiqPay] = useState(false)
  const [nimiqProvider, setNimiqProvider] = useState<NimiqProviderInstance | null>(null)

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
      try {
        const provider = await initNimiqProvider()
        setNimiqProvider(provider)
        try {
          if (provider) {
            const accts = await provider.listAccounts()
            if (Array.isArray(accts) && accts.length > 0) {
              const firstAcct = accts[0] as any
              setNimiqAddress(typeof firstAcct === 'string' ? firstAcct : firstAcct.address)
              setIsInsideNimiqPay(true)
            }
          }
        } catch (e) {
          console.warn('Could not list accounts', e)
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

  // Determine if current user is the creator
  const isCreator = !currentEvent || 
    (currentEvent.creatorAddress && nimiqAddress && currentEvent.creatorAddress.toLowerCase() === nimiqAddress.toLowerCase())

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-[#121417] selection:bg-[#FF532F] selection:text-white pb-24 md:pb-0 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-2 border-[#121417] px-4 py-3 flex items-center justify-between shadow-retro-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#121417] flex items-center justify-center border-2 border-white shadow-[0_0_0_2px_#121417]">
            <Zap className="w-4 h-4 text-[#FBD023]" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm tracking-tight uppercase">EventQuest</h1>
            <p className="text-[9px] font-black tracking-widest text-[#121417]/50 uppercase">Nimiq Pay</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#121417] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 border-2 border-transparent hover:border-[#FBD023] transition-colors shadow-retro-sm cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-[#FBD023]" />
            <span className="font-black text-xs">{totalEarned} NIM</span>
          </div>
          {isCreator && (
            <button 
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

      {/* MOBILE TABS */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#121417] px-4 py-3 flex gap-2 shadow-[0_-4px_0_0_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab('stage')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'stage'
              ? 'bg-[#121417] text-white shadow-retro-sm'
              : 'bg-[#F4F4F6] text-[#121417]/60 hover:bg-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Live Stage
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'terminal'
              ? 'bg-[#121417] text-[#00FF41] shadow-retro-sm'
              : 'bg-[#F4F4F6] text-[#121417]/60 hover:bg-neutral-200'
          }`}
        >
          <Zap className="w-4 h-4" /> Claim NIM
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8">
        
        <CollapsiblePlatformHero />

        {currentEvent ? (
          <>
            {/* MOBILE VIEW */}
            <div className="md:hidden">
              {activeTab === 'stage' ? (
                <LiveSessionsSection 
                  event={currentEvent} 
                  onTaskComplete={handleTaskComplete}
                  earnedPerTask={earnedPerTask}
                  onOpenCreatorMenu={isCreator ? () => setIsCreatorModalOpen(true) : undefined}
                />
              ) : (
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
              )}
            </div>

            {/* DESKTOP GRID */}
            <div className="hidden md:grid grid-cols-[1.5fr_1fr] gap-6 items-start">
              <div className="sticky top-24">
                <LiveSessionsSection 
                  event={currentEvent}
                  onTaskComplete={handleTaskComplete}
                  earnedPerTask={earnedPerTask}
                  onOpenCreatorMenu={isCreator ? () => setIsCreatorModalOpen(true) : undefined}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 bg-[#121417] rounded-3xl mb-6 flex items-center justify-center shadow-retro-lg transform rotate-3">
              <Zap className="w-12 h-12 text-[#FBD023]" />
            </div>
            <h2 className="font-display font-black text-4xl tracking-tight text-[#121417] mb-4">Welcome to EventQuest</h2>
            <p className="text-[#121417]/70 font-bold max-w-md mx-auto mb-8">
              Scan a live event QR code or click an event link to join the stage and earn NIM rewards!
            </p>
            <button 
              onClick={() => setIsCreatorModalOpen(true)}
              className="px-6 py-3 bg-white border-2 border-[#121417] rounded-xl font-black text-sm uppercase shadow-retro-sm hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Or Host an Event
            </button>
          </div>
        )}

      </main>

      {isCreatorModalOpen && (
        <CreatorUtilityModal 
          isOpen={isCreatorModalOpen}
          onClose={() => setIsCreatorModalOpen(false)}
          events={events}
          activeEvent={currentEvent}
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
