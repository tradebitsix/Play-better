import React from 'react'
import { Radio, ChevronRight } from 'lucide-react'
import LiveHall from './LiveHall'
import type { ViewState } from '../types'

export default function Live(props: { onViewChange: (view: ViewState) => void }) {
  const { onViewChange } = props
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Live</div>
              <div className="text-xs text-white/60">Table check-ins + live scores</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-xs text-white/70">
            Table <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <LiveHall onViewChange={onViewChange} />
    </div>
  )
}
