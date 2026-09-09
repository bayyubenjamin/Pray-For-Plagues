"use client";

import { completeTask, loadPlayer, type TaskId } from "@/lib/points";
import { SOCIAL_ACTIONS } from "@/lib/social";
import { useState } from "react";

export default function SocialTasks({ enabled }: { enabled: boolean }) {
  const [, setTick] = useState(0);
  const player = loadPlayer();

  return (
    <div className="grid grid-cols-2 gap-2">
      {SOCIAL_ACTIONS.map((action) => {
        const done = player.completed.includes(action.id as TaskId);
        return (
          <button
            key={action.id}
            type="button"
            disabled={!enabled || done}
            onClick={() => {
              window.open(action.href, "_blank", "noopener,noreferrer");
              completeTask(action.id as TaskId);
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
