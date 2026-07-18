import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import {
  DEFAULT_DCA_INPUT,
  calculateDcaProjection
} from '@/lib/tools/nasdaqDcaCalculator'
import {
  IconAlertTriangle,
  IconCalculator,
  IconChartLine,
  IconRefresh,
  IconTargetArrow,
  IconTrendingUp
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'

const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0
})

const compactCurrencyFormatter = new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  maximumFractionDigits: 1
})

const percentFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  maximumFractionDigits: 1
})

const formatCurrency = value => currencyFormatter.format(value || 0)
const formatCompactCurrency = value => `¥${compactCurrencyFormatter.format(value || 0)}`
const formatPercent = value => percentFormatter.format(value || 0)
const formatYear = value => {
  return Number.isInteger(value) ? value : value.toFixed(1)
}

const fieldConfig = [
  {
    key: 'initialAmount',
    label: '初始本金',
    min: 0,
    max: 2000000,
    step: 1000,
    suffix: '元'
  },
  {
    key: 'monthlyAmount',
    label: '每月定投',
    min: 0,
    max: 100000,
    step: 500,
    suffix: '元'
  },
  {
    key: 'years',
    label: '定投年限',
    min: 1,
    max: 40,
    step: 1,
    suffix: '年'
  },
  {
    key: 'targetAmount',
    label: '目标资产',
    min: 0,
    max: 10000000,
    step: 10000,
    suffix: '元'
  }
]

const NumberField = ({ config, value, onChange }) => {
  return (
    <label className='block'>
      <span className='mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200'>
        <span>{config.label}</span>
        <span className='text-xs text-gray-500 dark:text-gray-400'>{config.suffix}</span>
      </span>
      <input
        className='h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900'
        type='number'
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={event => onChange(config.key, event.target.value)}
      />
    </label>
  )
}

const RangeField = ({ label, value, min, max, step, suffix, onChange }) => {
  return (
    <label className='block'>
      <span className='mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-200'>
        <span>{label}</span>
        <span className='text-sm tabular-nums text-gray-900 dark:text-gray-100'>
          {value}
          {suffix}
        </span>
      </span>
      <input
        className='h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-emerald-600 dark:bg-gray-800'
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  )
}

const StatCard = ({ label, value, hint, tone = 'neutral' }) => {
  const toneClass = {
    neutral: 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
    profit: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
  }[tone]

  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <div className='text-sm text-gray-500 dark:text-gray-400'>{label}</div>
      <div className='mt-2 text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50'>
        {value}
      </div>
      {hint && <div className='mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400'>{hint}</div>}
    </div>
  )
}

