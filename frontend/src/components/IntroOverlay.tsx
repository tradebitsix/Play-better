import React, { useEffect, useMemo, useState } from 'react'
import { Grid2X2, Trophy, Radio, User, ChevronRight } from 'lucide-react'

import IntroOverlay from './components/IntroOverlay'
import BannerAd from './components/BannerAd'
import Lobby from './components/Lobby'
import Tourneys from './components/Tourneys'
import Live from './components/Live'
import ProfilePro from './components/ProfilePro'
import TournamentBracket from './components/TournamentBracket'
import LiveMatch from './components/LiveMatch'

import type { Tournament, ViewState } from './types'

const TabButton = ({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ElementType
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 min-w-[72px]
      ${
        active
          ? 'bg-gradient-to-b from-red-600/35 to-red-950/20 border border-red-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.55)]'
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-red-200' : 'text-white/70'}`} />
    <span className={`text-xs ${active ? 'text-white' : 'text-white/60'}`}>{label}</span>
  </button>
)

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('lobby')

  // ✅ Intro shows only once (persisted)
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem('intro_seen') !== '1')

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  useEffect(() => {
    // Keep behavior consistent if storage changes / reloads
    const seen = localStorage.getItem('intro_seen') === '1'
    if (seen && showIntro) setShowIntro(false)
  }, [showIntro])

  const go = (view: ViewState) => {
    // Legacy view normalization
    if (view === 'dashboard') return setCurrentView('lobby')
    if (view === 'tournaments') return setCurrentView('tourneys')
    if (view === 'livehall') return setCurrentView('live')
    if (view === 'merch') return setCurrentView('lobby')
    return setCurrentView(view)
  }

  const navItems = useMemo(
    () => [
      { view: 'lobby' as const, label: 'Lobby', icon: Grid2X2 },
      { view: 'tourneys' as const, label: 'Tourneys', icon: Trophy },
      { view: 'live' as const, label: 'Live', icon: Radio },
      { view: 'profile' as const, label: 'Profile', icon: User },
    ],
    []
  )

  const openBracket = (t: Tournament) => {
    setSelectedTournament(t)
    go('bracket')
  }

  const renderMain = () => {
    if (currentView === 'match') {
      return selectedMatchId ? (
        <LiveMatch matchId={selectedMatchId} onViewChange={go} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <div className="text-sm text-white/70">No live match selected.</div>
        </div>
      )
    }

    if (currentView === 'bracket') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
            <button
              onClick={() => go('tourneys')}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">Back to Tourneys</span>
            </button>
          </div>
          {selectedTournament ? (
            <TournamentBracket tournament={selectedTournament} onBack={() => go('tourneys')} />
          ) : null}
        </div>
      )
    }

    switch (currentView) {
      case 'lobby':
        return <Lobby />
      case 'tourneys':
        return <Tourneys onViewChange={go} onOpenBracket={openBracket} />
      case 'live':
        return <Live onViewChange={go} />
      case 'profile':
        return <ProfilePro />
      default:
        return <Lobby />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-neutral-950 text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-red-700/25 blur-3xl" />
        <div className="absolute top-40 left-10 h-56 w-56 rounded-full bg-red-900/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md px-4 pb-28 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold tracking-wide">Play Better</div>
            <div className="text-xs text-white/60">Pool Locals — Tricksack Style</div>
            <div className="text-xs text-white/50">By: FanzoftheOne</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center">
              <Grid2X2 className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Main */}
        {renderMain()}

        {/* Ads (optional) */}
        <div className="mt-6">
          <BannerAd />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 pb-4">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between gap-2">
              {navItems.map((item) => (
                <TabButton
                  key={item.view}
                  active={currentView === item.view}
                  onClick={() => go(item.view)}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Intro overlay (once), and on close -> LAND ON LOBBY */}
      {showIntro ? (
        <IntroOverlay
          onClose={() => {
            localStorage.setItem('intro_seen', '1')
            setShowIntro(false)

            // Force clean landing state
            setCurrentView('lobby')
            setSelectedTournament(null)
            setSelectedMatchId(null)
          }}
        />
      ) : null}
    </div>
  )
}