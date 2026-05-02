import { z } from 'zod'
import { isValid, parseISO } from 'date-fns'

export const DateSchema = z.string().refine(
  (val) => isValid(parseISO(val)),
  { message: 'Invalid date. Expected YYYY-MM-DD.' }
)

export const TransactionSchema = z.object({
  date: DateSchema,
  amount: z.number()
    .positive({ message: 'Amount must be greater than 0' }),
  type: z.enum(['expense', 'income']),
  categoryId: z.string().min(1, 'Category is required'),
  note: z.string(),
})

export const DebtSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  balance: z.number().positive('Balance must be greater than 0'),
  apr: z.number().min(0, 'APR cannot be negative').max(100, 'APR seems too high'),
  minPayment: z.number().positive('Minimum payment must be greater than 0'),
})

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currency: z.string().min(1, 'Currency symbol is required').max(3),
})

export const BackupSchema = z.object({}).passthrough()

export const ThemeFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  tokens: z.record(z.string(), z.string()),
})

export type TransactionFormValues = z.infer<typeof TransactionSchema>
export type DebtFormValues = z.infer<typeof DebtSchema>
export type ProfileFormValues = z.infer<typeof ProfileSchema>
