import React, { useState } from 'react'
import { CheckCircle, ExternalLink, HelpCircle, KeyRound, Check, Sparkles, AlertCircle } from 'lucide-react'
import type { Campaign, QuestTask } from '../lib/types'

interface QuestRunnerSectionProps {
  campaign: Campaign
  onCompleteTask: (taskId: string) => void
  completedCount: number
  totalCount: number
}

export const QuestRunnerSection: React.FC<QuestRunnerSectionProps> = ({
  campaign,
  onCompleteTask,
  completedCount,
  totalCount,
}) => {
  const [triviaAnswers, setTriviaAnswers] = useState<Record<string, number>>({})
  const [enteredCodes, setEnteredCodes] = useState<Record<string, string>>({})
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({})

  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const handleVerifySocial = (task: QuestTask) => {
    if (task.targetUrl) {
      window.open(task.targetUrl, '_blank', 'noopener,noreferrer')
    }
    setTimeout(() => {
      onCompleteTask(task.id)
    }, 600)
  }

  const handleSelectTrivia = (task: QuestTask, optionIdx: number) => {
    if (task.completed) return
    setTriviaAnswers((prev) => ({ ...prev, [task.id]: optionIdx }))

    if (optionIdx === task.triviaCorrectIndex) {
      setErrorMessages((prev) => ({ ...prev, [task.id]: '' }))
      onCompleteTask(task.id)
    } else {
      setErrorMessages((prev) => ({
        ...prev,
        [task.id]: 'Incorrect answer! Review the documentation and try again.',
      }))
    }
  }

  const handleVerifyCode = (e: React.FormEvent, task: QuestTask) => {
    e.preventDefault()
    if (task.completed) return

    const entered = (enteredCodes[task.id] || '').trim().toUpperCase()
    const expected = (task.secretCode || '').trim().toUpperCase()

    if (entered === expected) {
      setErrorMessages((prev) => ({ ...prev, [task.id]: '' }))
      onCompleteTask(task.id)
    } else {
      setErrorMessages((prev) => ({
        ...prev,
        [task.id]: `Invalid booth passcode! Ask the ${task.sponsorName || 'sponsor'} team for the code.`,
      }))
    }
  }

  return (
    <div className="bg-white border-3 border-[#121417] rounded-[32px] p-6 shadow-retro flex flex-col justify-between h-full">
      {/* Top Header & Progress Bar */}
      <div>
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF532F]" />
            <h2 className="font-display font-black text-xl text-[#121417] tracking-tight">
              Event Quests
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-[#FF532F]">
              {completedCount}/{totalCount} Completed ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-neutral-100 border border-black/10 rounded-full overflow-hidden my-4">
          <div
            className="h-full bg-[#FF532F] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Tasks List */}
        <div className="space-y-4 mt-2">
          {campaign.tasks.map((task, index) => {
            const isCompleted = task.completed
            const error = errorMessages[task.id]

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-500/80 text-[#121417]'
                    : 'bg-[#F4F4F6] border-[#121417] text-[#121417]'
                }`}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-white border-[#121417] text-[#121417]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF532F]">
                          {task.type === 'social' && 'Social Quest'}
                          {task.type === 'trivia' && 'Protocol Trivia'}
                          {task.type === 'booth_code' && 'Booth Check-In'}
                        </span>
                        {task.sponsorName && (
                          <span className="text-[10px] font-bold text-[#121417]/60">
                            • {task.sponsorName}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black text-base text-[#121417] tracking-tight mt-0.5">
                        {task.title}
                      </h3>
                      <p className="text-xs text-[#121417]/70 font-medium mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-200 text-[#121417]/70'
                    }`}
                  >
                    {isCompleted ? 'Verified ✓' : 'Pending'}
                  </span>
                </div>

                {/* Error Notice */}
                {error && (
                  <div className="mt-3 p-2.5 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Interactive Task Actions Right in the Card */}
                {!isCompleted && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    {/* TYPE A: SOCIAL / LINK */}
                    {task.type === 'social' && (
                      <button
                        onClick={() => handleVerifySocial(task)}
                        className="px-4 py-2 rounded-xl bg-[#121417] hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#FBD023]" />
                        <span>Visit & Verify</span>
                      </button>
                    )}

                    {/* TYPE B: TRIVIA QUIZ */}
                    {task.type === 'trivia' && (
                      <div className="space-y-1.5">
                        <span className="block text-[11px] font-bold text-[#121417]/80">
                          {task.triviaQuestion}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {task.triviaOptions?.map((opt, optIdx) => {
                            const isSelected = triviaAnswers[task.id] === optIdx
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectTrivia(task, optIdx)}
                                className={`text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-[#121417] text-white border-[#121417]'
                                    : 'bg-white hover:bg-neutral-100 border-neutral-300 text-[#121417]'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-3 h-3 text-[#FBD023]" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* TYPE C: BOOTH PASSCODE */}
                    {task.type === 'booth_code' && (
                      <form onSubmit={(e) => handleVerifyCode(e, task)} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. ALBATROSS26"
                          value={enteredCodes[task.id] || ''}
                          onChange={(e) =>
                            setEnteredCodes((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FF532F]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#121417] hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#FBD023]" />
                          <span>Unlock</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Completion Helper */}
      <div className="mt-6 pt-4 border-t border-neutral-200 text-xs font-bold text-[#121417]/60 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FBD023]" />
        <span>
          Complete all {totalCount} checkpoints to unlock the reward vault on the right.
        </span>
      </div>
    </div>
  )
}
