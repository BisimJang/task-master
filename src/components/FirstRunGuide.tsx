import React, { useState } from 'react'
import { ArrowRight, CheckCircle2, Gift, HelpCircle, Wallet, X, Zap } from 'lucide-react'

interface FirstRunGuideProps { isOpen: boolean; onClose: () => void }

const steps = [
  { title: 'Welcome to EventQuest', body: 'EventQuest turns live events into quick NIM rewards. You can join as an attendee or create a stage as a host.', icon: <Zap className="w-5 h-5 text-[#FBD023]" /> },
  { title: 'Joining as an attendee', body: 'Open a host link or scan their QR code, connect your Nimiq wallet, then answer a quiz while winner slots are available. Giveaway links only ask you to enter your wallet.', icon: <HelpCircle className="w-5 h-5 text-white" /> },
  { title: 'Creating as a host', body: 'Tap Create, choose Quiz race or Wallet giveaway link, add the reward budget, then share the event link or QR code with your audience.', icon: <Gift className="w-5 h-5 text-[#121417]" /> },
  { title: 'How payouts work', body: 'Quiz wins and giveaway entries are queued for the host. The host reviews wallets and pending payouts in Creator Hub, then approves NIM transfers from their connected Nimiq Pay wallet.', icon: <Wallet className="w-5 h-5 text-white" /> },
]

export const FirstRunGuide: React.FC<FirstRunGuideProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0)
  if (!isOpen) return null
  const current = steps[step]
  const finish = () => { setStep(0); onClose() }
  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="guide-title">
    <div className="w-full max-w-md bg-white rounded-3xl border-3 border-[#121417] shadow-retro-lg overflow-hidden">
      <div className="bg-[#FBD023] p-5 flex items-start justify-between border-b-2 border-[#121417]">
        <div><p className="text-[10px] font-black uppercase tracking-widest text-[#FF532F]">Quick start guide</p><h2 id="guide-title" className="font-display font-black text-2xl mt-1">Use EventQuest in under a minute</h2></div>
        <button onClick={finish} aria-label="Close guide" className="p-2 rounded-full bg-white/70 hover:bg-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5 space-y-5">
        <div className="flex items-center gap-2">{steps.map((item, index) => <span key={item.title} className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-[#FF532F]' : 'bg-neutral-200'}`} />)}</div>
        <div className="flex gap-4 items-start"><div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${step === 0 ? 'bg-[#121417]' : step === 1 || step === 3 ? 'bg-[#FF532F]' : 'bg-[#FBD023]'}`}>{current.icon}</div><div><p className="text-[10px] font-black uppercase tracking-widest text-[#FF532F]">Step {step + 1} of {steps.length}</p><h3 className="font-display font-black text-lg mt-1">{current.title}</h3><p className="text-sm text-[#121417]/70 leading-relaxed mt-2">{current.body}</p></div></div>
        <div className="flex gap-2"><button onClick={finish} className="px-4 py-3 rounded-xl border-2 border-[#121417] font-black text-xs uppercase">Skip</button>{step < steps.length - 1 ? <button onClick={() => setStep(step + 1)} className="flex-1 py-3 rounded-xl bg-[#121417] text-white font-black text-xs uppercase flex items-center justify-center gap-2">Next <ArrowRight className="w-4 h-4" /></button> : <button onClick={finish} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Get started</button>}</div>
      </div>
    </div>
  </div>
}
