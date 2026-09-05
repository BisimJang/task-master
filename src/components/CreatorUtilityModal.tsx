import React, { useState, useEffect } from 'react'
import {
  X, Zap, FolderPlus, Trash2, HelpCircle, Users, Share2, FileText, Globe, Gamepad2, Wrench, Lock, CheckCircle2, Copy, Plus
} from 'lucide-react'
import type { StageEvent, SessionTask, TaskType } from '../lib/types'

interface CreatorUtilityModalProps {
  isOpen: boolean
  onClose: () => void
  events?: StageEvent[]
  activeEvent: StageEvent | null
  onSelectEvent: (event: StageEvent) => void
  onCreateEvent: (newEvent: StageEvent) => void
  onFundPool: (amountNIM: number) => void
  onClearAllData?: () => void
}

const TASK_TYPES: { type: TaskType; label: string; icon: React.ReactNode; hint: string }[] = [
  { type: 'quiz',          label: 'Quiz',          icon: <HelpCircle className="w-4 h-4" />,  hint: 'Multiple choice — auto-verified' },
  { type: 'social_follow', label: 'Follow',        icon: <Users className="w-4 h-4" />,       hint: 'Follow a social profile' },
  { type: 'social_tag',    label: 'Tag & Share',   icon: <Share2 className="w-4 h-4" />,      hint: 'Tag friends in a post' },
  { type: 'social_post',   label: 'Post',          icon: <FileText className="w-4 h-4" />,    hint: 'Make or repost content' },
  { type: 'visit_url',     label: 'Visit Site',    icon: <Globe className="w-4 h-4" />,       hint: 'Browse a URL (time-gated)' },
  { type: 'play_game',     label: 'Play Game',     icon: <Gamepad2 className="w-4 h-4" />,   hint: 'Launch a game link' },
  { type: 'custom',        label: 'Custom',        icon: <Wrench className="w-4 h-4" />,      hint: 'Any task you describe' },
]
const PLATFORMS = ['X (Twitter)', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook', 'Telegram']

export const CreatorUtilityModal: React.FC<CreatorUtilityModalProps> = ({
  isOpen, onClose, events: _events, activeEvent, onSelectEvent, onCreateEvent, onFundPool, onClearAllData
}) => {
  // Wizard state for NEW event
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  
  // View mode if managing existing event
  const [viewMode, setViewMode] = useState<'wizard' | 'manage'>(activeEvent ? 'manage' : 'wizard')

  useEffect(() => {
    if (!isOpen) return
    if (activeEvent) {
      setViewMode('manage')
    } else {
      setViewMode('wizard')
      setStep(1)
    }
  }, [isOpen, activeEvent])

  // --- Draft State (only saved on publish) ---
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDesc, setDraftDesc] = useState('')
  const [draftOrg, setDraftOrg] = useState('')
  const [draftPool, setDraftPool] = useState('')
  const [draftTasks, setDraftTasks] = useState<SessionTask[]>([])

  // Task Form State
  const [taskType, setTaskType] = useState<TaskType>('quiz')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskRewardNIM, setTaskRewardNIM] = useState('')
  const [taskMaxWinners, setTaskMaxWinners] = useState('1')
  
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [correctOptIndex, setCorrectOptIndex] = useState(0)
  
  const [taskActionUrl, setTaskActionUrl] = useState('')
  const [taskPlatform, setTaskPlatform] = useState('X (Twitter)')
  const [taskDwellSecs, _setTaskDwellSecs] = useState('10')

  // Manage existing state
  const [fundAmount, setFundAmount] = useState('')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  if (!isOpen) return null

  // --- Actions ---

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleAddTaskToDraft = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || !taskRewardNIM) return
    if (taskType === 'quiz' && (!optionA.trim() || !optionB.trim())) return

    const newTask: SessionTask = {
      id: 'task-' + Date.now(),
      type: taskType,
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      rewardNIM: Number(taskRewardNIM),
      maxWinners: Number(taskMaxWinners) || 1,
      winnerCount: 0,
      ...(taskType === 'quiz' && {
        options: [optionA.trim(), optionB.trim(), ...(optionC.trim() ? [optionC.trim()] : [])],
        correctIndex: correctOptIndex,
      }),
      ...(['social_follow', 'social_tag', 'social_post', 'visit_url', 'play_game'].includes(taskType) && {
        actionUrl: taskActionUrl.trim() || undefined,
        platform: ['social_follow', 'social_tag', 'social_post'].includes(taskType) ? taskPlatform : undefined,
        actionLabel:
          taskType === 'social_follow' ? `Follow on ${taskPlatform}` :
          taskType === 'social_tag'    ? `Tag on ${taskPlatform}` :
          taskType === 'social_post'   ? `Post on ${taskPlatform}` :
          taskType === 'visit_url'     ? 'Visit Site' :
          taskType === 'play_game'     ? 'Launch Game' : undefined,
        minDwellSeconds: ['visit_url', 'play_game'].includes(taskType) ? (Number(taskDwellSecs) || 10) : undefined,
      }),
    }

    setDraftTasks([...draftTasks, newTask])
    
    // Reset Task Form
    setTaskTitle(''); setTaskDescription(''); setTaskRewardNIM(''); setTaskMaxWinners('1')
    setOptionA(''); setOptionB(''); setOptionC(''); setCorrectOptIndex(0)
    setTaskActionUrl('')
  }

  const handlePublish = () => {
    if (!draftTitle.trim()) return
    const slug = draftTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const newEvent: StageEvent = {
      id: 'evt-' + Date.now(),
      slug: slug || 'event-' + Date.now(),
      title: draftTitle.trim(),
      description: draftDesc.trim(),
      organizer: draftOrg.trim(),
      totalPoolNIM: Number(draftPool) || 0,
      tasks: draftTasks,
      published: true
    }
    
    onCreateEvent(newEvent)
    // Clear draft
    setDraftTitle(''); setDraftDesc(''); setDraftOrg(''); setDraftPool(''); setDraftTasks([])
    setStep(1)
    onSelectEvent(newEvent)
    setViewMode('manage')
  }

  const inputCls = 'w-full text-xs font-bold p-2.5 rounded-xl border-2 border-[#121417] bg-[#F4F4F6]'
  const softInputCls = 'w-full text-xs p-2.5 rounded-xl border border-neutral-300'
  const labelCls = 'block text-[11px] font-bold text-[#121417]/80 mb-1'
  
  const getShareLink = (event: StageEvent, taskId?: string) => {
    const base = window.location.origin + window.location.pathname
    if (taskId) return `${base}?event=${event.slug}&task=${taskId}`
    return `${base}?event=${event.slug}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-3 border-[#121417] rounded-[32px] p-6 sm:p-8 shadow-retro-lg text-[#121417] my-8">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/10 flex items-center justify-center cursor-pointer transition-colors">
          <X className="w-4 h-4 text-[#121417]" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF532F]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF532F]">Organizer Hub</span>
        </div>
        <h2 className="font-display font-black text-2xl tracking-tight text-[#121417]">
          {viewMode === 'wizard' ? 'Create Event' : 'Manage Event'}
        </h2>

        {/* View Switcher if we have an active event but want to create a new one */}
        {activeEvent && viewMode === 'manage' && (
          <div className="mt-4 flex gap-2">
            <button onClick={() => { setViewMode('wizard'); setStep(1); }} className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-[#121417] flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5" /><span>Create New Event</span>
            </button>
            {onClearAllData && (
               <button onClick={() => { if(confirm('Wipe everything?')) onClearAllData() }} className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1.5">
                 <Trash2 className="w-3.5 h-3.5" /><span>Reset Data</span>
               </button>
            )}
          </div>
        )}

        {/* --- CREATION WIZARD --- */}
        {viewMode === 'wizard' && (
          <div className="mt-6 space-y-6">
            {/* Steps indicator */}
            <div className="flex items-center justify-between px-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`flex flex-col items-center gap-1 ${step >= s ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === s ? 'bg-[#121417] text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-[#121417]'}`}>
                    {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                  </div>
                </div>
              ))}
            </div>

            {/* STEP 1: EVENT DETAILS */}
            {step === 1 && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-display font-black text-base border-b pb-2">1. Event Details</h3>
                <div><label className={labelCls}>Event Name:</label><input type="text" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Organizer:</label><input type="text" value={draftOrg} onChange={e => setDraftOrg(e.target.value)} className={softInputCls} /></div>
                <div><label className={labelCls}>Description:</label><textarea rows={2} value={draftDesc} onChange={e => setDraftDesc(e.target.value)} className={`${softInputCls} resize-none`} /></div>
                <button onClick={() => draftTitle.trim() && setStep(2)} disabled={!draftTitle.trim()} className="w-full py-3.5 rounded-full bg-[#121417] text-white font-black text-xs uppercase disabled:opacity-50 mt-4">Next: Set Prize Pool</button>
              </div>
            )}

            {/* STEP 2: PRIZE POOL */}
            {step === 2 && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="font-display font-black text-base border-b pb-2">2. Prize Pool</h3>
                <div className="p-3 bg-amber-50 border-2 border-[#FBD023] rounded-2xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lock className="w-3.5 h-3.5 text-[#121417]/60" />
                    <label className="text-[11px] font-black text-[#121417] uppercase tracking-wider">Total Pool (NIM) — Locked on Publish</label>
                  </div>
                  <input type="number" min="0" value={draftPool} onChange={e => setDraftPool(e.target.value)} className="w-full text-sm font-black p-2.5 rounded-xl border-2 border-[#121417] bg-white" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(1)} className="px-4 py-3.5 rounded-full border-2 border-[#121417] font-black text-xs uppercase">Back</button>
                  <button onClick={() => draftPool && setStep(3)} disabled={!draftPool} className="flex-1 py-3.5 rounded-full bg-[#121417] text-white font-black text-xs uppercase disabled:opacity-50">Next: Add Tasks</button>
                </div>
              </div>
            )}

            {/* STEP 3: ADD TASKS */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-display font-black text-base">3. Add Tasks ({draftTasks.length} added)</h3>
                  <button onClick={() => setStep(4)} className="text-xs font-black text-emerald-600 hover:underline">Review & Publish →</button>
                </div>
                
                <form onSubmit={handleAddTaskToDraft} className="space-y-3 p-4 bg-[#F4F4F6] rounded-2xl border-2 border-[#121417]">
                  <label className={labelCls}>Task Type:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    {TASK_TYPES.map(tt => (
                      <button key={tt.type} type="button" onClick={() => setTaskType(tt.type)}
                        className={`p-2 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${taskType === tt.type ? 'border-[#121417] bg-[#121417] text-white' : 'border-neutral-200 bg-white'}`}>
                        {tt.icon}<span className="text-[10px] font-black">{tt.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelCls}>Task Title:</label><input required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className={softInputCls} /></div>
                    <div><label className={labelCls}>NIM Reward:</label><input type="number" required value={taskRewardNIM} onChange={e => setTaskRewardNIM(e.target.value)} className={softInputCls} /></div>
                  </div>
                  
                  {/* Competition Winner Slots */}
                  <div>
                    <label className={labelCls}>Winner Slots (Competition Mode):</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" required value={taskMaxWinners} onChange={e => setTaskMaxWinners(e.target.value)} className={`w-24 ${softInputCls}`} />
                      <span className="text-[10px] text-[#121417]/60">1 = First person wins. 5 = First 5 people win.</span>
                    </div>
                  </div>

                  {taskType === 'quiz' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelCls}>Option A (Correct):</label><input required value={optionA} onChange={e => {setOptionA(e.target.value); setCorrectOptIndex(0);}} className={softInputCls} /></div>
                      <div><label className={labelCls}>Option B:</label><input required value={optionB} onChange={e => setOptionB(e.target.value)} className={softInputCls} /></div>
                    </div>
                  )}

                  {['social_follow', 'social_tag', 'social_post'].includes(taskType) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelCls}>Platform:</label><select value={taskPlatform} onChange={e => setTaskPlatform(e.target.value)} className={softInputCls}>{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                      <div><label className={labelCls}>URL:</label><input type="url" value={taskActionUrl} onChange={e => setTaskActionUrl(e.target.value)} className={softInputCls} /></div>
                    </div>
                  )}

                  {['visit_url', 'play_game'].includes(taskType) && (
                    <div><label className={labelCls}>URL:</label><input type="url" required value={taskActionUrl} onChange={e => setTaskActionUrl(e.target.value)} className={softInputCls} /></div>
                  )}

                  <button type="submit" className="w-full py-2.5 rounded-xl bg-white border-2 border-[#121417] hover:bg-neutral-100 font-black text-xs uppercase flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Task to Event
                  </button>
                </form>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(2)} className="px-4 py-3.5 rounded-full border-2 border-[#121417] font-black text-xs uppercase">Back</button>
                  <button onClick={() => setStep(4)} disabled={draftTasks.length === 0} className="flex-1 py-3.5 rounded-full bg-[#121417] text-white font-black text-xs uppercase disabled:opacity-50">Review & Publish</button>
                </div>
              </div>
            )}

            {/* STEP 4: PUBLISH */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="font-display font-black text-base border-b pb-2">4. Review & Publish</h3>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <p className="text-xs font-bold">Event: {draftTitle}</p>
                  <p className="text-xs font-bold">Pool: {draftPool} NIM</p>
                  <p className="text-xs font-bold">Tasks: {draftTasks.length}</p>
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
          <div className="mt-6 space-y-6 animate-in fade-in">
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Published</p>
                <h3 className="font-display font-black text-lg text-[#121417]">{activeEvent.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#121417]/60 uppercase">Prize Pool</p>
                <p className="font-black text-emerald-700">{activeEvent.totalPoolNIM} NIM</p>
              </div>
            </div>

            {/* Share Links */}
            <div className="space-y-3">
              <h4 className="font-black text-sm text-[#121417]">Share Links</h4>
              
              <div className="p-3 bg-[#F4F4F6] rounded-xl flex items-center justify-between gap-3">
                <div className="truncate">
                  <p className="text-[10px] font-bold text-[#121417]/60 uppercase">Full Event Link</p>
                  <p className="text-xs font-mono truncate">{getShareLink(activeEvent)}</p>
                </div>
                <button onClick={() => handleCopy(getShareLink(activeEvent))} className="p-2 bg-white rounded-lg border shadow-sm shrink-0">
                  {copiedLink === getShareLink(activeEvent) ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {activeEvent.tasks.map((task, i) => {
                const link = getShareLink(activeEvent, task.id)
                return (
                  <div key={task.id} className="p-3 bg-[#F4F4F6] rounded-xl flex items-center justify-between gap-3 border border-neutral-200">
                    <div className="truncate">
                      <p className="text-[10px] font-bold text-[#121417]/60 uppercase flex items-center gap-1">
                        Task {i+1} Link <span className="text-emerald-600 bg-emerald-100 px-1.5 rounded-full">{task.rewardNIM} NIM</span>
                        <span className="text-amber-600 bg-amber-100 px-1.5 rounded-full">{task.winnerCount}/{task.maxWinners} Claimed</span>
                      </p>
                      <p className="text-xs font-black truncate">{task.title}</p>
                    </div>
                    <button onClick={() => handleCopy(link)} className="p-2 bg-white rounded-lg border shadow-sm shrink-0">
                      {copiedLink === link ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Fund More */}
            <div className="pt-4 border-t">
              <h4 className="font-black text-sm text-[#121417] mb-2">Fund Pool (Nimiq Pay)</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="NIM" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className={softInputCls} />
                <button onClick={() => onFundPool(Number(fundAmount) || 0)} className="px-4 rounded-xl bg-[#121417] text-white font-black text-xs flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5" /> Fund
                </button>
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  )
}
