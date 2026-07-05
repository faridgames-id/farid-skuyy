// src/components/savings/InvestmentTrendChart.tsx
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useSavingsStore } from '../../store/savingsStore'

function formatRpShort(n: number) {
  return n.toLocaleString('id-ID')
}

interface SavingsTooltipProps { active?: boolean; payload?: any[]; label?: string }

function SavingsTooltip({ active, payload, label }: SavingsTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
          {p.name}: Rp {formatRpShort(p.value ?? 0)}
        </p>
      ))}
    </div>
  )
}



export default function InvestmentTrendChart({ currentMonth }: { currentMonth?: string }) {
  const allEntries = useSavingsStore((s) => s.entries)
  
  const entries = useMemo(() => {
    return currentMonth ? allEntries.filter(e => e.date.startsWith(currentMonth)) : allEntries;
  }, [allEntries, currentMonth]);

  const trendData = useMemo(() => {

    let startDate: Date;
    let endDate: Date;

    if (currentMonth) {
      // currentMonth is 'YYYY-MM'
      const [year, month] = currentMonth.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0); // Last day of month
      const now = new Date();
      if (now < endDate && now.getMonth() === startDate.getMonth() && now.getFullYear() === startDate.getFullYear()) {
        endDate = now; // If it's this month, only show up to today
      }
    } else {
      // Default to last 30 days
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    
    // reset time to 00:00:00 for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    let btcRunning = 0;
    let sbRunning = 0;
    
    // Calculate initial running total from BEFORE the startDate
    allEntries.forEach(e => {
      const d = new Date(e.date + 'T00:00:00');
      if (d < startDate) {
        if (e.assetType === 'bitcoin') btcRunning += e.amount;
        if (e.assetType === 'seabank') sbRunning += e.amount;
      }
    });

    const dataPoints = [];
    const iter = new Date(startDate);
    
    while (iter <= endDate) {
      const dateStr = iter.getFullYear() + '-' + String(iter.getMonth() + 1).padStart(2, '0') + '-' + String(iter.getDate()).padStart(2, '0');
      
      // Find deposits for this exact day
      const dayEntries = allEntries.filter(e => e.date === dateStr);
      dayEntries.forEach(e => {
        if (e.assetType === 'bitcoin') btcRunning += e.amount;
        if (e.assetType === 'seabank') sbRunning += e.amount;
      });

      const shortLabel = iter.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dataPoints.push({ label: shortLabel, bitcoin: btcRunning, seabank: sbRunning });
      
      iter.setDate(iter.getDate() + 1);
    }
    
    // Ensure we have at least 2 points to draw a line
    if (dataPoints.length === 1) {
       dataPoints.push({ ...dataPoints[0], label: 'Now' })
    }

    return dataPoints;
  }, [allEntries, currentMonth]);

  const hasData = entries.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] overflow-hidden"
    >
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Investment & Asset Allocation Trends</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Cumulative Bitcoin vs SeaBank growth
        </p>
      </div>

      <div className="h-56 px-2 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="bitcoinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="seabankGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 9 }}
              tickFormatter={(v) => v > 0 ? formatRpShort(v) : '0'}
              width={32}
            />
            <Tooltip content={<SavingsTooltip />} />
            <Area
              type="monotone"
              dataKey="bitcoin"
              name="Bitcoin"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#bitcoinGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="seabank"
              name="SeaBank"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#seabankGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Bitcoin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">SeaBank</span>
        </div>
      </div>
    </motion.div>
  )
}
