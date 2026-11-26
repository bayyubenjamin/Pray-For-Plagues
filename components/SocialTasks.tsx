"use client";

import { useEffect, useRef, useState } from "react";
import { SOCIAL_ACTIONS } from "@/lib/social";
import { TASKS } from "@/lib/points";
import { loadSocialDone, markSocialDone } from "@/lib/social-progress";
import { loadWaitlist } from "@/lib/waitlist-local";
import { loadPlayer } from "@/lib/points";

type Task = { id: string; label: string; href: string; points: number };

const HINTS: Record<string, string> = Object.fromEntries(TASKS.map((t) => [t.id, t.hint]));

export default function SocialTasks({ enabled = false }: { enabled?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>(SOCIAL_ACTIONS);
  const [done, setDone] = useState<string[]>([]);
  const [left, setLeft] = useState<Record<string, number>>({});
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    setDone(loadSocialDone());
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.tasks) && json.tasks.length) setTasks(json.tasks);
      })
      .catch(() => {});
    return () => {
      Object.values(timers.current).forEach((id) => window.clearInterval(id));
    };
  }, []);

  const finish = (id: string) => {
    const next = markSocialDone(id);
    setDone(next);
    setLeft((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    const joined = loadWaitlist().joined;
    const x = loadPlayer().xHandle || loadWaitlist().xHandle;
    if (joined && x) {
      fetch("/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ xHandle: x, tasks: next }),
      }).catch(() => {});
    }
  };

  const start = (task: Task) => {
    if (!enabled || done.includes(task.id) || left[task.id]) return;
    window.open(task.href, "_blank", "noopener,noreferrer");
    setLeft((prev) => ({ ...prev, [task.id]: 10 }));
    let n = 10;
    timers.current[task.id] = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(timers.current[task.id]);
        delete timers.current[task.id];
        finish(task.id);
        return;
      }
      setLeft((prev) => ({ ...prev, [task.id]: n }));
    }, 1000);
  };

  const doneCount = tasks.filter((t) => done.includes(t.id)).length;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-tech text-[10px] tracking-[0.2em] text-zinc-400 mb-1">
        {doneCount}/{tasks.length} DONE — EACH TASK OPENS X, THEN CHECKS AFTER 10S
      </p>
      {tasks.map((action, i) => {
        const cooling = left[action.id];
        const isDone = done.includes(action.id);
        const status = !enabled ? "CONNECT X" : cooling ? `WAIT ${cooling}S` : isDone ? "DONE" : "OPEN";
        return (
          <button
            key={action.id}
            type="button"
            disabled={!enabled || isDone || Boolean(cooling)}
            onClick={() => start(action)}
            className={`w-full flex items-center gap-3 px-4 py-3 border text-left transition-colors disabled:cursor-not-allowed ${
              isDone
                ? "border-green/50 bg-green/5"
                : "border-green/25 hover:border-green/60 hover:bg-darkGreen disabled:opacity-45"
            }`}
          >
            <span className="font-tech text-xs text-zinc-500 shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-tech text-sm tracking-widest text-white">{action.label}</span>
              <span className="block font-tech text-[10px] tracking-widest text-zinc-400 mt-0.5">
                {HINTS[action.id] || ""}
              </span>
            </span>
            <span className="font-tech text-xs tracking-widest text-green shrink-0">+{action.points} PTS</span>
            <span
              className={`font-tech text-[10px] tracking-widest shrink-0 w-[74px] text-right ${
                isDone ? "text-green" : "text-zinc-400"
              }`}
            >
              {status}
            </span>
          </button>
        );
      })}
    </div>
  );
}
