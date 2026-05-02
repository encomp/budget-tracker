import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { animate } from 'motion/react'
import { db } from '../lib/db'
import { Settings } from '../lib/settings'
import { ONBOARDING_CATEGORIES } from '../lib/defaults'
import { clampAllocationSliders, calculateAllocation } from '../lib/calculations'
import { hydrateCSVSeed } from '../lib/csv/categorize'
import { ProfileSchema } from '../lib/schemas'
import { getMotionConfig } from '../lib/animation'
import type { BpCategory } from '../types'
import type { Breakpoint } from '../hooks/useBreakpoint'

interface OnboardingProps {
  breakpoint: Breakpoint
  onComplete: () => void
}

type Step = 'A' | 'B' | 'C'

const MIDNIGHT_SWATCHES = [
  { label: 'Background', color: '#040810' },
  { label: 'Surface', color: '#070d1a' },
  { label: 'Accent', color: '#14b8a6' },
  { label: 'Positive', color: '#14b8a6' },
  { label: 'Warning', color: '#f59e0b' },
  { label: 'Danger', color: '#ef4444' },
]

export function Onboarding({ breakpoint, onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('A')

  // Step A state
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('$')
  const [nameError, setNameError] = useState('')
  const [currencyError, setCurrencyError] = useState('')

  // Step B state
  const [income, setIncome] = useState('')
  const [allocation, setAllocation] = useState({ needs: 50, wants: 30, savings: 20 })

  const stepRef = useRef<HTMLDivElement>(null)

  async function animateTransition(nextStep: Step) {
    const cfg = getMotionConfig()
    if (stepRef.current) {
      await animate(stepRef.current, { opacity: 0, x: -40 }, { duration: cfg.duration, ease: cfg.ease })
    }
    setStep(nextStep)
    requestAnimationFrame(() => {
      if (stepRef.current) {
        animate(stepRef.current, { opacity: [0, 1], x: [40, 0] }, { duration: cfg.duration, ease: cfg.ease })
      }
    })
  }

  async function handleStepA() {
    const result = ProfileSchema.safeParse({ name, currency })
    if (!result.success) {
      const issues = result.error.flatten().fieldErrors
      setNameError(issues.name?.[0] ?? '')
      setCurrencyError(issues.currency?.[0] ?? '')
      return
    }
    setNameError('')
    setCurrencyError('')
    await db.profile.add({ name, currency, createdAt: format(new Date(), 'yyyy-MM-dd') })
    animateTransition('B')
  }

  async function handleStepB() {
    const monthlyIncome = parseFloat(income) || 0
    const currentMonth = format(new Date(), 'yyyy-MM')

    const categories: BpCategory[] = ONBOARDING_CATEGORIES.map(c => ({
      id: crypto.randomUUID(),
      name: c.name,
      group: c.group,
    }))

    const categoryLimits = categories.map(c => ({ categoryId: c.id, limit: 0 }))

    await db.budgets.add({
      month: currentMonth,
      monthlyIncome,
      allocation,
      categoryLimits,
      categories,
    })

    const seedMap = hydrateCSVSeed(categories)
    const seedEntries = Object.entries(seedMap).map(([k, v]) => ({
      normalizedDescription: k,
      categoryId: v,
    }))
    if (seedEntries.length > 0) {
      await db.csvCategoryMap.bulkPut(seedEntries)
    }

    animateTransition('C')
  }

  async function handleComplete() {
    await Settings.set('onboardingCompleted', true)
    onComplete()
  }

  function moveSlider(changed: 'needs' | 'wants' | 'savings', value: number) {
    setAllocation(prev => clampAllocationSliders(changed, value, prev))
  }

  const incomeNum = parseFloat(income) || 0
  const amounts = calculateAllocation(incomeNum, allocation)

  const isMobile = breakpoint === 'mobile'

  const cardStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        inset: 0,
        background: 'var(--bp-bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        paddingBottom: '100px',
        overflowY: 'auto',
      }
    : {
        width: breakpoint === 'tablet' ? '90%' : '800px',
        maxHeight: '90vh',
        background: 'var(--bp-bg-surface)',
        borderRadius: 'var(--bp-radius-lg)',
        border: '1px solid var(--bp-border)',
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        overflowY: 'auto',
      }

  const overlayStyle: React.CSSProperties = isMobile
    ? {}
    : {
        position: 'fixed',
        inset: 0,
        background: 'var(--bp-bg-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }

  const steps: Step[] = ['A', 'B', 'C']

  return (
    <div data-testid="onboarding-modal" style={overlayStyle}>
      <div style={cardStyle}>
        {/* Dot stepper */}
        <div data-testid="onboarding-step-indicator" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {steps.map(s => (
            <div
              key={s}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: s === step ? 'var(--bp-accent)' : 'var(--bp-border-strong)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <div ref={stepRef}>
          {step === 'A' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--bp-text-primary)', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                  Set Your Foundation
                </h2>
                <p style={{ color: 'var(--bp-text-secondary)', marginTop: '0.5rem' }}>
                  Tell us about yourself to get started.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--bp-text-secondary)', fontSize: '0.875rem' }}>Your name</label>
                <input
                  data-testid="onboarding-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  style={inputStyle}
                />
                {nameError && <span style={{ color: 'var(--bp-danger)', fontSize: '0.8rem' }}>{nameError}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--bp-text-secondary)', fontSize: '0.875rem' }}>Currency symbol</label>
                <input
                  data-testid="onboarding-currency"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  placeholder="$"
                  maxLength={3}
                  style={{ ...inputStyle, width: '80px' }}
                />
                {currencyError && <span style={{ color: 'var(--bp-danger)', fontSize: '0.8rem' }}>{currencyError}</span>}
              </div>

              <button data-testid="onboarding-next" onClick={handleStepA} style={isMobile ? fixedBtnStyle : btnStyle}>
                Next
              </button>
            </div>
          )}

          {step === 'B' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--bp-text-primary)', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                  Plan Your Month
                </h2>
                <p style={{ color: 'var(--bp-text-secondary)', marginTop: '0.5rem' }}>
                  Set your income and choose how to split it.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--bp-text-secondary)', fontSize: '0.875rem' }}>Monthly income</label>
                <input
                  data-testid="onboarding-income"
                  type="number"
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  placeholder="5000"
                  style={{ ...inputStyle, fontFamily: 'var(--bp-font-mono)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {(['needs', 'wants', 'savings'] as const).map(key => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <label style={{ color: 'var(--bp-text-secondary)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                        {key}
                      </label>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--bp-text-muted)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--bp-accent)', fontFamily: 'var(--bp-font-mono)' }}>
                          {allocation[key]}%
                        </span>
                        {incomeNum > 0 && (
                          <span style={{ fontFamily: 'var(--bp-font-mono)' }}>
                            {currency}{amounts[key].toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      data-testid={`onboarding-slider-${key}`}
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={allocation[key]}
                      onChange={e => moveSlider(key, Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--bp-accent)', cursor: 'pointer', height: isMobile ? '24px' : '16px' }}
                    />
                  </div>
                ))}
              </div>

              <button data-testid="onboarding-next" onClick={handleStepB} style={isMobile ? fixedBtnStyle : btnStyle}>
                Next
              </button>
            </div>
          )}

          {step === 'C' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--bp-text-primary)', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                  Your dashboard is ready.
                </h2>
                <p style={{ color: 'var(--bp-text-secondary)', marginTop: '0.5rem' }}>
                  The default Midnight theme is applied. You can upload custom theme packs in Settings anytime.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {MIDNIGHT_SWATCHES.map(s => (
                  <div
                    key={s.label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--bp-radius-md)',
                        background: s.color,
                        border: '1px solid var(--bp-border-strong)',
                      }}
                    />
                    <span style={{ color: 'var(--bp-text-muted)', fontSize: '0.65rem' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              <button data-testid="onboarding-finish" onClick={handleComplete} style={isMobile ? fixedBtnStyle : btnStyle}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bp-bg-base)',
  border: '1px solid var(--bp-border)',
  borderRadius: 'var(--bp-radius-sm)',
  color: 'var(--bp-text-primary)',
  padding: '0.625rem 0.875rem',
  fontSize: '0.9rem',
  fontFamily: 'var(--bp-font-ui)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const btnStyle: React.CSSProperties = {
  background: 'var(--bp-accent)',
  color: '#000',
  border: 'none',
  borderRadius: 'var(--bp-radius-md)',
  padding: '0.75rem 2rem',
  fontFamily: 'var(--bp-font-ui)',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
  alignSelf: 'flex-start',
}

const fixedBtnStyle: React.CSSProperties = {
  ...btnStyle,
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  right: '16px',
  alignSelf: 'unset',
  borderRadius: 'var(--bp-radius-md)',
  padding: '1rem',
  fontSize: '1.05rem',
}
