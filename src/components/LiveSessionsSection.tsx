import React, { useState } from 'react'
import {
  Radio, Users, AlertCircle, CheckCircle2, Plus, Lock,
  Share2, FileText, Globe, Gamepad2, Wrench, ExternalLink, HelpCircle, Flame, ArrowLeft, Star, QrCode
} from 'lucide-react'
// @ts-ignore
import { QRCodeSVG } from 'qrcode.react'
import type { StageEvent, SessionTask } from '../lib/types'

interface LiveSessionsSectionProps {
  event: StageEvent | null
  onTaskComplete: (taskId: string, optionIndex: number) => void
  earnedPerTask: Record<string, boolean>
  onOpenCreatorMenu?: () => void
  onBack?: () => void
  isStarred?: boolean
  onToggleStar?: () => void
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  quiz:          <HelpCircle className="w-3.5 h-3.5" />,
  social_follow: <Users className="w-3.5 h-3.5" />,
  social_tag:    <Share2 className="w-3.5 h-3.5" />,
  social_post:   <FileText className="w-3.5 h-3.5" />,
  visit_url:     <Globe className="w-3.5 h-3.5" />,
  play_game:     <Gamepad2 className="w-3.5 h-3.5" />,
  custom:        <Wrench className="w-3.5 h-3.5" />,
}

const TYPE_LABEL: Record<string, string> = {
  quiz:          'Quiz',
  social_follow: 'Follow',
  social_tag:    'Tag & Share',
  social_post:   'Post',
  visit_url:     'Visit Site',
  play_game:     'Play Game',
  custom:        'Custom Task',
}

