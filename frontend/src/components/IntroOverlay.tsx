import React, { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "playbetter_intro_seen_v1";

export default function IntroOverlay() {
  const [show, setShow] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY) === "1";
      if (!seen) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
      setShow(false);
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-auto"
            src="/intro/intro.mp4"
            autoPlay
            muted
            playsInline
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-white/70">
          <span>By: FanzofTheOne</span>
          <button
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
            onClick={() => {
              try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
              setShow(false);
              // attempt stop
              try { videoRef.current?.pause(); } catch {}
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
