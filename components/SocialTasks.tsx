"use client";

import { useEffect, useState } from "react";
import { completeCustomTask, loadPlayer } from "@/lib/points";
import { SOCIAL_ACTIONS } from "@/lib/social";

type Task = { id: string; label: string; href: string; points: number };

export default function SocialTasks({ enabled }: { enabled: boolean }) {
  const [tasks, setTasks] = useState<Task[]>(SOCIAL_ACTIONS);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.tasks) && json.tasks.length) setTasks(json.tasks);
      })
      .catch(() => {});
  }, []);

  const player = loadPlayer();

  return (
    <div className="grid grid-cols-2 gap-2">
      {tasks.map((action) => {
        const done = player.completed.includes(action.id as never);
        return (
          <button
            key={action.id}
            type="button"
            disabled={!enabled || done}
            onClick={() => {
              window.open(action.href, "_blank", "noopener,noreferrer");
              completeCustomTask(action.id, action.points);
              setTick((n) => n + 1);
            }}
            className="px-3 py-3 border border-green/40 font-tech text-[10px] tracking-widest text-green hover:bg-darkGreen disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {done ? `DONE ${action.label}` : `${action.label} +${action.points}`}
          </button>
        );
      })}
    </div>
  );
}
