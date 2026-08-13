import SectionTitle from "@/components/SectionTitle";
import { LEADERBOARD_DATA } from "@/lib/mockData";

export default function LeaderboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SectionTitle title="ANTIDOTE LEADERBOARD" subtitle="TOP ANTIDOTES" />

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["GLOBAL", "PURITY", "POTENCY", "STABILITY"].map((tab, idx) => (
          <button 
            key={tab}
            className={`px-8 py-3 font-tech text-sm tracking-widest uppercase whitespace-nowrap transition-colors ${
              idx === 0 ? "bg-green text-black" : "bg-black border border-green/30 text-gray hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="panel-border bg-deep/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-tech">
            <thead>
              <tr className="border-b border-green/30 bg-darkGreen text-gray text-xs tracking-widest uppercase">
                <th className="px-6 py-4">RANK</th>
                <th className="px-6 py-4">ANTIDOTE</th>
                <th className="px-6 py-4">SCORE</th>
                <th className="px-6 py-4">LEVEL</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD_DATA.map((row) => (
                <tr 
                  key={row.id} 
                  className="border-b border-green/10 hover:bg-darkGreen/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className={`text-lg ${row.rank <= 3 ? "text-green font-bold text-glow" : "text-white"}`}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-8 bg-black border border-green/50 flex items-center justify-center">
                         <span className="text-[8px] text-green rotate-90">☣</span>
                      </div>
                      <span className="text-white tracking-widest group-hover:text-green transition-colors">
                        #{row.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white tracking-wider">
                    {row.score.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-green">
                    {row.level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button className="px-8 py-3 border border-green/50 text-green font-tech uppercase text-sm tracking-[0.2em] hover:bg-green/10 transition-colors">
          VIEW FULL LEADERBOARD
        </button>
      </div>
    </div>
  );
}
