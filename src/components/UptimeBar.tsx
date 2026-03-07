import { useTranslation } from "react-i18next";

interface DayData {
  day: string;
  total: number;
  up: number;
}

interface UptimeBarProps {
  history: DayData[];
  days?: number;
}

function getColor(uptime: number) {
  if (uptime === 100) return "#22c55e";
  if (uptime >= 90) return "#f59e0b";
  if (uptime > 0) return "#ef4444";
  return "#374151";
}

function formatDate(day: string) {
  return new Date(day).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function UptimeBar({ history, days = 90 }: UptimeBarProps) {
  const { t } = useTranslation();

  const filledDays = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const day = date.toISOString().split("T")[0];
    const found = history?.find((h) => h.day?.toString().startsWith(day));
    return found
      ? {
          day,
          uptime: Math.round((Number(found.up) / Number(found.total)) * 100),
        }
      : { day, uptime: -1 };
  });

  return (
    <div className="w-full">
      <div className="flex gap-px">
        {filledDays.map(({ day, uptime }) => (
          <div
            key={day}
            className="group relative flex-1 h-8 rounded-sm cursor-default transition-opacity hover:opacity-80"
            style={{ background: uptime === -1 ? "#1f2937" : getColor(uptime) }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-[#1f2937] border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                <p className="text-gray-400 mb-0.5">{formatDate(day)}</p>
                <p className="text-white font-medium">
                  {uptime === -1
                    ? t("uptime_bar.without")
                    : `${uptime}% uptime`}
                </p>
              </div>
              <div className="w-2 h-2 bg-[#1f2937] border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-gray-600 text-xs">
          {t("uptime_bar.days_ago")}
        </span>
        <span className="text-gray-600 text-xs">{t("uptime_bar.today")}</span>
      </div>
    </div>
  );
}
