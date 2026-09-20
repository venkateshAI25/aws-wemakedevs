import { platform } from "@/data/platformMeta";

export function PlatformBadge({ id, size = "sm", showName = false, dot = false }) {
  const p = platform(id);
  const Icon = p.icon;
  const dims = size === "lg" ? "w-11 h-11" : size === "md" ? "w-9 h-9" : "w-7 h-7";
  const iconSize = size === "lg" ? 22 : size === "md" ? 18 : 14;
  return (
    <div className="flex items-center gap-2" data-testid={`platform-badge-${id}`}>
      <div
        className={`${dims} rounded-xl flex items-center justify-center shrink-0`}
        style={{ background: `${p.color}22`, border: `1px solid ${p.color}55` }}
      >
        <Icon size={iconSize} style={{ color: p.color }} />
      </div>
      {showName && <span className="text-sm text-gray-200">{p.name}</span>}
      {dot && <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />}
    </div>
  );
}

export function PlatformDot({ id }) {
  const p = platform(id);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
      {p.name}
    </span>
  );
}
