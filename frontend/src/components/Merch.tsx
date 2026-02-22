import React, { useEffect, useState } from 'react'
import { ShoppingBag, ExternalLink, Loader2 } from 'lucide-react'
import BannerAd from './BannerAd'
import { api } from '../lib/api'
import type { ViewState } from '../types'

export default function Merch({ onViewChange }: { onViewChange: (v: ViewState) => void }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<{ id: string; title: string; price: string; url: string }[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    api.merch()
      .then((d) => setItems(d.items || []))
      .catch((e) => setErr(String(e.message || e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onViewChange('dashboard')} className="text-sm text-zinc-300 hover:text-white">← Back</button>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-red-500" />
          <div className="font-bold">Merch</div>
        </div>
      </div>

      <BannerAd />

      {loading && (
        <div className="flex items-center gap-2 text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading merch…
        </div>
      )}

      {err && <div className="text-red-400 text-sm">{err}</div>}

      <div className="space-y-3">
        {items.map((it) => (
          <a
            key={it.id}
            href={it.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 hover:border-zinc-700 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{it.title}</div>
                <div className="text-sm text-zinc-400">{it.price}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-400" />
            </div>
          </a>
        ))}
        {!loading && !err && items.length === 0 && (
          <div className="text-sm text-zinc-400">No merch items yet.</div>
        )}
      </div>
    </div>
  )
}
