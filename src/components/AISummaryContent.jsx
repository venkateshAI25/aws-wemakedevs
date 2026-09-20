import { Sparkles, Target, CheckSquare, Users, ArrowRightCircle, Gavel } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";

function Section({ icon: Icon, title, items, color }) {
  if (!items || !items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} style={{ color }} />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-300">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AISummaryContent({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-5" data-testid="ai-summary-content">
      <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-indigo-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Summary</h4>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{data.summary}</p>
      </div>
      <Section icon={Target} title="Key Points" items={data.keyPoints} color="#3B82F6" />
      <Section icon={Gavel} title="Decisions" items={data.decisions} color="#8B5CF6" />
      <Section icon={CheckSquare} title="Action Items" items={data.actionItems} color="#10B981" />
      <Section icon={ArrowRightCircle} title="Next Steps" items={data.nextSteps} color="#F59E0B" />
      {data.people && data.people.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={15} className="text-gray-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Important People</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.people.map((p) => (
              <span key={p} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 pl-1 pr-3 py-1 text-xs text-gray-200">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p)}&background=6366F1&color=fff&bold=true`} alt={p} className="w-5 h-5 rounded-full" />
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.source && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Source</p>
          <PlatformBadge id={data.source.platform} showName />
          <p className="text-xs text-gray-400 mt-2">
            {data.source.conversation} · Message from {data.source.sender} — {data.source.time}
          </p>
        </div>
      )}
    </div>
  );
}
