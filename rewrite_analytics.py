import re

with open(r'c:\Apps Custom\Tracker Farid Skuyy\farid-tracker\src\components\analytics\AnalyticsPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace("import { Activity, CalendarDays } from 'lucide-react'", "import { Activity, CalendarDays, TrendingDown } from 'lucide-react'")

# 2. Tooltip
old_tooltip = """function IncomeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 shadow-xl">
      <p className="font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Day {label}</p>
      <p className="font-bold text-emerald-400">Rp {formatRpShort(payload[0]?.value ?? 0)}</p>
    </div>
  )
}"""

new_tooltip = """function IncomeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-xs rounded-2xl px-4 py-3 shadow-2xl">
      <p className="font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest text-[9px]">Day {label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between items-center gap-6 mb-1">
           <span className="font-semibold text-slate-600 dark:text-slate-300 capitalize text-[11px]">{p.name}</span>
           <span style={{ color: p.color }} className="font-extrabold text-[13px]">Rp {formatRpShort(p.value)}</span>
        </div>
      ))}
    </div>
  )
}"""
content = content.replace(old_tooltip, new_tooltip)

# 3. dailyIncomeData
old_daily = """  // Daily income for current month
  const dailyIncomeData = useMemo(() => {
    const dayMap: Record<number, number> = {}
    incomeEntries
      .filter((e) => e.date.startsWith(thisMonthKey))
      .forEach((e) => {
        const d = parseInt(e.date.slice(8, 10), 10)
        const amt = e.type === 'expense' ? -e.amount : e.amount
        dayMap[d] = (dayMap[d] ?? 0) + amt
      })
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: dayMap[i + 1] ?? 0,
    }))
  }, [incomeEntries, thisMonthKey, daysInMonth])"""

new_daily = """  // Daily income for current month
  const dailyIncomeData = useMemo(() => {
    const dayMap: Record<number, { income: number; expense: number }> = {}
    incomeEntries
      .filter((e) => e.date.startsWith(thisMonthKey))
      .forEach((e) => {
        const d = parseInt(e.date.slice(8, 10), 10)
        if (!dayMap[d]) dayMap[d] = { income: 0, expense: 0 }
        if (e.type === 'expense') {
          dayMap[d].expense += e.amount
        } else {
          dayMap[d].income += e.amount
        }
      })
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      income: dayMap[i + 1]?.income ?? 0,
      expense: dayMap[i + 1]?.expense ?? 0,
    }))
  }, [incomeEntries, thisMonthKey, daysInMonth])"""
content = content.replace(old_daily, new_daily)

# 4. monthlyIncomeData
old_monthly = """  // Monthly income 6-month overview
  const monthlyIncomeData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - (5 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const total = incomeEntries
        .filter((e) => e.date.startsWith(key))
        .reduce((s, e) => s + (e.type === 'expense' ? -e.amount : e.amount), 0)
      return {
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
        income: total,
      }
    })
  }, [incomeEntries, year, month])

  const totalThisMonth = dailyIncomeData.reduce((s, d) => s + d.income, 0)
  const gymThisMonth = gymSessions.filter((s) => s.date.startsWith(thisMonthKey) && s.isCompleted).length"""

new_monthly = """  // Monthly income 6-month overview
  const monthlyIncomeData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - (5 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthEntries = incomeEntries.filter((e) => e.date.startsWith(key))
      const income = monthEntries.filter((e) => e.type !== 'expense').reduce((s, e) => s + e.amount, 0)
      const expense = monthEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
      return {
        month: d.toLocaleDateString('id-ID', { month: 'short' }),
        income,
        expense,
      }
    })
  }, [incomeEntries, year, month])

  const totalThisMonth = dailyIncomeData.reduce((s, d) => s + d.income, 0)
  const totalExpenseThisMonth = dailyIncomeData.reduce((s, d) => s + d.expense, 0)
  const gymThisMonth = gymSessions.filter((s) => s.date.startsWith(thisMonthKey) && s.isCompleted).length"""
content = content.replace(old_monthly, new_monthly)

# 5. Hero Card
old_hero = """             {/* Income Section */}
             <div>
                <p className="text-white/80 text-[11px] font-semibold mb-1 uppercase tracking-wider">Total Income This Month</p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-lg">Rp {formatRp(totalThisMonth)}</h3>
             </div>"""
new_hero = """             {/* Income Section */}
             <div>
                <p className="text-white/80 text-[11px] font-semibold mb-1 uppercase tracking-wider">Total Income This Month</p>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-lg mb-3">Rp {formatRp(totalThisMonth)}</h3>
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/10 shadow-sm">
                   <TrendingDown size={14} className="text-rose-300" />
                   <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Expense: Rp {formatRpShort(totalExpenseThisMonth)}</span>
                </div>
             </div>"""
content = content.replace(old_hero, new_hero)

# 6. Charts Section
charts_regex = re.compile(r'\{\/\* ─── CHART 1: Income Deep Dive ─── \*\/\}.*?\{\/\* ─── CHART 4: 6-Month Income Bar ─── \*\/\}.*?</div>\s*</div>', re.DOTALL)

new_charts = """{/* ─── CHART 1: Income Deep Dive ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Income vs Expense
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
            Daily trend – {new Date(viewYear, viewMonth, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="h-56 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hasAnyData ? dailyIncomeData : DEMO_INCOME_DATA}
              margin={{ top: 10, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                tickFormatter={(v) => v % 5 === 0 || v === 1 ? String(v) : ''}
                interval={0}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(v) => v > 0 ? formatRpShort(v).replace('Rp ', '') : '0'}
                width={36}
              />
              <Tooltip content={<IncomeTooltip />} cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#34d399"
                strokeWidth={3}
                fill="url(#incomeGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#f43f5e"
                strokeWidth={3}
                fill="url(#expenseGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ─── CHART 2: Task Completion Donut ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Productivity Rate</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Task completion – this month</p>
        </div>
        <div className="flex items-center px-5 pb-5 gap-6">
          <div className="w-36 h-36 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  dataKey="value"
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                  label={({ cx, cy }) => <DonutLabel cx={cx} cy={cy} rate={taskCompletionRate} />}
                  labelLine={false}
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">This Month</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 shadow-sm" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Completed</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {doneTasks.length > 0 ? doneTasks.length : 74}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700 shadow-sm" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Remaining</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {monthTasks.length > 0 ? monthTasks.length - doneTasks.length : 26}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Tasks</span>
                    <span className="text-xs font-black text-blue-500">
                      {monthTasks.length > 0 ? monthTasks.length : 100}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── CHART 3: Gym & Schedule Overview ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Gym & Schedule Overview
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Monthly consistency – last 6 weeks</p>
        </div>

        <div className="h-56 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hasAnyData ? weeklyData : DEMO_WEEKLY_DATA}
              margin={{ top: 10, right: 4, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                width={24}
              />
              <Tooltip content={<GymTooltip />} cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
              />
              <Bar dataKey="gym" name="Gym Sessions" radius={[6, 6, 0, 0]} barSize={12} animationBegin={200} animationDuration={1000}>
                {(hasAnyData ? weeklyData : DEMO_WEEKLY_DATA).map((_, i) => (
                  <Cell key={i} fill="#F97316" />
                ))}
              </Bar>
              <Bar dataKey="tasks" name="Tasks Done" radius={[6, 6, 0, 0]} barSize={12} animationBegin={400} animationDuration={1000}>
                {(hasAnyData ? weeklyData : DEMO_WEEKLY_DATA).map((_, i) => (
                  <Cell key={i} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ─── CHART 4: 6-Month Income Bar ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-slate-200/60 dark:border-[#334155]/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-xl transition-shadow duration-300"
      >
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">6-Month Income Trend</h3>
          <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">Monthly totals (Net & Expense)</p>
        </div>
        <div className="h-48 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyIncomeData} margin={{ top: 10, right: 4, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(v) => v > 0 ? formatRpShort(v).replace('Rp ', '') : '0'} width={36} />
              <Tooltip content={<IncomeTooltip />} cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
              />
              <Bar dataKey="income" name="Income" radius={[4, 4, 0, 0]} barSize={10} animationBegin={300} animationDuration={1000}>
                {monthlyIncomeData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.month === new Date().toLocaleDateString('id-ID', { month: 'short' }) ? '#10b981' : '#34d399'}
                  />
                ))}
              </Bar>
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={10} animationBegin={500} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>"""

content = charts_regex.sub(new_charts, content)

# 7. Demo Data fix
old_demo = """const DEMO_INCOME_DATA = [
  { day: 1, income: 1200000 }, { day: 2, income: 800000 }, { day: 3, income: 2100000 },
  { day: 4, income: 500000 }, { day: 5, income: 3400000 }, { day: 6, income: 900000 },
  { day: 7, income: 1800000 }, { day: 8, income: 600000 }, { day: 9, income: 2700000 },
  { day: 10, income: 1100000 }, { day: 11, income: 4200000 }, { day: 12, income: 800000 },
  { day: 13, income: 1500000 }, { day: 14, income: 3100000 }, { day: 15, income: 700000 },
  { day: 16, income: 2200000 }, { day: 17, income: 5000000 }, { day: 18, income: 9500000 },
  { day: 19, income: 3800000 }, { day: 20, income: 2100000 }, { day: 21, income: 1400000 },
  { day: 22, income: 800000 }, { day: 23, income: 3200000 }, { day: 24, income: 600000 },
  { day: 25, income: 1900000 }, { day: 26, income: 4100000 }, { day: 27, income: 700000 },
  { day: 28, income: 2800000 }, { day: 29, income: 1300000 }, { day: 30, income: 900000 },
]"""

new_demo = """const DEMO_INCOME_DATA = [
  { day: 1, income: 1200000, expense: 200000 }, { day: 2, income: 800000, expense: 50000 }, { day: 3, income: 2100000, expense: 150000 },
  { day: 4, income: 500000, expense: 100000 }, { day: 5, income: 3400000, expense: 800000 }, { day: 6, income: 900000, expense: 300000 },
  { day: 7, income: 1800000, expense: 450000 }, { day: 8, income: 600000, expense: 100000 }, { day: 9, income: 2700000, expense: 1200000 },
  { day: 10, income: 1100000, expense: 200000 }, { day: 11, income: 4200000, expense: 1500000 }, { day: 12, income: 800000, expense: 50000 },
  { day: 13, income: 1500000, expense: 250000 }, { day: 14, income: 3100000, expense: 600000 }, { day: 15, income: 700000, expense: 100000 },
  { day: 16, income: 2200000, expense: 800000 }, { day: 17, income: 5000000, expense: 1200000 }, { day: 18, income: 9500000, expense: 3500000 },
  { day: 19, income: 3800000, expense: 900000 }, { day: 20, income: 2100000, expense: 400000 }, { day: 21, income: 1400000, expense: 200000 },
  { day: 22, income: 800000, expense: 300000 }, { day: 23, income: 3200000, expense: 1100000 }, { day: 24, income: 600000, expense: 150000 },
  { day: 25, income: 1900000, expense: 500000 }, { day: 26, income: 4100000, expense: 1200000 }, { day: 27, income: 700000, expense: 200000 },
  { day: 28, income: 2800000, expense: 800000 }, { day: 29, income: 1300000, expense: 400000 }, { day: 30, income: 900000, expense: 200000 },
]"""
content = content.replace(old_demo, new_demo)

with open(r'c:\Apps Custom\Tracker Farid Skuyy\farid-tracker\src\components\analytics\AnalyticsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done AnalyticsPage.tsx")
