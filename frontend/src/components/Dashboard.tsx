import React, { useMemo, useState } from "react";
import {
  Gamepad2,
  Trophy,
  Users,
  ShoppingBag,
  Wifi,
  WifiOff,
} from "lucide-react";

import PoolTableGame from "./PoolTableGame";
import Tournaments from "./Tournaments";
import LiveHall from "./LiveHall";
import Merch from "./Merch";

type Tab = "game" | "tournament" | "hall" | "merch";

function Pill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded-full border transition-all flex items-center gap-2 " +
        (active
          ? "bg-white/10 border-white/20 shadow-lg"
          : "bg-black/10 border-white/10 hover:bg-white/5")
      }
    >
      <span className="opacity-90">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function Dashboard({ apiOnline }: { apiOnline: boolean; onViewChange?: (view: any) => void }) {
  const [tab, setTab] = useState<Tab>("hall");

  const header = useMemo(() => {
    return (
      <div className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-white">Play </span>
              <span className="text-red-500">Better</span>
            </h1>
            <p className="text-sm opacity-80 mt-1">
              Pool Locals — Tricksack Style
            </p>
            <p className="text-xs opacity-70 mt-1">By: FanzofTheOne</p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 bg-black/20">
            {apiOnline ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">API online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm">API offline</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <Pill
            active={tab === "game"}
            onClick={() => setTab("game")}
            icon={<Gamepad2 className="w-4 h-4" />}
            label="Digital Game"
          />
          <Pill
            active={tab === "tournament"}
            onClick={() => setTab("tournament")}
            icon={<Trophy className="w-4 h-4" />}
            label="Digital Tournament"
          />
          <Pill
            active={tab === "hall"}
            onClick={() => setTab("hall")}
            icon={<Users className="w-4 h-4" />}
            label="Live Pool Hall"
          />
          <Pill
            active={tab === "merch"}
            onClick={() => setTab("merch")}
            icon={<ShoppingBag className="w-4 h-4" />}
            label="Merch"
          />
        </div>
      </div>
    );
  }, [apiOnline, tab]);

  return (
    <div className="w-full">
      {header}

      <div className="mt-6">
        {tab === "game" && (
          <div className="space-y-4">
            <PoolTableGame />
            <div className="text-xs opacity-60">
              Tip: Tap/drag to aim, release to shoot. (Practice mode)
            </div>
          </div>
        )}

        {tab === "tournament" && <Tournaments apiOnline={apiOnline} />}

        {tab === "hall" && <LiveHall apiOnline={apiOnline} />}

        {tab === "merch" && <Merch />}
      </div>
    </div>
  );
}
