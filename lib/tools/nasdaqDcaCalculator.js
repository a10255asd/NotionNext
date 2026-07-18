export const DEFAULT_DCA_INPUT = {
  initialAmount: 20000,
  monthlyAmount: 3000,
  years: 10,
  annualReturnPercent: 10,
  targetAmount: 1000000,
  stressDrawdownPercent: 35
}

const SCENARIO_RETURNS = [5, 8, 10, 12]

const clampFiniteNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const roundCurrency = value => Math.round(clampFiniteNumber(value))

const normalizeInput = input => {
  const merged = { ...DEFAULT_DCA_INPUT, ...input }
  return {
    initialAmount: Math.max(0, clampFiniteNumber(merged.initialAmount)),
    monthlyAmount: Math.max(0, clampFiniteNumber(merged.monthlyAmount)),
    years: Math.min(50, Math.max(1, clampFiniteNumber(merged.years))),
    annualReturnPercent: Math.min(
      50,
      Math.max(-50, clampFiniteNumber(merged.annualReturnPercent))
    ),
    targetAmount: Math.max(0, clampFiniteNumber(merged.targetAmount)),
    stressDrawdownPercent: Math.min(
      80,
      Math.max(0, clampFiniteNumber(merged.stressDrawdownPercent))
    )
  }
}

export const getMonthlyReturnRate = annualReturnPercent => {
  const annualRate = clampFiniteNumber(annualReturnPercent) / 100
  if (annualRate <= -1) {
    return -1
  }
  return Math.pow(1 + annualRate, 1 / 12) - 1
}

export const calculateRequiredMonthlyAmount = ({
  initialAmount,
  targetAmount,
  years,
  annualReturnPercent
}) => {
  const months = Math.max(1, Math.round(clampFiniteNumber(years) * 12))
  const initial = Math.max(0, clampFiniteNumber(initialAmount))
  const target = Math.max(0, clampFiniteNumber(targetAmount))
  const monthlyRate = getMonthlyReturnRate(annualReturnPercent)

  if (target <= initial) {
    return 0
  }

  if (Math.abs(monthlyRate) < 0.0000001) {
    return roundCurrency((target - initial) / months)
  }

  const growth = Math.pow(1 + monthlyRate, months)
  const contributionFactor = (growth - 1) / monthlyRate
  const required = (target - initial * growth) / contributionFactor
  return roundCurrency(Math.max(0, required))
}

const projectDca = normalized => {
  const months = Math.round(normalized.years * 12)
  const monthlyRate = getMonthlyReturnRate(normalized.annualReturnPercent)

  let value = normalized.initialAmount
  let invested = normalized.initialAmount
  const monthlyPoints = [
    {
      month: 0,
      year: 0,
      invested: roundCurrency(invested),
      value: roundCurrency(value),
      profit: roundCurrency(value - invested)
    }
  ]

  for (let month = 1; month <= months; month++) {
    value = value * (1 + monthlyRate) + normalized.monthlyAmount
    invested += normalized.monthlyAmount
    monthlyPoints.push({
      month,
      year: month / 12,
      invested: roundCurrency(invested),
      value: roundCurrency(value),
      profit: roundCurrency(value - invested)
    })
  }

  const yearlyPoints = monthlyPoints.filter(point => {
    return point.month === 0 || point.month % 12 === 0 || point.month === months
  })
  const finalValue = roundCurrency(value)
  const totalInvested = roundCurrency(invested)
  const profit = roundCurrency(finalValue - totalInvested)
  const profitRate = totalInvested > 0 ? profit / totalInvested : 0

  return {
    months,
    monthlyRate,
    totalInvested,
    finalValue,
    profit,
    profitRate,
    monthlyPoints,
    yearlyPoints
  }
}

export const calculateDcaProjection = input => {
  const normalized = normalizeInput(input)
  const projection = projectDca(normalized)
  const stressValue = roundCurrency(
    projection.finalValue * (1 - normalized.stressDrawdownPercent / 100)
  )
  const stressLoss = roundCurrency(projection.finalValue - stressValue)
  const stressProfit = roundCurrency(stressValue - projection.totalInvested)
  const targetMonthlyAmount = calculateRequiredMonthlyAmount(normalized)
  const scenarios = SCENARIO_RETURNS.map(annualReturnPercent => {
    const scenario = projectDca({
      ...normalized,
      annualReturnPercent
    })
    return {
      annualReturnPercent,
      finalValue: scenario.finalValue,
      profit: scenario.profit,
      profitRate: scenario.profitRate
    }
  })

  return {
    input: normalized,
    months: projection.months,
    monthlyRate: projection.monthlyRate,
    totalInvested: projection.totalInvested,
    finalValue: projection.finalValue,
    profit: projection.profit,
    profitRate: projection.profitRate,
    targetMonthlyAmount,
    monthlyPoints: projection.monthlyPoints,
    yearlyPoints: projection.yearlyPoints,
    stress: {
      drawdownPercent: normalized.stressDrawdownPercent,
      value: stressValue,
      loss: stressLoss,
      profit: stressProfit,
      belowCost: stressValue < projection.totalInvested
    },
    scenarios
  }
}
