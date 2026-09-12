import React, { useState } from 'react'
import { ArrowRight, CheckCircle, ExternalLink, KeyRound, HelpCircle, Gift, AlertCircle } from 'lucide-react'
import type { Campaign, QuestTask } from '../lib/types'

interface RightBountySectionProps {
  campaign: Campaign
  activeTaskIndex: number
  onCompleteTask: (taskId: string) => void
  onClaimReward: () => void
  completedCount: number
  totalCount: number
  hasClaimed: boolean
  isClaiming: boolean
}

export const RightBountySection: React.FC<RightBountySectionProps> = ({
  campaign,
  activeTaskIndex,
  onCompleteTask,
  onClaimReward,
  completedCount,
  totalCount,
  hasClaimed,
  isClaiming
}) => {
  const currentTask: QuestTask | undefined = campaign.tasks[activeTaskIndex]
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [enteredCode, setEnteredCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  const allCompleted = completedCount === totalCount

  const handleVerifySocial = () => {
    if (!currentTask) return
    if (currentTask.targetUrl) {
      window.open(currentTask.targetUrl, '_blank', 'noopener,noreferrer')
    }
    setTimeout(() => {
      onCompleteTask(currentTask.id)
      setSuccessNotice('Social quest verified!')
      setTimeout(() => setSuccessNotice(null), 3000)
    }, 600)
  }

  const handleAnswerTrivia = (optionIdx: number) => {
    if (!currentTask || currentTask.completed) return
    setSelectedAnswer(optionIdx)
    setErrorMessage(null)

    if (optionIdx === currentTask.triviaCorrectIndex) {
      onCompleteTask(currentTask.id)
      setSuccessNotice('Correct answer! Step unlocked.')
      setTimeout(() => setSuccessNotice(null), 3000)
    } else {
      setErrorMessage('Incorrect answer! Check the hint and try again.')
    }
  }

  const handleVerifyBoothCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTask || currentTask.completed) return
    setErrorMessage(null)

    const normalizedEntered = enteredCode.trim().toUpperCase()
    const normalizedTarget = (currentTask.secretCode || '').trim().toUpperCase()

    if (normalizedEntered === normalizedTarget) {
      onCompleteTask(currentTask.id)
      setEnteredCode('')
      setSuccessNotice('Booth passcode accepted! Step unlocked.')
      setTimeout(() => setSuccessNotice(null), 3000)
    } else {
      setErrorMessage(`Invalid passcode! Ask the ${currentTask.sponsorName || 'sponsor'} team for the drop code.`)
    }
  }

  return (
    <div className="w-full h-full min-h-[540px] bg-[#FF532F] border-3 border-[#121417] rounded-[36px] p-6 text-white shadow-retro flex flex-col justify-between select-none">
      
      {/* 1. Header Pill */}
      <div>
        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBD023] animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-white/90">
              Active Bounty
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full">
            {completedCount}/{totalCount} Done
          </span>
        </div>

        {/* 2. Task Details & Interactive Inputs */}
        <div className="mt-5 space-y-4">
          {currentTask ? (
            <div>
              <div className="flex items-center gap-2 text-[#FBD023] text-xs font-bold uppercase tracking-wider">
                {currentTask.type === 'social' && <ExternalLink className="w-3.5 h-3.5" />}
                {currentTask.type === 'trivia' && <HelpCircle className="w-3.5 h-3.5" />}
                {currentTask.type === 'booth_code' && <KeyRound className="w-3.5 h-3.5" />}
                <span>{currentTask.sponsorName || 'Quest Task'}</span>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl mt-1 tracking-tight leading-snug">
                {currentTask.title}
              </h2>
              <p className="text-xs text-white/85 font-medium mt-1 leading-relaxed">
                {currentTask.description}
              </p>

              {/* Task State Notification */}
              {successNotice && (
                <div className="mt-3 p-2.5 bg-emerald-600/90 border border-emerald-400 text-white rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>{successNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mt-3 p-2.5 bg-[#121417] border border-red-400 text-white rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#FF532F]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* INTERACTIVE CONTROLS BY TASK TYPE */}
              <div className="mt-5">
                {/* A. Social Task */}
                {currentTask.type === 'social' && (
                  <div className="space-y-3">
                    <button
                      onClick={handleVerifySocial}
                      disabled={currentTask.completed}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#121417] hover:bg-black text-white font-bold text-xs uppercase tracking-wider border-2 border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      {currentTask.completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Task Completed</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 text-[#FBD023]" />
                          <span>Visit & Verify Action</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* B. Trivia Task */}
                {currentTask.type === 'trivia' && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#FBD023]">Select the correct answer:</p>
                    {currentTask.triviaOptions?.map((option, idx) => {
                      const isSelected = selectedAnswer === idx
                      const isCorrect = currentTask.completed && idx === currentTask.triviaCorrectIndex
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerTrivia(idx)}
                          disabled={currentTask.completed}
                          className={`w-full text-left py-2.5 px-3.5 rounded-2xl text-xs font-bold border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-600 border-white text-white'
                              : isSelected && !isCorrect
                              ? 'bg-red-800 border-white text-white'
                              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                          }`}
                        >
                          <span>{option}</span>
                          {isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* C. Booth Passcode Task */}
                {currentTask.type === 'booth_code' && (
                  <form onSubmit={handleVerifyBoothCode} className="space-y-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/80">
                      Enter Booth Passcode:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        disabled={currentTask.completed}
                        placeholder={currentTask.completed ? 'PASSED' : 'e.g. ALBATROSS26'}
                        className="w-full uppercase font-mono tracking-widest px-4 py-2.5 rounded-2xl bg-white/90 text-[#121417] text-xs font-bold placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FBD023]"
                      />
                      <button
                        type="submit"
                        disabled={currentTask.completed || !enteredCode.trim()}
                        className="px-4 py-2.5 rounded-2xl bg-[#121417] hover:bg-black disabled:opacity-40 text-white font-bold text-xs uppercase cursor-pointer transition-colors shrink-0"
                      >
                        Unlock
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm font-bold text-white/80">Select a task on the left to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Reward Display & Big Claim Button */}
      <div className="pt-5 border-t border-white/20 mt-4 space-y-4">
        {/* Token Reward Box */}
        <div className="bg-black/20 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBD023]">
              Vault Payout
            </span>
            <div className="text-2xl font-display font-black tracking-tight flex items-center gap-1.5">
              <span>{campaign.rewardAmount}</span>
              <span className="text-xs uppercase bg-[#FBD023] text-[#121417] px-2 py-0.5 rounded-full font-extrabold">
                {campaign.rewardType}
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] font-bold text-white/70">
            <div>1-Sec Confirmation</div>
            <div className="text-emerald-300">0 Gas Fees</div>
          </div>
        </div>

        {/* Big Action Pill Button */}
        {hasClaimed ? (
          <div className="w-full py-4 rounded-full bg-emerald-500 border-2 border-[#121417] text-white font-black text-sm tracking-wider uppercase text-center shadow-retro flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Reward Claimed!</span>
          </div>
        ) : (
          <button
            onClick={onClaimReward}
            disabled={!allCompleted || isClaiming}
            className={`w-full py-3.5 px-6 rounded-full border-2 border-[#121417] font-black text-sm uppercase tracking-wider transition-all flex items-center justify-between shadow-retro cursor-pointer ${
              allCompleted
                ? 'bg-[#FBD023] hover:bg-[#ffe169] text-[#121417] animate-pulse active:translate-y-0.5 active:shadow-none'
                : 'bg-white/20 text-white/60 cursor-not-allowed opacity-80'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>
                {isClaiming
                  ? 'Verifying...'
                  : allCompleted
                  ? 'Claim Drop Now'
                  : `${totalCount - completedCount} Quests Remaining`}
              </span>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-[#121417] text-white flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>

    </div>
  )
}
