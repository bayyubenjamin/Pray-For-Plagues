"use client";

import { useEffect, useRef, useState } from "react";
import { SOCIAL_ACTIONS } from "@/lib/social";
import { loadSocialDone, markSocialDone } from "@/lib/social-progress";
import { loadWaitlist } from "@/lib/waitlist-local";
import { loadPlayer } from "@/lib/points";

type Task = { id: string; label: string; href: string; points: number };

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

  return (
    <div className="grid grid-cols-2 gap-2">
      {tasks.map((action) => {
        const cooling = left[action.id];
        const isDone = done.includes(action.id);
        return (
          <button
            key={action.id}
            type="button"
            disabled={!enabled || isDone || Boolean(cooling)}
            onClick={() => start(action)}
            className="px-3 py-3 border border-green/40 font-tech text-[10px] tracking-widest text-green text-center hover:bg-darkGreen disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {!enabled && `${action.label} +${action.points}`}
            {enabled && cooling ? `${action.label} ${cooling}s` : null}
            {enabled && !cooling && isDone ? `\u2713 ${action.label}` : null}
            {enabled && !cooling && !isDone ? `${action.label} +${action.points}` : null}
          </button>
        );
      })}
    </div>
  );
}
