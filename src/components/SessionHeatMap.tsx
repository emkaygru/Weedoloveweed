"use client";

interface Props {
  // Array of ISO date strings when sessions occurred
  dates: string[];
}

function getWeekGrid(): { date: Date; label: string }[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back 52 weeks + offset to start on Sunday
  const dayOfWeek = today.getDay(); // 0=Sun
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek - 52 * 7);

  const weeks: { date: Date; label: string }[][] = [];
  let current = new Date(start);

  while (current <= today) {
    const week: { date: Date; label: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(current);
      const label = day.toISOString().split("T")[0];
      week.push({ date: day, label });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function SessionHeatMap({ dates }: Props) {
  const countMap = new Map<string, number>();
  for (const d of dates) {
    const key = d.split("T")[0];
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const weeks = getWeekGrid();

  const getColor = (count: number) => {
    if (count === 0) return "bg-card-border/40";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/55";
    if (count === 3) return "bg-primary/75";
    return "bg-primary";
  };

  // Month label positions — find first week of each month
  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const month = week[0].date.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ index: i, label: MONTH_LABELS[month] });
      lastMonth = month;
    }
  });

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="relative mb-1 flex" style={{ paddingLeft: "20px" }}>
        {monthLabels.map(({ index, label }) => (
          <span
            key={`${index}-${label}`}
            className="absolute text-[10px] text-muted"
            style={{ left: `${index * 12 + 20}px` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 pr-1 pt-0">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <span key={i} className="h-2.5 text-[9px] leading-none text-muted">
              {i % 2 === 1 ? d : ""}
            </span>
          ))}
        </div>

        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map(({ label }) => {
              const count = countMap.get(label) ?? 0;
              const isToday = label === new Date().toISOString().split("T")[0];
              return (
                <div
                  key={label}
                  title={count > 0 ? `${label}: ${count} session${count > 1 ? "s" : ""}` : label}
                  className={`h-2.5 w-2.5 rounded-sm ${getColor(count)} ${isToday ? "ring-1 ring-primary" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-muted">Less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <div key={n} className={`h-2.5 w-2.5 rounded-sm ${getColor(n)}`} />
        ))}
        <span className="text-[10px] text-muted">More</span>
      </div>
    </div>
  );
}
