import React, { useState, useEffect } from 'react'
import {
  X, Zap, FolderPlus, Trash2, CheckCircle2, Copy, Plus, Info, Upload
} from 'lucide-react'
import type { StageEvent, SessionTask, PayoutRecord, GiveawayEntry } from '../lib/types'
// @ts-ignore
import { QRCodeSVG } from 'qrcode.react'
import { updateClaimTxHash, getPendingPayouts, getPayouts, getGiveawayEntries, updatePayout } from '../lib/db'
import { claimNimiqReward, initNimiqProvider } from '../lib/nimiq'

interface CreatorUtilityModalProps {
  isOpen: boolean
  onClose: () => void
  events?: StageEvent[]
  activeEvent: StageEvent | null
  connectedAddress?: string | null
  defaultCreatorName?: string
  onSelectEvent: (event: StageEvent) => void
  onCreateEvent: (newEvent: StageEvent) => void
  onUpdateEvent: (updatedEvent: StageEvent) => void
  onFundPool: (amountNIM: number) => Promise<{ success: boolean; message: string }>
  onClearAllData?: () => void
}

export const CreatorUtilityModal: React.FC<CreatorUtilityModalProps> = ({
  isOpen, onClose, events: _events, activeEvent, connectedAddress, defaultCreatorName = '', onSelectEvent, onCreateEvent, onUpdateEvent, onFundPool, onClearAllData
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [viewMode, setViewMode] = useState<'wizard' | 'manage' | 'dashboard'>(activeEvent ? 'manage' : (_events && _events.length > 0 ? 'dashboard' : 'wizard'))

  // ... (keep rest of state exactly as before)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDesc, setDraftDesc] = useState('')
  const [draftOrg, setDraftOrg] = useState(defaultCreatorName)

  useEffect(() => {
    if (isOpen && defaultCreatorName && !draftOrg) setDraftOrg(defaultCreatorName)
  }, [isOpen, defaultCreatorName, draftOrg])
  const [draftPool, setDraftPool] = useState('')
  const [draftMode, setDraftMode] = useState<'quiz' | 'giveaway'>('quiz')
  const [draftGiveawayLimit, setDraftGiveawayLimit] = useState('')
  const [draftTasks, setDraftTasks] = useState<SessionTask[]>([])

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskRewardNIM, setTaskRewardNIM] = useState('')
  const [taskMaxWinners, setTaskMaxWinners] = useState('1')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [correctOptIndex, setCorrectOptIndex] = useState(0)
  
  const [importMode, setImportMode] = useState<'single' | 'bulk'>('single')
  const [csvData, setCsvData] = useState('')
  const [bulkPreview, setBulkPreview] = useState<SessionTask[]>([])
  const [bulkSkipped, setBulkSkipped] = useState(0)
  const [showPromptInfo, setShowPromptInfo] = useState(false)
  const [bulkError, setBulkError] = useState('')

  const [fundAmount, setFundAmount] = useState('')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  const [isAddingTaskPostPublish, setIsAddingTaskPostPublish] = useState(false)

  // QR display state
  const [showQrFor, setShowQrFor] = useState<string | null>(null)

  const [isAirdropping, setIsAirdropping] = useState(false)
  const [airdropMsg, setAirdropMsg] = useState('')
  const [fundMsg, setFundMsg] = useState('')
  const [manageTab, setManageTab] = useState<'quizzes' | 'share' | 'payouts'>('quizzes')
  const [payouts, setPayouts] = useState<PayoutRecord[]>([])
  const [payoutsLoading, setPayoutsLoading] = useState(false)
  const [payoutsError, setPayoutsError] = useState('')
  const [giveawayEntries, setGiveawayEntries] = useState<GiveawayEntry[]>([])

  useEffect(() => {
    if (!isOpen) return
    if (activeEvent) {
      setViewMode('manage')
    } else {
      setViewMode(_events && _events.length > 0 ? 'dashboard' : 'wizard')
      setStep(1)
    }
  }, [isOpen, activeEvent, _events])

  useEffect(() => {
    if (!isOpen || manageTab !== 'payouts' || !activeEvent) return
    setPayoutsLoading(true)
    setPayoutsError('')
    getPayouts(activeEvent.id)
      .then(setPayouts)
      .catch(error => setPayoutsError(error instanceof Error ? error.message : 'Could not load completed quizzes.'))
      .finally(() => setPayoutsLoading(false))
  }, [isOpen, manageTab, activeEvent])

  useEffect(() => {
    if (!isOpen || manageTab !== 'payouts' || !activeEvent || activeEvent.mode !== 'giveaway') return
    getGiveawayEntries(activeEvent.id).then(setGiveawayEntries).catch(() => setGiveawayEntries([]))
  }, [isOpen, manageTab, activeEvent])

  if (!isOpen) return null

  const getUsedPool = (tasks: SessionTask[]) => tasks.reduce((sum, t) => sum + (t.rewardNIM * t.maxWinners), 0)
  
  const currentPool = viewMode === 'manage' && activeEvent ? activeEvent.totalPoolNIM : Number(draftPool) || 0
  const currentTasks = viewMode === 'manage' && activeEvent ? activeEvent.tasks : draftTasks
  const usedPool = getUsedPool(currentTasks)
  const remainingPool = currentPool - usedPool

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleToggleLock = (taskId: string) => {
    if (!activeEvent) return
    const newTasks = activeEvent.tasks.map(t => t.id === taskId ? { ...t, isLocked: !t.isLocked } : t)
    onUpdateEvent({ ...activeEvent, tasks: newTasks })
  }

  const shuffleOptions = (options: string[], correctIndex: number) => {
    const pairs = options.map((text, index) => ({ text, correct: index === correctIndex }))
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
    }
    return { options: pairs.map(pair => pair.text), correctIndex: pairs.findIndex(pair => pair.correct) }
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (importMode === 'bulk') {
      handleBulkCSVImport()
      return
    }

    if (!taskTitle.trim() || !taskRewardNIM) return
    if (!optionA.trim() || !optionB.trim()) return

    const reward = Number(taskRewardNIM)
    const winners = Number(taskMaxWinners) || 1
    const cost = reward * winners

    if (cost > remainingPool) {
      alert(`Insufficient pool! Task costs ${cost} NIM, but only ${remainingPool} NIM remains. Please fund the pool.`)
      return
    }

    const newTask: SessionTask = {
      id: 'task-' + Date.now(),
      type: 'quiz',
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      rewardNIM: reward,
      maxWinners: winners,
      winnerCount: 0,
      isLocked: false,
      ...(() => {
        const shuffled = shuffleOptions([optionA.trim(), optionB.trim(), ...(optionC.trim() ? [optionC.trim()] : [])], correctOptIndex)
        return { options: shuffled.options, correctIndex: shuffled.correctIndex }
      })(),
    }

    if (viewMode === 'manage' && activeEvent) {
      onUpdateEvent({
        ...activeEvent,
        tasks: [...activeEvent.tasks, newTask]
      })
      setIsAddingTaskPostPublish(false)
    } else {
      setDraftTasks([...draftTasks, newTask])
    }
    
    setTaskTitle(''); setTaskDescription(''); setTaskRewardNIM(''); setTaskMaxWinners('1')
    setOptionA(''); setOptionB(''); setOptionC(''); setCorrectOptIndex(0)
  }

  const handleBulkCSVImport = () => {
    setBulkError('')
    setBulkPreview([])
    setBulkSkipped(0)
    if (!csvData.trim()) {
      setBulkError('Paste CSV rows or choose a CSV file first.')
      return
    }
    const rows = csvData.trim().split(/\r?\n/).map(line => {
      const values: string[] = []
      let value = ''
      let quoted = false
      for (const char of line) {
        if (char === '"') quoted = !quoted
        else if (char === ',' && !quoted) {
          values.push(value.trim())
          value = ''
        } else value += char
      }
      values.push(value.trim())
      return values.map(item => item.replace(/^"|"$/g, '').trim())
    })
    const first = rows[0]?.map(value => value.toLowerCase()) || []
    const start = first.some(value => value.includes('question') || value.includes('correct')) ? 1 : 0
    const newTasks: SessionTask[] = []
    let skipped = 0
    rows.slice(start).forEach((parts, index) => {
      if (parts.length < 6 || !parts[0] || !parts[1] || !parts[2]) {
        skipped++
        return
      }
      const correctValue = parts[4].toUpperCase()
      const correctIdx = ['A', 'B', 'C'].indexOf(correctValue) >= 0
        ? ['A', 'B', 'C'].indexOf(correctValue)
        : Number(parts[4])
      const reward = Number(parts[5])
      const winners = Number(parts[6] || 1)
      if (!Number.isFinite(reward) || reward <= 0 || !Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx > 2 || !Number.isInteger(winners) || winners < 1) {
        skipped++
        return
      }
      newTasks.push({
        id: `task-${Date.now()}-${index}`,
        type: 'quiz',
        title: parts[0],
        description: '',
        rewardNIM: reward,
        maxWinners: winners,
        winnerCount: 0,
        isLocked: false,
        ...(() => {
          const shuffled = shuffleOptions([parts[1], parts[2], parts[3]].filter(Boolean), correctIdx)
          return { options: shuffled.options, correctIndex: shuffled.correctIndex }
        })(),
      })
    })
    const totalCost = newTasks.reduce((sum, task) => sum + task.rewardNIM * task.maxWinners, 0)
    if (!newTasks.length) {
      setBulkError('No valid rows found. Check the format below.')
      return
    }
    if (totalCost > remainingPool) {
      setBulkError(`These questions require ${totalCost} NIM, but only ${remainingPool} NIM remains.`)
      setBulkPreview(newTasks)
      setBulkSkipped(skipped)
      return
    }
    setBulkPreview(newTasks)
    setBulkSkipped(skipped)
  }

  const confirmBulkImport = () => {
    if (!bulkPreview.length) return
    if (viewMode === 'manage' && activeEvent) {
      onUpdateEvent({
        ...activeEvent,
        tasks: [...activeEvent.tasks, ...bulkPreview]
      })
      setIsAddingTaskPostPublish(false)
    } else {
      setDraftTasks([...draftTasks, ...bulkPreview])
    }
    setCsvData('')
    setBulkPreview([])
    setBulkSkipped(0)
    setImportMode('single')
  }

  const handleCsvFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCsvData(String(reader.result || ''))
      setBulkError('')
      setBulkPreview([])
    }
    reader.onerror = () => setBulkError('Could not read that file. Try pasting the CSV instead.')
    reader.readAsText(file)
  }

  const handlePublish = () => {
    if (!connectedAddress) {
      alert('You must be signed in with a Nimiq wallet before you can create an event.')
      return
    }
    if (!draftTitle.trim()) return
    const slug = draftTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const newEvent: StageEvent = {
      id: 'evt-' + Date.now(),
      slug: slug || 'event-' + Date.now(),
      title: draftTitle.trim(),
      description: draftDesc.trim(),
      organizer: (draftOrg.trim() || defaultCreatorName.trim()),
      totalPoolNIM: Number(draftPool) || 0,
      tasks: draftTasks,
      mode: draftMode,
      giveawayLimit: draftMode === 'giveaway' && draftGiveawayLimit ? Number(draftGiveawayLimit) : undefined,
      published: true,
      creatorAddress: connectedAddress
    }
    
    onCreateEvent(newEvent)
    setDraftTitle(''); setDraftDesc(''); setDraftOrg(''); setDraftPool(''); setDraftTasks([]); setDraftMode('quiz'); setDraftGiveawayLimit('')
    setStep(1)
    onSelectEvent(newEvent)
    setViewMode('manage')
  }

  const handleAirdrop = async () => {
    if (!activeEvent) return
    setIsAirdropping(true)
    setAirdropMsg('Fetching pending winners...')

    try {
      const pendingPayouts = await getPendingPayouts(activeEvent.id)
      const eligiblePayouts = pendingPayouts.filter(p => p.recipientAddress !== 'unlinked')

      if (eligiblePayouts.length === 0) {
        setAirdropMsg('No pending winners found!')
        setTimeout(() => setAirdropMsg(''), 3000)
        setIsAirdropping(false)
        return
      }

      setAirdropMsg(`Airdropping to ${eligiblePayouts.length} winners...`)
      const provider = await initNimiqProvider()
      if (!provider) {
        throw new Error('Open EventQuest in Nimiq Pay to approve payout transactions.')
      }

      let successCount = 0
      let failureCount = 0
      for (const payout of eligiblePayouts) {
        try {
          await updatePayout(payout.id, 'submitted')
          const tx = await claimNimiqReward(provider, payout.recipientAddress, payout.amountLuna / 100000)
          if (tx) {
            await updatePayout(payout.id, 'submitted', { txHash: tx })
            await updateClaimTxHash(payout.claimId, tx)
            successCount++
          } else {
            await updatePayout(payout.id, 'failed', { failureMessage: 'No transaction hash returned.' })
            failureCount++
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Transaction failed.'
          await updatePayout(payout.id, 'failed', { failureMessage: message })
          console.error('Failed to airdrop payout', payout.id, e)
          failureCount++
        }
      }

      setAirdropMsg(
        failureCount > 0
          ? `${successCount} submitted. ${failureCount} still pending and safe to retry.`
          : `Successfully submitted ${successCount} payout${successCount === 1 ? '' : 's'}!`
      )
      setTimeout(() => setAirdropMsg(''), 4000)
    } catch (err) {
      console.error(err)
      setAirdropMsg(err instanceof Error ? err.message : 'Airdrop could not start. No payouts were marked complete.')
      setTimeout(() => setAirdropMsg(''), 3000)
    }

    setIsAirdropping(false)
  }

  const inputCls = 'w-full text-xs font-bold p-2.5 rounded-xl border-2 border-[#121417] bg-[#F4F4F6]'
  const softInputCls = 'w-full text-xs p-2.5 rounded-xl border border-neutral-300'
  const labelCls = 'block text-[11px] font-bold text-[#121417]/80 mb-1'
  
  const getShareLink = (event: StageEvent, taskId?: string) => {
    const base = window.location.origin + window.location.pathname
    if (taskId) return `${base}?event=${event.slug}&task=${taskId}`
    return `${base}?event=${event.slug}`
  }

  const renderTaskForm = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#F4F4F6] p-3 rounded-xl border border-neutral-200">
        <span className="text-[11px] font-black uppercase text-[#121417]/60">Pool Remaining</span>
        <span className={`font-black text-sm ${remainingPool > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {remainingPool} NIM
        </span>
      </div>

      <div className="flex bg-[#F4F4F6] p-1 rounded-xl">
        <button type="button" onClick={() => setImportMode('single')} className={`flex-1 text-xs font-black py-2 rounded-lg ${importMode === 'single' ? 'bg-white shadow-sm' : 'text-[#121417]/50 hover:text-[#121417]'}`}>Single Task</button>
        <button type="button" onClick={() => setImportMode('bulk')} className={`flex-1 text-xs font-black py-2 rounded-lg flex items-center justify-center gap-1 ${importMode === 'bulk' ? 'bg-white shadow-sm' : 'text-[#121417]/50 hover:text-[#121417]'}`}>
          <Upload className="w-3.5 h-3.5" /> Bulk CSV
        </button>
      </div>

      <form onSubmit={handleAddTask} className="space-y-3 p-4 bg-white rounded-2xl border-2 border-[#121417]">
        {importMode === 'single' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelCls}>Quiz Question:</label><input required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className={softInputCls} /></div>
              <div><label className={labelCls}>NIM Reward:</label><input type="number" required min="1" value={taskRewardNIM} onChange={e => setTaskRewardNIM(e.target.value)} className={softInputCls} /></div>
            </div>
            
            <div>
              <label className={labelCls}>Winner Slots (Competition Mode):</label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" required value={taskMaxWinners} onChange={e => setTaskMaxWinners(e.target.value)} className={`w-24 ${softInputCls}`} />
                <span className="text-[10px] text-[#121417]/60">1 = First person wins. 5 = First 5 people win.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div><label className={labelCls}>Option A:</label><input required value={optionA} onChange={e => setOptionA(e.target.value)} className={softInputCls} /></div>
              <div><label className={labelCls}>Option B:</label><input required value={optionB} onChange={e => setOptionB(e.target.value)} className={softInputCls} /></div>
            </div>
            <div><label className={labelCls}>Option C (Optional):</label><input value={optionC} onChange={e => setOptionC(e.target.value)} className={softInputCls} /></div>
            <div><label className={labelCls}>Correct answer:</label><select value={correctOptIndex} onChange={e => setCorrectOptIndex(Number(e.target.value))} className={softInputCls}><option value={0}>Option A</option><option value={1}>Option B</option><option value={2} disabled={!optionC.trim()}>Option C</option></select><p className="text-[10px] text-[#121417]/50 mt-1">Options are shuffled automatically when saved.</p></div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Import questions:</label>
              <button type="button" onClick={() => setShowPromptInfo(true)} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100">
                <Info className="w-3 h-3" /> AI Prompt Help
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl border-2 border-dashed border-[#121417]/30 text-center text-xs font-black hover:border-[#121417]">
                <Upload className="w-3.5 h-3.5 inline mr-1.5" /> Choose CSV file
                <input type="file" accept=".csv,text/csv" onChange={handleCsvFile} className="sr-only" />
              </label>
              <span className="self-center text-[10px] font-bold text-[#121417]/50">or paste below</span>
            </div>
            {bulkError && <div className="text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded">{bulkError}</div>}
            <textarea
              rows={5}
              placeholder="Question, Option A, Option B, Option C, Correct Answer, Reward NIM, Winner Slots&#10;&quot;What is 2+2?&quot;, 3, 4, 5, B, 10, 1"
              value={csvData}
              onChange={e => setCsvData(e.target.value)}
              className={`${softInputCls} font-mono text-[10px]`}
            />
            <p className="text-[10px] text-[#121417]/50">Columns: Question, Option A, Option B, Option C, Correct Answer (A/B/C), Reward NIM, Winner Slots. A header row is optional.</p>
            <button type="button" onClick={handleBulkCSVImport} className="w-full py-2.5 rounded-xl bg-[#121417] text-white font-black text-xs uppercase">
              Preview questions
            </button>
            {bulkPreview.length > 0 && (
              <div className="space-y-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-emerald-900">{bulkPreview.length} questions ready</p>
                  <p className="text-xs font-black text-emerald-800">
                    {getUsedPool(bulkPreview)} NIM possible payout
                  </p>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {bulkPreview.map((task, index) => (
                    <div key={task.id} className="text-[10px] font-bold text-emerald-900 flex justify-between gap-2">
                      <span className="truncate">{index + 1}. {task.title}</span>
                      <span className="shrink-0">{task.rewardNIM} NIM × {task.maxWinners}</span>
                    </div>
                  ))}
                </div>
                {bulkSkipped > 0 && <p className="text-[10px] font-bold text-amber-700">{bulkSkipped} row(s) skipped because they were incomplete or invalid.</p>}
                <button
                  type="button"
                  onClick={confirmBulkImport}
                  disabled={getUsedPool(bulkPreview) > remainingPool}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-black text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getUsedPool(bulkPreview) > remainingPool ? 'Increase payout budget to import' : `Import ${bulkPreview.length} questions`}
                </button>
              </div>
            )}
          </div>
        )}

        {importMode === 'single' && (
          <button type="submit" className="w-full py-2.5 rounded-xl bg-[#121417] text-white font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-black">
            <Plus className="w-4 h-4" /> Add Quiz to Event
          </button>
        )}
        
        {viewMode === 'manage' && (
          <button type="button" onClick={() => setIsAddingTaskPostPublish(false)} className="w-full py-2 mt-2 rounded-xl text-xs font-bold text-[#121417]/60 hover:bg-neutral-100">Cancel</button>
        )}
      </form>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white border-t-3 sm:border-3 border-[#121417] rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-retro-lg text-[#121417] max-h-[96vh] sm:max-h-[92vh] flex flex-col">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-2 sm:hidden shrink-0" />

        {/* Sticky Header */}
        <div className="shrink-0 pb-3 border-b border-neutral-100 relative">
          <button onClick={onClose} className="absolute top-0 right-0 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 flex items-center justify-center cursor-pointer transition-colors">
            <X className="w-4 h-4 text-[#121417]" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF532F]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF532F]">Creator Hub</span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight text-[#121417]">
            {viewMode === 'wizard' ? 'Create Event' : viewMode === 'dashboard' ? 'Event Dashboard' : 'Manage Event'}
          </h2>

          {activeEvent && viewMode === 'manage' && (
            <div className="mt-3 flex gap-2">
              <button onClick={() => { setViewMode('dashboard'); }} className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-[#121417] flex items-center gap-1.5 cursor-pointer">
                <FolderPlus className="w-3.5 h-3.5" /><span>Event Dashboard</span>
              </button>
              {onClearAllData && (
                 <button onClick={() => { if(confirm('Wipe everything?')) onClearAllData() }} className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5 cursor-pointer">
                   <Trash2 className="w-3.5 h-3.5" /><span>Reset Data</span>
                 </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 mt-3 space-y-4 overscroll-contain">

        {/* --- DASHBOARD MODE --- */}
        {viewMode === 'dashboard' && (
          <div className="mt-6 space-y-4 animate-in fade-in">
            {(() => {
              const myEvents = (_events || []).filter(ev => {
                if (!connectedAddress) return true
                if (!ev.creatorAddress || ev.creatorAddress === 'unlinked') return true
                return ev.creatorAddress.toLowerCase() === connectedAddress.toLowerCase()
              })
              return myEvents.length > 0 ? (
                <div className="space-y-3">
                  {myEvents.map(ev => (
                    <button 
                      key={ev.id}
                      onClick={() => { onSelectEvent(ev); setViewMode('manage'); }}
                      className="w-full text-left p-4 rounded-2xl border-2 border-neutral-200 hover:border-[#121417] bg-[#F4F4F6] transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-black text-[#121417] text-sm">{ev.title}</p>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">{ev.totalPoolNIM} NIM</span>
                      </div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{ev.tasks.length} Quizzes</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-[#F4F4F6]">
                  <p className="text-xs text-[#121417]/40 font-black uppercase tracking-widest">No events created by your wallet yet</p>
                </div>
              )
            })()}
            <button 
              onClick={() => { setViewMode('wizard'); setStep(1); }} 
              className="w-full py-4 mt-2 rounded-2xl bg-[#121417] text-white font-black text-xs uppercase shadow-retro-sm hover:bg-black flex justify-center items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" /> Create New Event
            </button>
          </div>
        )}

        {/* --- CREATION WIZARD --- */}
        {viewMode === 'wizard' && (
          <div className="mt-6 space-y-6">
            {/* ... (Keep Wizard Steps 1-4 identical) */}
            <div className="flex items-center justify-between px-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`flex flex-col items-center gap-1 ${step >= s ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === s ? 'bg-[#121417] text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-[#121417]'}`}>
                    {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                  </div>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-display font-black text-base border-b pb-2">1. Event Details</h3>
                <div><label className={labelCls}>Event Name:</label><input type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Creator name:</label><input type="text" value={draftOrg} onChange={e => setDraftOrg(e.target.value)} className={softInputCls} /></div>
                <div><label className={labelCls}>Description:</label><textarea rows={2} value={draftDesc} onChange={e => setDraftDesc(e.target.value)} className={`${softInputCls} resize-none`} /></div>
                <div className="p-3 bg-[#F4F4F6] rounded-xl space-y-2">
                  <label className="text-[11px] font-black uppercase">Format</label>
                  <select value={draftMode} onChange={e => setDraftMode(e.target.value as 'quiz' | 'giveaway')} className={softInputCls}>
                    <option value="quiz">Quiz race</option>
                    <option value="giveaway">Wallet giveaway link</option>
                  </select>
                  {draftMode === 'giveaway' && <><p className="text-[10px] text-[#121417]/60">Attendees open a link, connect their Nimiq wallet, and join. You choose winners from the entry list.</p><input type="number" min="1" placeholder="Optional entry limit" value={draftGiveawayLimit} onChange={e => setDraftGiveawayLimit(e.target.value)} className={softInputCls} /></>}
                </div>
                {draftMode === 'giveaway' ? <button onClick={handlePublish} disabled={!draftTitle.trim() || !draftPool} className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-black text-xs uppercase disabled:opacity-50 mt-4">Publish Giveaway Link</button> : <button onClick={() => draftTitle.trim() && setStep(2)} disabled={!draftTitle.trim()} className="w-full py-3.5 rounded-full bg-[#121417] text-white font-black text-xs uppercase disabled:opacity-50 mt-4">Next: Set Prize Pool</button>}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-display font-black text-base border-b pb-2">2. Prize Pool</h3>
                <div className="p-3 bg-amber-50 border-2 border-[#FBD023] rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5 text-[#121417]/60" />
                    <label className="text-[11px] font-black text-[#121417] uppercase tracking-wider">Total Pool (NIM)</label>
                  </div>
                  <input type="number" min="0" value={draftPool} onChange={e => setDraftPool(e.target.value)} className="w-full text-sm font-black p-2.5 rounded-xl border-2 border-[#121417] bg-white" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(1)} className="px-4 py-3.5 rounded-full border-2 border-[#121417] font-black text-xs uppercase">Back</button>
                  <button onClick={() => draftPool && setStep(3)} disabled={!draftPool} className="flex-1 py-3.5 rounded-full bg-[#121417] text-white font-black text-xs uppercase disabled:opacity-50">Next: Add Tasks</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-display font-black text-base">3. Add Quizzes ({draftTasks.length} added)</h3>
                  <button onClick={() => setStep(4)} className="text-xs font-black text-emerald-600 hover:underline">Review & Publish →</button>
                </div>
                
                {renderTaskForm()}

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(2)} className="px-4 py-3.5 rounded-full border-2 border-[#121417] font-black text-xs uppercase">Back</button>
                  <button onClick={() => setStep(4)} disabled={draftTasks.length === 0} className="flex-1 py-3.5 rounded-full bg-[#121417] text-white font-black text-xs uppercase disabled:opacity-50">Review & Publish</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display font-black text-base border-b pb-2">4. Review & Publish</h3>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <p className="text-xs font-bold">Event: {draftTitle}</p>
                  <p className="text-xs font-bold">Pool: {draftPool} NIM</p>
                  <p className="text-xs font-bold">Quizzes: {draftTasks.length}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(3)} className="px-4 py-3.5 rounded-full border-2 border-[#121417] font-black text-xs uppercase">Back</button>
                  <button onClick={handlePublish} className="flex-1 py-3.5 rounded-full bg-emerald-600 text-white font-black text-xs uppercase hover:bg-emerald-700 shadow-retro-sm">Publish Event</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- MANAGE EVENT (PUBLISHED) --- */}
        {viewMode === 'manage' && activeEvent && (
          <div className="mt-4 space-y-4 animate-in fade-in">
            {/* Header summary */}
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Published Event</p>
                <h3 className="font-display font-black text-base sm:text-lg text-[#121417] leading-tight">{activeEvent.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#121417]/60 uppercase">Prize Pool</p>
                <p className="font-black text-emerald-700 text-sm sm:text-base">{activeEvent.totalPoolNIM} NIM</p>
              </div>
            </div>

            {/* Sub-tabs for Mobile UX */}
            <div className="flex bg-[#F4F4F6] p-1 rounded-2xl border border-neutral-200">
              <button
                type="button"
                onClick={() => setManageTab('quizzes')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  manageTab === 'quizzes' ? 'bg-[#121417] text-white shadow-retro-sm' : 'text-[#121417]/60 hover:text-[#121417]'
                }`}
              >
                Quizzes ({activeEvent.tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setManageTab('share')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  manageTab === 'share' ? 'bg-[#121417] text-white shadow-retro-sm' : 'text-[#121417]/60 hover:text-[#121417]'
                }`}
              >
                Share & QR
              </button>
              <button
                type="button"
                onClick={() => setManageTab('payouts')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  manageTab === 'payouts' ? 'bg-[#121417] text-white shadow-retro-sm' : 'text-[#121417]/60 hover:text-[#121417]'
                }`}
              >
                Wallets & Payouts
              </button>
            </div>

            {/* TAB 1: QUIZZES */}
            {manageTab === 'quizzes' && (
              <div className="space-y-3 animate-in fade-in">
                {isAddingTaskPostPublish ? (
                  <div className="pt-2">
                    <h4 className="font-black text-sm text-[#121417] mb-2">Add New Quiz</h4>
                    {renderTaskForm()}
                  </div>
                ) : (
                  <button onClick={() => setIsAddingTaskPostPublish(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-[#121417]/30 text-[#121417]/70 font-black text-xs uppercase hover:border-[#121417] hover:text-[#121417] transition-all flex items-center justify-center gap-1.5 bg-[#F4F4F6]">
                    <Plus className="w-4 h-4" /> Add Quiz to Event
                  </button>
                )}

                <div className="space-y-2 pt-2">
                  {activeEvent.tasks.map((task, i) => (
                    <div key={task.id} className="p-3 bg-[#F4F4F6] rounded-xl flex items-center justify-between gap-2 border border-neutral-200">
                      <div className="truncate flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-[#121417]/60 uppercase">Quiz {i+1}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#121417] text-white">
                            {task.rewardNIM} NIM
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700">
                            {task.winnerCount}/{task.maxWinners} Claimed
                          </span>
                        </div>
                        <p className="text-xs font-black truncate">{task.title}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleToggleLock(task.id)} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border shrink-0 transition-all ${task.isLocked ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                      >
                        {task.isLocked ? 'Unlock' : 'Lock'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: SHARE & QR */}
            {manageTab === 'share' && (
              <div className="space-y-3 animate-in fade-in">
                <div className="p-3 bg-[#F4F4F6] rounded-xl flex items-center justify-between gap-3 border border-neutral-200">
                  <div className="truncate">
                    <p className="text-[10px] font-bold text-[#121417]/60 uppercase">Full Event Link</p>
                    <p className="text-xs font-mono truncate">{getShareLink(activeEvent)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setShowQrFor(showQrFor === 'event' ? null : 'event')} className="text-[10px] font-black text-[#121417] bg-white border px-2 py-1 rounded-lg hover:bg-neutral-100">
                      {showQrFor === 'event' ? 'Hide QR' : 'Show QR'}
                    </button>
                    <button onClick={() => handleCopy(getShareLink(activeEvent))} className="p-2 bg-white rounded-lg border shadow-xs">
                      {copiedLink === getShareLink(activeEvent) ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {showQrFor === 'event' && (
                  <div className="p-4 bg-white rounded-2xl border-2 border-[#121417] flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in-95 shadow-retro-sm">
                    <QRCodeSVG value={getShareLink(activeEvent)} size={190} />
                    <p className="text-[10px] font-black text-[#121417]/60 uppercase tracking-widest mt-1">Scan to Join Live Event</p>
                  </div>
                )}

                <h5 className="font-black text-xs text-[#121417]/80 uppercase tracking-wider pt-2">Direct Quiz Links & QR</h5>
                <div className="space-y-2">
                  {activeEvent.tasks.map((task, i) => {
                    const link = getShareLink(activeEvent, task.id)
                    return (
                      <div key={task.id} className="space-y-2">
                        <div className="p-2.5 bg-[#F4F4F6] rounded-xl flex items-center justify-between gap-2 border border-neutral-200">
                          <div className="truncate flex-1">
                            <span className="text-[9px] font-bold text-[#121417]/60 uppercase">Quiz {i+1}</span>
                            <p className="text-xs font-bold truncate">{task.title}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => setShowQrFor(showQrFor === task.id ? null : task.id)} className="text-[10px] font-black text-[#121417] bg-white border px-2 py-1 rounded hover:bg-neutral-100">
                              {showQrFor === task.id ? 'Hide' : 'QR'}
                            </button>
                            <button onClick={() => handleCopy(link)} className="p-1.5 bg-white rounded border shadow-xs">
                              {copiedLink === link ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        {showQrFor === task.id && (
                          <div className="p-3 bg-white rounded-xl border flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95">
                            <QRCodeSVG value={link} size={140} />
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{task.title}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PAYOUTS & FUND */}
            {manageTab === 'payouts' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-white border-2 border-[#121417] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-[#121417]">Completed quizzes</h4>
                      <p className="text-[10px] font-bold text-[#121417]/60">Wallets that earned a reward in this event.</p>
                    </div>
                    <span className="text-xs font-black bg-[#F4F4F6] px-2 py-1 rounded-full">{payouts.length}</span>
                  </div>
                  {payoutsLoading && <p className="text-xs font-bold text-[#121417]/60">Loading winners...</p>}
                  {payoutsError && <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">{payoutsError}</p>}
                  {!payoutsLoading && !payoutsError && payouts.length === 0 && <p className="text-xs font-bold text-[#121417]/60 bg-[#F4F4F6] p-3 rounded-lg">No completed quizzes yet. Winners will appear here before payout approval.</p>}
                  {payouts.length > 0 && <div className="space-y-2 max-h-48 overflow-y-auto">
                    {payouts.map(payout => {
                      const task = activeEvent?.tasks.find(item => item.id === payout.taskId)
                      const wallet = payout.recipientAddress
                      const maskedWallet = wallet === 'unlinked' ? 'Wallet unavailable' : `${wallet.slice(0, 8)}...${wallet.slice(-6)}`
                      return <div key={payout.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-neutral-200 bg-[#F4F4F6]">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black truncate">{maskedWallet}</p>
                          <p className="text-[10px] font-bold text-[#121417]/55 truncate">{task?.title || 'Completed quiz'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black">{payout.amountLuna / 100000} NIM</p>
                          <p className={`text-[9px] font-black uppercase ${payout.status === 'failed' ? 'text-red-600' : payout.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>{payout.status}</p>
                        </div>
                      </div>
                    })}
                  </div>}
                </div>

                {activeEvent.mode === 'giveaway' && <div className="p-4 bg-white border-2 border-[#121417] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between"><div><h4 className="font-black text-sm">Giveaway entries</h4><p className="text-[10px] font-bold text-[#121417]/60">Wallets collected from the giveaway link.</p></div><span className="text-xs font-black">{giveawayEntries.length}</span></div>
                  {giveawayEntries.length === 0 ? <p className="text-xs font-bold text-[#121417]/60">No wallets have joined yet.</p> : <div className="space-y-1 max-h-40 overflow-y-auto">{giveawayEntries.map(entry => <div key={entry.id} className="flex justify-between p-2 rounded-lg bg-[#F4F4F6] text-[10px] font-bold"><span>{entry.walletAddress.slice(0, 8)}...{entry.walletAddress.slice(-6)}</span><span>{new Date(entry.joinedAt).toLocaleString()}</span></div>)}</div>}
                </div>}

                {/* Batch Airdrop */}
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/70 rounded-xl p-2"><p className="text-[9px] font-black uppercase text-purple-700">Winners</p><p className="text-lg font-black text-purple-950">{payouts.length}</p></div>
                    <div className="bg-white/70 rounded-xl p-2"><p className="text-[9px] font-black uppercase text-amber-700">Pending</p><p className="text-lg font-black text-amber-900">{payouts.filter(payout => payout.status === 'pending' || payout.status === 'failed').length}</p></div>
                    <div className="bg-white/70 rounded-xl p-2"><p className="text-[9px] font-black uppercase text-emerald-700">Submitted</p><p className="text-lg font-black text-emerald-900">{payouts.filter(payout => payout.status === 'submitted' || payout.status === 'confirmed').length}</p></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm text-purple-950">Approve NIM payouts</h4>
                      <p className="text-[10px] font-bold text-purple-700">Send queued rewards from your creator wallet. Nimiq Pay will ask you to approve each transaction.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleAirdrop} 
                    disabled={isAirdropping}
                    className="w-full py-3 rounded-xl bg-purple-600 text-white font-black text-xs uppercase hover:bg-purple-700 disabled:opacity-50 transition-all shadow-retro-sm"
                  >
                    {isAirdropping ? 'Waiting for wallet approval...' : 'Approve NIM payouts'}
                  </button>
                  {airdropMsg && <p className="text-xs font-bold text-purple-800 text-center">{airdropMsg}</p>}
                </div>

                {/* Fund More */}
                <div className="p-4 bg-white border-2 border-[#121417] rounded-2xl space-y-3">
                  <h4 className="font-black text-sm text-[#121417]">Payout budget</h4>
                  <p className="text-[10px] font-bold text-[#121417]/60">Payouts are sent from the connected creator wallet. This value is a planning limit, not a separate escrow account.</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount in NIM" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className={softInputCls} />
                  <button onClick={async () => {
                    const amount = Number(fundAmount)
                    if (!Number.isFinite(amount) || amount <= 0) {
                      setFundMsg('Enter a positive NIM amount.')
                      return
                    }
                    setFundMsg('Checking payout budget...')
                    const result = await onFundPool(amount)
                    setFundMsg(result.message)
                    if (result.success) setFundAmount('')
                  }} className="px-5 rounded-xl bg-[#121417] text-white font-black text-xs uppercase flex items-center gap-1.5 whitespace-nowrap hover:bg-black shadow-retro-sm">
                    <Zap className="w-3.5 h-3.5" /> Save
                  </button>
                  </div>
                  {fundMsg && <p role="status" className="text-xs font-bold text-[#121417]/70">{fundMsg}</p>}
                </div>
              </div>
            )}
            
          </div>
        )}

        </div> {/* Closes scrollable body */}
      </div> {/* Closes bottom sheet relative box */}


      {showPromptInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-[#121417]">
            <h3 className="font-display font-black text-lg mb-2 text-[#121417]">Generate Trivia with AI</h3>
            <p className="text-xs text-[#121417]/70 mb-4">Copy this prompt and paste it into ChatGPT, Gemini, or Claude to quickly generate bulk trivia questions formatted perfectly for your event.</p>
            <div className="bg-[#F4F4F6] p-3 rounded-xl border border-neutral-300 font-mono text-[10px] text-[#121417] mb-4 select-all">
              Generate 10 trivia questions about [YOUR TOPIC HERE]. Format the output STRICTLY as raw CSV with one header row and no markdown blocks or extra text. Use this exact column format: Question, Option A, Option B, Option C, Correct Answer (A/B/C), Reward NIM, Winner Slots. Quote any field containing a comma. Example row: "What is 2+2?", 3, 4, 5, B, 5, 1
            </div>
            <button onClick={() => setShowPromptInfo(false)} className="w-full py-2 bg-[#121417] text-white font-black text-xs uppercase rounded-xl">Got it</button>
          </div>
        </div>
      )}
    </div>
  )
}
