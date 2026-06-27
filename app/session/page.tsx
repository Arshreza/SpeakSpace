"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import { ChatRoom } from "@/components/chat-room";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, MicOff, Video, VideoOff, Users } from "lucide-react";

export default function SessionPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const userRole = typeof window !== "undefined" ? localStorage.getItem("speakspace_user_role") || "participant" : "participant";

  useEffect(() => {
    const sessionId = searchParams.get("id");
    if (!sessionId || !user) {
      toast({ title: "Error", description: "Invalid session parameters", variant: "destructive" });
      window.location.href = "/live-sessions";
      return;
    }

    const fetchSession = async () => {
      try {
        const sessionDoc = await getDoc(doc(db, "sessions", sessionId));
        if (!sessionDoc.exists()) throw new Error("Session not found");
        setSession({ id: sessionDoc.id, ...sessionDoc.data() });
        initializeJitsi(sessionId);
      } catch {
        toast({ title: "Error", description: "Failed to load session", variant: "destructive" });
        window.location.href = "/live-sessions";
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [searchParams, user, toast]);

  const initializeJitsi = (roomId: string) => {
    const loadScript = () => new Promise<void>((resolve, reject) => {
      if (typeof (window as any).JitsiMeetExternalAPI !== "undefined") { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });

    let api: any;
    loadScript().then(() => {
      api = new (window as any).JitsiMeetExternalAPI("meet.jit.si", {
        roomName: roomId,
        width: "100%",
        height: "100%",
        parentNode: document.getElementById("jitsi-container"),
        configOverwrite: { startWithAudioMuted: true, startWithVideoMuted: true },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false },
        userInfo: { displayName: user?.name || "Anonymous" },
      });
    }).catch(() => {
      toast({ title: "Error", description: "Failed to load video conference", variant: "destructive" });
    });

    return () => { if (api) api.dispose(); };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading session…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="container mx-auto pt-24 pb-8 px-4">
        {/* Session header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-white">{session?.title || "Session"}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-xs text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Live
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-slate-500 text-xs flex items-center gap-1"><Users className="h-3 w-3" />{session?.participants?.length || 0} participants</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMicOn(v => !v)}
              className={`p-2.5 rounded-xl border transition-all ${micOn ? "bg-slate-800/60 border-white/[0.08] text-white hover:bg-slate-700/60" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            <button onClick={() => setVideoOn(v => !v)}
              className={`p-2.5 rounded-xl border transition-all ${videoOn ? "bg-slate-800/60 border-white/[0.08] text-white hover:bg-slate-700/60" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {videoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </button>
            {userRole === "moderator" && (
              <button className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all flex items-center gap-1.5">
                <MicOff className="h-3.5 w-3.5" /> Mute All
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[580px]">
          {/* Jitsi video */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-white/[0.07] rounded-2xl overflow-hidden">
            <div id="jitsi-container" className="w-full h-full" />
          </div>

          {/* Chat */}
          <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Session Chat</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatRoom sessionId={session?.id || ""} />
            </div>
          </div>
        </div>

        {/* Evaluator scoring panel */}
        {userRole === "evaluator" && (
          <div className="mt-5 bg-slate-900/60 border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Evaluation Panel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["Confidence", "Communication", "Logical Reasoning"].map(criterion => (
                <div key={criterion} className="bg-slate-800/40 border border-white/[0.05] rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-2">{criterion}</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} className="flex-1 h-7 rounded-md bg-slate-700/50 border border-white/[0.06] text-slate-500 text-xs hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-amber-400 transition-all">
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs text-slate-400">Notes</label>
              <textarea rows={2} placeholder="Add evaluation notes…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/40 text-sm resize-none" />
            </div>
            <button className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold shadow-lg shadow-amber-500/20 transition-all">
              Submit Evaluation
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
