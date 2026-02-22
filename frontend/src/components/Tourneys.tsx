import React from 'react'
import { Trophy, ChevronRight } from 'lucide-react'
import Tournaments from './Tournaments'
import type { Tournament, ViewState } from '../types'

export default function Tourneys(props: {
  onViewChange: (view: ViewState) => void
  onOpenBracket: (t: Tournament) => void
}) {
  const { onViewChange, onOpenBracket } = props

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm opacity-70">Tourneys</div>
              <div className="text-lg font-semibold">Brackets + local events</div>
            </div>
          </div>
          <div className="text-xs opacity-70 flex items-center gap-1">
            <span>Quarter / Semi / Finals</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <Tournaments onViewChange={onViewChange} onOpenBracket={onOpenBracket} />
    </div>
  )
}