const buildPath = ({ points, getValue, width, height, padding }) => {
  if (!points.length) {
    return ''
  }

  const values = points.flatMap(point => [point.value, point.invested])
  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(...values, 1)
  const xRange = Math.max(1, points.length - 1)
  const yRange = Math.max(1, maxValue - minValue)

  return points.map((point, index) => {
    const x = padding + (index / xRange) * (width - padding * 2)
    const y =
      height -
      padding -
      ((getValue(point) - minValue) / yRange) * (height - padding * 2)
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(' ')
}

const ProjectionChart = ({ points }) => {
  const width = 720
  const height = 280
  const padding = 28
  const valuePath = buildPath({
    points,
    getValue: point => point.value,
    width,
    height,
    padding
  })
  const investedPath = buildPath({
    points,
    getValue: point => point.invested,
    width,
    height,
    padding
  })

  return (
    <div className='rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <div className='text-sm font-semibold text-gray-950 dark:text-gray-50'>资产增长曲线</div>
          <div className='text-xs text-gray-500 dark:text-gray-400'>绿色为预计资产，灰色为累计投入</div>
        </div>
        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
          <span className='flex items-center gap-1'>
            <span className='h-2 w-2 rounded-full bg-emerald-500' />
            预计资产
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-2 w-2 rounded-full bg-gray-400' />
            累计投入
          </span>
        </div>
      </div>
      <svg
        className='h-72 w-full overflow-visible'
        viewBox={`0 0 ${width} ${height}`}
        role='img'
        aria-label='定投资产增长曲线'>
        {[0, 1, 2, 3].map(item => {
          const y = padding + item * ((height - padding * 2) / 3)
          return (
            <line
              key={item}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke='currentColor'
              className='text-gray-100 dark:text-gray-800'
              strokeWidth='1'
            />
          )
        })}
        <path d={investedPath} fill='none' stroke='#9ca3af' strokeWidth='3' strokeLinecap='round' />
        <path d={valuePath} fill='none' stroke='#10b981' strokeWidth='4' strokeLinecap='round' />
      </svg>
    </div>
  )
}

const ScenarioBars = ({ scenarios }) => {
  const maxValue = Math.max(...scenarios.map(item => item.finalValue), 1)

  return (
    <div className='rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950'>
      <div className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-gray-50'>
        <IconChartLine size={18} stroke={1.8} />
        收益率场景
      </div>
      <div className='space-y-4'>
        {scenarios.map(item => (
          <div key={item.annualReturnPercent} className='grid grid-cols-[48px_1fr_96px] items-center gap-3 text-sm'>
            <div className='font-medium text-gray-700 dark:text-gray-200'>{item.annualReturnPercent}%</div>
            <div className='h-3 rounded-full bg-gray-100 dark:bg-gray-800'>
              <div
                className='h-3 rounded-full bg-emerald-500'
                style={{ width: `${Math.max(4, (item.finalValue / maxValue) * 100)}%` }}
              />
            </div>
            <div className='text-right tabular-nums text-gray-700 dark:text-gray-200'>
              {formatCompactCurrency(item.finalValue)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const YearlyTable = ({ points }) => {
  return (
    <div className='overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950'>
      <div className='border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-950 dark:border-gray-800 dark:text-gray-50'>
        年度节点
      </div>
      <div className='max-h-80 overflow-auto'>
        <table className='w-full min-w-[560px] text-sm'>
          <thead className='sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400'>
            <tr>
              <th className='px-4 py-3 font-medium'>年份</th>
              <th className='px-4 py-3 font-medium'>累计投入</th>
              <th className='px-4 py-3 font-medium'>预计资产</th>
              <th className='px-4 py-3 font-medium'>预计收益</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {points.map(point => (
              <tr key={point.month}>
                <td className='px-4 py-3 text-gray-700 dark:text-gray-200'>第 {formatYear(point.year)} 年</td>
                <td className='px-4 py-3 tabular-nums text-gray-700 dark:text-gray-200'>{formatCurrency(point.invested)}</td>
                <td className='px-4 py-3 tabular-nums font-medium text-gray-950 dark:text-gray-50'>{formatCurrency(point.value)}</td>
                <td className={`px-4 py-3 tabular-nums ${point.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(point.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const NasdaqDcaCalculator = () => {
  const [form, setForm] = useState(DEFAULT_DCA_INPUT)
  const result = useMemo(() => calculateDcaProjection(form), [form])

  const handleFieldChange = (key, value) => {
    setForm(current => ({
      ...current,
      [key]: value === '' ? 0 : Number(value)
    }))
  }

  const resetForm = () => {
    setForm(DEFAULT_DCA_INPUT)
  }

  return (
    <main className='mx-auto w-full max-w-6xl pb-10 text-gray-900 dark:text-gray-50'>
      <section className='mb-6 rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950'>
        <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          <div>
            <div className='mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'>
              <IconCalculator size={16} stroke={1.8} />
              Jixue Lab Tools
            </div>
            <h1 className='text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50 md:text-3xl'>
              纳指定投计算器
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300'>
              用每月投入、年化假设和目标金额快速模拟长期定投结果，同时查看压力回撤和不同收益率场景。
            </p>
          </div>
          <button
            type='button'
            onClick={resetForm}
            className='inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-900'
            title='恢复默认参数'>
            <IconRefresh size={18} stroke={1.8} />
            默认参数
          </button>
        </div>
      </section>

      <section className='grid gap-5 lg:grid-cols-[360px_1fr]'>
        <aside className='rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950'>
          <div className='mb-5 flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-gray-50'>
            <IconTargetArrow size={18} stroke={1.8} />
            参数
          </div>
          <div className='space-y-5'>
            {fieldConfig.map(config => (
              <NumberField
                key={config.key}
                config={config}
                value={form[config.key]}
                onChange={handleFieldChange}
              />
            ))}
            <RangeField
              label='预期年化'
              value={form.annualReturnPercent}
              min={-10}
              max={20}
              step={0.5}
              suffix='%'
              onChange={value => handleFieldChange('annualReturnPercent', value)}
            />
            <RangeField
              label='压力回撤'
              value={form.stressDrawdownPercent}
              min={0}
              max={60}
              step={5}
              suffix='%'
              onChange={value => handleFieldChange('stressDrawdownPercent', value)}
            />
          </div>
          <div className='mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'>
            本工具只做情景测算，不构成投资建议。真实市场会受汇率、费用、税费、买入日期和极端波动影响。
          </div>
        </aside>

        <div className='space-y-5'>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <StatCard
              label='累计投入'
              value={formatCurrency(result.totalInvested)}
              hint={`${result.months} 个月，含初始本金`}
            />
            <StatCard
              label='预计资产'
              value={formatCurrency(result.finalValue)}
              hint={`月化约 ${formatPercent(result.monthlyRate)}`}
              tone='profit'
            />
            <StatCard
              label='预计收益'
              value={formatCurrency(result.profit)}
              hint={`投入收益率 ${formatPercent(result.profitRate)}`}
              tone={result.profit >= 0 ? 'profit' : 'amber'}
            />
            <StatCard
              label='目标月投'
              value={formatCurrency(result.targetMonthlyAmount)}
              hint={`${formatCurrency(form.targetAmount)} 目标所需`}
              tone='amber'
            />
          </div>

          <div className='grid gap-5 xl:grid-cols-[1fr_320px]'>
            <ProjectionChart points={result.yearlyPoints} />
            <div className='space-y-5'>
              <div className='rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950'>
                <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-gray-50'>
                  <IconAlertTriangle size={18} stroke={1.8} />
                  压力测试
                </div>
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between gap-4'>
                    <span className='text-gray-500 dark:text-gray-400'>回撤后资产</span>
                    <span className='font-medium tabular-nums text-gray-950 dark:text-gray-50'>{formatCurrency(result.stress.value)}</span>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <span className='text-gray-500 dark:text-gray-400'>账面减少</span>
                    <span className='font-medium tabular-nums text-rose-600 dark:text-rose-400'>{formatCurrency(result.stress.loss)}</span>
                  </div>
                  <div className='flex justify-between gap-4'>
                    <span className='text-gray-500 dark:text-gray-400'>相对本金</span>
                    <span className={`font-medium tabular-nums ${result.stress.belowCost ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatCurrency(result.stress.profit)}
                    </span>
                  </div>
                </div>
              </div>
              <ScenarioBars scenarios={result.scenarios} />
            </div>
          </div>

          <div className='grid gap-5 xl:grid-cols-[320px_1fr]'>
            <div className='rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950'>
              <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-950 dark:text-gray-50'>
                <IconTrendingUp size={18} stroke={1.8} />
                计划摘要
              </div>
              <div className='space-y-3 text-sm text-gray-600 dark:text-gray-300'>
                <p>
                  每月投入 {formatCurrency(form.monthlyAmount)}，持续 {form.years} 年。
                </p>
                <p>
                  在 {form.annualReturnPercent}% 年化假设下，预计收益约 {formatCurrency(result.profit)}。
                </p>
                <p>
                  如果目标是 {formatCurrency(form.targetAmount)}，当前假设下每月约需投入 {formatCurrency(result.targetMonthlyAmount)}。
                </p>
              </div>
            </div>
            <YearlyTable points={result.yearlyPoints} />
          </div>
        </div>
      </section>
    </main>
  )
}

export async function getStaticProps({ locale }) {
  const props = (await fetchGlobalAllData({ from: 'tool-nasdaq-dca', locale })) || {}
  delete props.allPages

  return {
    props: {
      ...props,
      post: {
        title: '纳指定投计算器',
        summary: '模拟纳指长期定投的累计投入、预计资产、目标月投和压力回撤。',
        slug: 'tools/nasdaq-dca-calculator',
        type: 'Page',
        pageCover: props.siteInfo?.pageCover,
        pageCoverThumbnail: props.siteInfo?.pageCover
      }
    },
    revalidate: 3600
  }
}

export default NasdaqDcaCalculator
