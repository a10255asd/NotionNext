import {
  calculateDcaProjection,
  calculateRequiredMonthlyAmount,
  getMonthlyReturnRate
} from '@/lib/tools/nasdaqDcaCalculator'

describe('nasdaqDcaCalculator', () => {
  it('projects a zero-return DCA plan as principal only', () => {
    const result = calculateDcaProjection({
      initialAmount: 10000,
      monthlyAmount: 1000,
      years: 2,
      annualReturnPercent: 0,
      targetAmount: 0,
      stressDrawdownPercent: 25
    })

    expect(result.totalInvested).toBe(34000)
    expect(result.finalValue).toBe(34000)
    expect(result.profit).toBe(0)
    expect(result.yearlyPoints).toHaveLength(3)
  })

  it('converts annualized return to an equivalent monthly rate', () => {
    const monthlyRate = getMonthlyReturnRate(12)
    const annualized = Math.pow(1 + monthlyRate, 12) - 1

    expect(annualized).toBeCloseTo(0.12, 8)
  })

  it('calculates required monthly contribution for a target', () => {
    const monthlyAmount = calculateRequiredMonthlyAmount({
      initialAmount: 0,
      targetAmount: 120000,
      years: 10,
      annualReturnPercent: 0
    })

    expect(monthlyAmount).toBe(1000)
  })

  it('supports negative return assumptions without producing invalid values', () => {
    const result = calculateDcaProjection({
      initialAmount: 50000,
      monthlyAmount: 2000,
      years: 5,
      annualReturnPercent: -5,
      targetAmount: 300000,
      stressDrawdownPercent: 30
    })

    expect(Number.isFinite(result.finalValue)).toBe(true)
    expect(result.finalValue).toBeLessThan(result.totalInvested)
    expect(result.targetMonthlyAmount).toBeGreaterThan(0)
  })

  it('reports stress drawdown against the projected final value', () => {
    const result = calculateDcaProjection({
      initialAmount: 10000,
      monthlyAmount: 1000,
      years: 1,
      annualReturnPercent: 0,
      targetAmount: 0,
      stressDrawdownPercent: 40
    })

    expect(result.finalValue).toBe(22000)
    expect(result.stress.value).toBe(13200)
    expect(result.stress.loss).toBe(8800)
    expect(result.stress.belowCost).toBe(true)
  })
})

