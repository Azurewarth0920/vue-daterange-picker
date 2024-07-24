import { Ref } from 'vue'
import { DateFormatterArgs } from './cells'
import { toPaddingNumber } from './utils'

export type Preset = {
  text: string
  modifier: ({ start, end }: { start: Date; end: Date }) => {
    start: Date
    end: Date
  }
}

export type Options = {
  attachElement?: Ref<HTMLElement | null>
  attachDirection?: 'top' | 'left' | 'bottom' | 'right'
  weekOffset?: number
  weekSpan?: {
    from?: number
    to?: number
  }
  fixedSpan?: number
  minSpan?: number
  maxSpan?: number
  unavailable?: { from?: Date; to?: Date }[]
  passive?: true | { applyText?: string; cancelText?: string }
  timeSelection?: true
  timeOptions?: {
    tick?: number
    singleSelect?: false
    span?: {
      from?: {
        hour?: number
        minute?: number
      }
      to?: {
        hour: number
        minute: number
      }
    }
  }
  singleSelect?: boolean
  count?: number
  locale?: string
  type?: 'date' | 'week' | 'month' | 'year'
  formatters?: {
    date?: (payload: DateFormatterArgs) => string
    month?: (payload: { month: number; year: number }) => string
    year?: (payload: { year: number }) => string
  }
  serializer?: (dateString: string) => Date
  deserializer?: (dateObj: Date) => string
  presets?: Preset[]
}

export const defaults = {
  attachDirection: 'bottom',
  count: 2,
  locale: 'en',
  type: 'date',
  weekOffset: 0,
  fixedSpan: 0,
  serializer: (dateString: string) => new Date(dateString),
  deserializer: (dateObj: Date) =>
    `${dateObj.getFullYear()}/${
      dateObj.getMonth() + 1
    }/${dateObj.getDate()} ${toPaddingNumber(
      dateObj.getHours()
    )}:${toPaddingNumber(dateObj.getMinutes())}`,
} as const