interface TaskCardProps {
  task: SessionTask
  index: number
  isEarned: boolean
  onEarn: (taskId: string, optIdx: number) => void
  onOpenCreatorMenu?: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, isEarned, onEarn, onOpenCreatorMenu }) => {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  
  const isTaken = !isEarned && (task.winnerCount >= task.maxWinners)
  const slotsLeft = Math.max(0, task.maxWinners - (task.winnerCount || 0))

  if (task.isLocked && !isEarned) {
    return (
      <div className="p-6 bg-[#F4F4F6] rounded-3xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-2 text-center animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-1">
          <Lock className="w-5 h-5 text-neutral-400" />
        </div>
        <p className="font-black text-sm text-[#121417]/60 uppercase tracking-widest">Locked by Host</p>
        <p className="text-[10px] font-bold text-[#121417]/40 max-w-[200px]">Wait for the stage presentation. This quiz will unlock live.</p>
        {onOpenCreatorMenu && (
          <button 
            onClick={onOpenCreatorMenu}
            className="mt-2 px-4 py-2 bg-[#121417] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-retro-sm"
          >
            Unlock in Creator Hub
          </button>
        )}
      </div>
    )
  }

  const markDone = () => { if (!isEarned && !isTaken) onEarn(task.id, 0) }

  const openLink = () => {
    // @ts-ignore
    if (task.actionUrl) window.open(task.actionUrl, '_blank', 'noopener')
  }

  const pickOption = (idx: number) => {
    if (isEarned || isTaken || task.type !== 'quiz') return
    setSelectedOpt(idx)
    if (idx === task.correctIndex) {
      setFeedback('Correct! +' + task.rewardNIM + ' NIM unlocked.')
      onEarn(task.id, idx)
    } else {
      setFeedback('Incorrect — try again.')
    }
  }

  const isCorrectAnswer = (idx: number) => isEarned && idx === task.correctIndex

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
      isEarned ? 'bg-emerald-50/80 border-emerald-500' : 
      isTaken ? 'bg-neutral-100 border-neutral-300 opacity-60' : 
      'bg-white border-[#121417]'
    }`}>
      
      {/* Taken overlay logic for pointer events? Just letting the opacity and disabled buttons handle it. */}
      
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#121417]/60 flex items-center gap-1">
                {TYPE_ICON[task.type]}
                <span>{TYPE_LABEL[task.type] ?? 'Task'} {index + 1}</span>
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FBD023] text-[#121417] border border-black/10">
                +{task.rewardNIM} NIM
              </span>
            </div>
            
            {/* Status Badges */}
            {isEarned ? (
              <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /><span>You Won!</span>
              </span>
            ) : isTaken ? (
              <span className="text-[10px] font-black uppercase bg-neutral-300 text-neutral-600 px-2.5 py-1 rounded-full shrink-0">
                Taken
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase bg-red-100 border border-red-200 text-red-600 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3" /> RACE ON ({slotsLeft} left)
              </span>
            )}
          </div>
          
          <h4 className="font-display font-black text-sm text-[#121417] tracking-tight mt-1">{task.title}</h4>
          {task.description && <p className="text-[11px] text-[#121417]/60">{task.description}</p>}
        </div>
      </div>

      {/* Quiz */}
      {task.type === 'quiz' && task.options && (
        <div className="relative z-10">
          {feedback && (
            <div className={`mt-2.5 p-2 rounded-xl text-xs font-bold flex items-center gap-2 ${feedback.startsWith('Correct') ? 'bg-emerald-100 border border-emerald-300 text-emerald-800' : 'bg-red-100 border border-red-300 text-red-800'}`}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{feedback}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {task.options.map((opt, idx) => (
              <button key={idx} onClick={() => pickOption(idx)} disabled={isEarned || isTaken}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  isEarned || isTaken ? 'cursor-default' : 'cursor-pointer hover:bg-neutral-100'
                } ${
                  selectedOpt === idx
                    ? (isCorrectAnswer(idx) ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-red-800 text-white border-red-900')
                    : 'bg-[#F4F4F6] border-neutral-300 text-[#121417]'
                }`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Social / Link / Custom Tasks — Competition Mode (No Dwell Time) */}
      {task.type !== 'quiz' && (
        <div className="mt-3 flex flex-col gap-2 relative z-10">
          {task.platform && <span className="text-[10px] text-[#121417]/50 font-bold uppercase tracking-wider">{task.platform}</span>}
          <div className="flex gap-2">
            {task.actionUrl && (
              <button onClick={openLink} disabled={isEarned || isTaken}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black flex items-center justify-center gap-1.5 ${isEarned || isTaken ? 'bg-neutral-400 cursor-not-allowed' : 'bg-[#121417] hover:bg-black cursor-pointer'}`}>
                <ExternalLink className="w-3.5 h-3.5" /><span>{task.actionLabel ?? 'Open'}</span>
              </button>
            )}
            {!isEarned && !isTaken && (
              <button onClick={markDone}
                className="flex-1 py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-700 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-50">
                <CheckCircle2 className="w-3.5 h-3.5" /><span>Claim {task.rewardNIM} NIM</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── LiveSessionsSection (Now basically "Tasks Section") ──────────────────────
export const LiveSessionsSection: React.FC<LiveSessionsSectionProps> = ({
  event,
  onTaskComplete,
  earnedPerTask,
  onOpenCreatorMenu,
  onBack,
  isStarred,
  onToggleStar,
}) => {
  const [showQrModal, setShowQrModal] = useState(false)

  if (!event) {
    return (
      <div className="bg-white border-3 border-dashed border-[#121417]/20 rounded-[32px] p-6 flex flex-col items-center justify-center h-full select-none min-h-[420px] gap-5">
        <div className="w-16 h-16 rounded-full bg-[#121417]/5 flex items-center justify-center">
          <Radio className="w-7 h-7 text-[#121417]/20" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="font-display font-black text-lg text-[#121417]/25 tracking-tight">No events yet</p>
          <p className="text-xs text-[#121417]/20 font-medium">Create one to get started</p>
        </div>
        {onOpenCreatorMenu && (
          <button onClick={onOpenCreatorMenu}
            className="px-5 py-2.5 rounded-full border-2 border-dashed border-[#121417]/25 text-[#121417]/40 text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-[#121417]/50 hover:text-[#121417]/60 transition-all">
            + Create Event
          </button>
        )}
      </div>
    )
  }

  // Parse URL to check if a specific task is targeted
  const searchParams = new URLSearchParams(window.location.search)
  const targetedTaskId = searchParams.get('task')
  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}?event=${event.slug}` : ''
  
  // If targeted task exists, we can hoist it or just highlight it. For now, we'll just render all tasks.
  const tasksToRender = event.tasks || []

  return (
    <div className="bg-white border-3 border-[#121417] rounded-[32px] p-6 shadow-retro flex flex-col justify-between h-full select-none min-h-[420px] relative">
      <div>
        {/* Event Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl bg-[#F4F4F6] hover:bg-neutral-200 border-2 border-[#121417]/10 transition-all text-[#121417] flex items-center justify-center cursor-pointer shadow-xs"
                title="Back to All Events"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF532F]">Stage Event</span>
                {onToggleStar && (
                  <button
                    onClick={onToggleStar}
                    className={`p-1 rounded-md border transition-colors cursor-pointer ${
                      isStarred ? 'bg-[#FBD023] border-[#121417] text-[#121417]' : 'bg-neutral-100 border-neutral-200 text-neutral-400 hover:text-neutral-700'
                    }`}
                    title={isStarred ? 'Starred' : 'Star this stage'}
                  >
                    <Star className={`w-3 h-3 ${isStarred ? 'fill-[#121417]' : ''}`} />
                  </button>
                )}
              </div>
              <h2 className="font-display font-black text-xl text-[#121417] tracking-tight">{event.title}</h2>
              {event.organizer && <span className="text-xs text-[#121417]/60 font-medium">{event.organizer}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#121417] border border-neutral-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Show Event QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
            {onOpenCreatorMenu && (
              <button onClick={onOpenCreatorMenu}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#121417] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors">
                <Plus className="w-3 h-3" /><span>Manage</span>
              </button>
            )}
          </div>
        </div>

        {/* QR Code Popup Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border-3 border-[#121417] rounded-3xl p-6 shadow-retro max-w-sm w-full text-center space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-xs uppercase tracking-wider text-[#FF532F]">Stage QR Code</span>
                <button onClick={() => setShowQrModal(false)} className="font-bold text-sm text-[#121417]/60 hover:text-black cursor-pointer">✕</button>
              </div>
              <div className="p-4 bg-white border-2 border-[#121417] rounded-2xl flex flex-col items-center justify-center shadow-xs">
                <QRCodeSVG value={eventUrl} size={180} level="M" />
                <p className="font-display font-black text-sm text-[#121417] mt-3">{event.title}</p>
                <p className="text-[10px] text-[#121417]/60 font-medium">Scan to open on Nimiq Pay</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(eventUrl)
                  alert('Event link copied!')
                }}
                className="w-full py-2.5 bg-[#FBD023] border-2 border-[#121417] rounded-xl font-black text-xs uppercase tracking-wider shadow-retro-sm cursor-pointer"
              >
                Copy Event Link
              </button>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="mt-4 space-y-4">
          {tasksToRender.length > 0 ? (
            <div className="space-y-4">
              {tasksToRender.map((task, idx) => (
                <div key={task.id} id={task.id} className={targetedTaskId === task.id ? 'ring-2 ring-emerald-500 rounded-2xl' : ''}>
                  <TaskCard
                    task={task}
                    index={idx}
                    isEarned={Boolean(earnedPerTask[task.id])}
                    onEarn={onTaskComplete}
                    onOpenCreatorMenu={onOpenCreatorMenu}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-black text-[#121417]/25">No tasks yet</p>
              {onOpenCreatorMenu && (
                <button onClick={onOpenCreatorMenu} className="text-xs text-[#FF532F] font-bold hover:underline cursor-pointer">
                  + Add tasks to this event
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
