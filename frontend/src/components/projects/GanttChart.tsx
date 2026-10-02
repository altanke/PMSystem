import React, { useMemo, useState, useEffect } from 'react';
import type { Task } from '../../api/projectApi';
import { calendarApi } from '../../api/calendarApi';
import { Calendar } from 'lucide-react';

interface GanttChartProps {
    tasks: Task[];
}

const LABEL_WIDTH = 156;
const DURATION_WIDTH = 72;

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

const START_HOURS = 9;
const END_HOURS = 18;
const WORK_HOURS = END_HOURS - START_HOURS;

function fmtDt(iso: string): string {
    const d = new Date(iso);
    return `${DAY_NAMES[d.getDay()]} ${d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtAxisLabel(dt: Date): string {
    return dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
    const [publicHolidays, setPublicHolidays] = useState<Set<string>>(new Set());

    useEffect(() => {
        const year = new Date().getFullYear();
        calendarApi.getPublicHolidays(year)
            .then(list => setPublicHolidays(new Set(list)))
            .catch(() => setPublicHolidays(new Set()));
    }, []);

    const calcTasks = tasks.filter(t => t.earlyStartDt && t.earlyFinishDt);

    const hourModeTasks = tasks.filter(t => (t.earlyFinish ?? 0) > 0 && !t.earlyStartDt);
    const useDatetimeMode = calcTasks.length > 0;

    const { minMs, maxMs } = useMemo(() => {
        if (!useDatetimeMode) return { minMs: 0, maxMs: 0 };
        const starts = calcTasks.map(t => new Date(t.earlyStartDt!).getTime());
        const ends   = calcTasks.map(t => new Date(t.earlyFinishDt!).getTime());

        const minD = new Date(Math.min(...starts));
        minD.setHours(0, 0, 0, 0);

        const maxD = new Date(Math.max(...ends));
        maxD.setHours(23, 59, 59, 999);

        return { minMs: minD.getTime(), maxMs: maxD.getTime() };
    }, [calcTasks, useDatetimeMode]);

    const getVirtualTime = useMemo(() => (timeMs: number) => {
        const d = new Date(timeMs);
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const minDayStart = new Date(minMs).setHours(0, 0, 0, 0);

        const dayIndex = Math.round((startOfDay - minDayStart) / 86400000);

        const h = d.getHours() + d.getMinutes() / 60;
        let fraction = 0;
        if (h < START_HOURS) fraction = 0;
        else if (h > END_HOURS) fraction = 1;
        else fraction = (h - START_HOURS) / WORK_HOURS;

        return dayIndex + fraction;
    }, [minMs]);

    const spanUnits = useMemo(() => {
        return useDatetimeMode ? getVirtualTime(maxMs) : 0;
    }, [getVirtualTime, maxMs, useDatetimeMode]);

    const ticks = useMemo((): { list: Date[] } => {
        if (!useDatetimeMode) return { list: [] };
        const list: Date[] = [];

        let cursor = new Date(minMs);
        const end = new Date(maxMs);
        let guard = 0;
        while (cursor <= end && guard++ < 300) {
            list.push(new Date(cursor));
            cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
        }
        return { list };
    }, [minMs, maxMs, useDatetimeMode]);

    const nonWorkingBands = useMemo((): { leftPct: number; widthPct: number }[] => {
        if (!useDatetimeMode || spanUnits === 0) return [];
        const bands: { leftPct: number; widthPct: number }[] = [];

        let cursor = new Date(minMs);
        const end = new Date(maxMs);
        let guard = 0;

        while (cursor <= end && guard++ < 3000) {
            const dow = cursor.getDay();
            const y = cursor.getFullYear();
            const m = String(cursor.getMonth() + 1).padStart(2, '0');
            const d = String(cursor.getDate()).padStart(2, '0');
            const iso = `${y}-${m}-${d}`;

            const isWeekend = dow === 0 || dow === 6;
            const isHoliday = publicHolidays.has(iso);

            if (isWeekend || isHoliday) {
                const dayVirtualStart = getVirtualTime(cursor.getTime());

                bands.push({
                    leftPct: (dayVirtualStart / spanUnits) * 100,
                    widthPct: (1 / spanUnits) * 100,
                });
            }
            cursor = new Date(y, cursor.getMonth(), cursor.getDate() + 1);
        }
        return bands;
    }, [minMs, maxMs, useDatetimeMode, publicHolidays, getVirtualTime, spanUnits]);

    if (!useDatetimeMode && hourModeTasks.length === 0) return null;

    if (!useDatetimeMode) {
        const maxDuration = Math.max(...hourModeTasks.map(t => t.earlyFinish ?? 0), 0);
        if (maxDuration === 0) return null;
        const offsetTicks: number[] = [];
        const step = Math.ceil(maxDuration / 6);
        for (let v = 0; v <= maxDuration; v += step) offsetTicks.push(v);
        if (offsetTicks[offsetTicks.length - 1] !== maxDuration) offsetTicks.push(maxDuration);

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <h2 className="text-base font-semibold text-gray-800">Диаграмма Ганта</h2>
                    <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Рассчитайте CPM для отображения календарных дат</span>
                </div>
                <div className="p-6 flex flex-col gap-2">
                    {hourModeTasks.map(task => {
                        const idx = tasks.indexOf(task);
                        const es = task.earlyStart ?? 0;
                        const ef = task.earlyFinish ?? 0;
                        const dur = ef - es;
                        const isCrit = task.slack === 0;
                        return (
                            <div key={task.id} className="flex items-center gap-3 group">
                                <div style={{ width: LABEL_WIDTH - 12 }} className="shrink-0 text-right">
                                    <span className={`text-xs font-medium truncate block ${isCrit ? 'text-rose-600' : 'text-gray-600'}`} title={task.name}>
                                        {idx + 1}. {task.name}
                                    </span>
                                </div>
                                <div className="relative flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden">
                                    {offsetTicks.map(t => (
                                        <div key={t} className="absolute top-0 bottom-0 w-px bg-gray-200" style={{ left: `${(t / maxDuration) * 100}%` }} />
                                    ))}
                                    <div
                                        className={`absolute top-1 bottom-1 rounded-md flex items-center px-2 overflow-hidden shadow-sm transition-all group-hover:brightness-110
                                            ${isCrit ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}
                                        style={{ left: `${(es / maxDuration) * 100}%`, width: `${Math.max((dur / maxDuration) * 100, 0.5)}%`, minWidth: '2px' }}
                                    >
                                        <span className="text-white text-[10px] font-semibold truncate select-none">{task.name}</span>
                                    </div>
                                </div>
                                <div style={{ width: DURATION_WIDTH - 12 }} className="shrink-0">
                                    <span className="text-[10px] text-gray-400">{dur}ч</span>
                                </div>
                            </div>
                        );
                    })}
                    <div className="flex items-start gap-3 mt-2">
                        <div style={{ width: LABEL_WIDTH - 12 }} className="shrink-0" />
                        <div className="relative flex-1 h-5">
                            {offsetTicks.map(t => (
                                <div key={t} className="absolute top-0 flex flex-col items-center" style={{ left: `${(t / maxDuration) * 100}%`, transform: 'translateX(-50%)' }}>
                                    <span className="block w-px h-2 bg-gray-300 mb-0.5" />
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{t}ч</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ width: DURATION_WIDTH - 12 }} className="shrink-0" />
                    </div>
                </div>
            </div>
        );
    }

    const toPct = (ms: number) => {
        if (spanUnits === 0) return 0;
        return (getVirtualTime(ms) / spanUnits) * 100;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            {}
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
                <h2 className="text-base font-semibold text-gray-800">Диаграмма Ганта</h2>
                <div className="flex flex-wrap items-center gap-4 ml-auto text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
                        Обычная задача
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-rose-500" />
                        Критическая задача
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-sm bg-gray-200 border border-gray-300" />
                        Нерабочее время
                    </span>
                </div>
            </div>

            <div className="p-6 overflow-x-auto">
                <div style={{ minWidth: Math.max(600, ticks.list.length * 40) }}>
                    {}
                    <div className="flex flex-col gap-2">
                        {calcTasks.map(task => {
                            const idx = tasks.indexOf(task);
                            const startMs = new Date(task.earlyStartDt!).getTime();
                            const endMs   = new Date(task.earlyFinishDt!).getTime();
                            const isCrit  = task.slack === 0;

                            const startU = getVirtualTime(startMs);
                            const endU = getVirtualTime(endMs);

                            const leftPct = (startU / spanUnits) * 100;
                            const widthPct = ((endU - startU) / spanUnits) * 100;

                            const durH = ((endMs - startMs) / 3600000).toFixed(1);

                            let slackWidthPct = 0;
                            if (!isCrit && task.lateFinishDt) {
                                const lfMs = new Date(task.lateFinishDt).getTime();
                                const lfU = getVirtualTime(lfMs);
                                slackWidthPct = ((lfU - startU) / spanUnits) * 100;
                            }

                            return (
                                <div key={task.id} className="flex items-center gap-3 group">
                                    <div style={{ width: LABEL_WIDTH - 12 }} className="shrink-0 text-right">
                                        <span
                                            className={`text-xs font-medium truncate block ${isCrit ? 'text-rose-600' : 'text-gray-600'}`}
                                            title={task.name}
                                        >
                                            {idx + 1}. {task.name}
                                        </span>
                                    </div>

                                    {}
                                    <div className="relative flex-1 h-9 bg-gray-50 rounded-lg overflow-hidden">
                                        {}
                                        {nonWorkingBands.map((b, i) => (
                                            <div key={i} className="absolute top-0 bottom-0 bg-gray-200/55 pointer-events-none"
                                                style={{ left: `${b.leftPct}%`, width: `${b.widthPct}%` }} />
                                        ))}

                                        {}
                                        {ticks.list.map((t, i) => (
                                            <div key={i} className="absolute top-0 bottom-0 w-px bg-gray-200/70 pointer-events-none"
                                                style={{ left: `${toPct(t.getTime())}%` }} />
                                        ))}

                                        {}
                                        {!isCrit && slackWidthPct > 0 && (
                                            <div
                                                className="absolute top-1.5 bottom-1.5 rounded opacity-20 bg-emerald-400"
                                                style={{ left: `${leftPct}%`, width: `${slackWidthPct}%` }}
                                            />
                                        )}

                                        {}
                                        <div
                                            className={`absolute top-1 bottom-1 rounded-md flex items-center px-2 overflow-hidden shadow-sm
                                                group-hover:brightness-110 transition-all duration-200
                                                ${isCrit ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                                                         : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}
                                            style={{
                                                left: `${leftPct}%`,
                                                width: `${Math.max(widthPct, 0.4)}%`,
                                                minWidth: '2px',
                                            }}
                                            title={`${task.name}\nНачало: ${fmtDt(task.earlyStartDt!)}\nОкончание: ${fmtDt(task.earlyFinishDt!)}\nРезерв: ${task.slack ?? '—'}ч`}
                                        >
                                            <span className="text-white text-[10px] font-semibold truncate leading-none select-none">
                                                {task.name}
                                            </span>
                                        </div>
                                    </div>

                                    {}
                                    <div style={{ width: DURATION_WIDTH - 12 }} className="shrink-0">
                                        <span className="text-[10px] text-gray-400 font-medium">{durH}ч</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {}
                    <div className="flex items-start gap-3 mt-1">
                        <div style={{ width: LABEL_WIDTH - 12 }} className="shrink-0" />
                        <div className="relative flex-1 h-7">
                            {ticks.list.map((t, i) => (
                                <div key={i}
                                    className="absolute top-0 flex flex-col items-center"
                                    style={{ left: `${toPct(t.getTime())}%`, transform: 'translateX(-50%)' }}
                                >
                                    <span className="block w-px h-2 bg-gray-300 mb-0.5" />
                                    <span className="text-[9px] text-gray-400 whitespace-nowrap font-medium">
                                        {fmtAxisLabel(t)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{ width: DURATION_WIDTH - 12 }} className="shrink-0" />
                    </div>

                    {}
                    {publicHolidays.size > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                <span className="font-medium">Государственные праздники Беларуси {new Date().getFullYear()}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[...publicHolidays].sort().map(d => (
                                    <span key={d} className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">
                                        {new Date(d + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
