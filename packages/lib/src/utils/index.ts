import { MONTH_A_YEAR, MILLISECOND_A_DAY } from '../constants'
import { Options } from '../options'

export const serializeDate = (date: number | string | Date | null) => {
  const normalizedDate =
    date instanceof Date ? date : date ? new Date(date) : new Date()

  if (normalizedDate.toString() === 'Invalid Date') {
    const today = new Date()
    return today.getFullYear() * MONTH_A_YEAR + today.getMonth()
  } else {
    return (
      normalizedDate.getFullYear() * MONTH_A_YEAR + normalizedDate.getMonth()
    )
  }
}

export const deserializeDate = (date: number) => {
  return {
    year: Math.floor(date / MONTH_A_YEAR),
    month: (date % MONTH_A_YEAR) + 1,
  }
}

export const calculateSpan = (
  payload: number,
  span: number | undefined,
  type: 'date' | 'month' | 'year',
  direction: 1 | -1 = 1,
  offset = 0
): number | undefined => {
  if (span == null) return undefined
  const date = new Date(payload)

  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()

  switch (type) {
    case 'date':
      day += span * direction + offset
      break
    case 'month':
      month += span * direction + offset
      break
    case 'year':
      year += span * direction + offset
      break
  }

  return new Date(year, month, day).getTime()
}

export const calculateFixedSpan = (
  payload: number,
  span: number,
  type: 'month' | 'year' | 'date'
) => {
  const dateObj = new Date(payload)
  const leftOffset = Math.ceil((span - 1) / 2)
  const rightOffset = Math.floor((span - 1) / 2)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth()
  const date = dateObj.getDate()

  switch (type) {
    case 'date':
      return {
        upper: new Date(year, month, date + rightOffset).getTime(),
        lower: new Date(year, month, date - leftOffset).getTime(),
      }

    case 'month':
      return {
        upper: new Date(year, month + rightOffset, date).getTime(),
        lower: new Date(year, month - leftOffset, date).getTime(),
      }

    case 'year':
      return {
        upper: new Date(year + rightOffset, month, date).getTime(),
        lower: new Date(year - leftOffset, month, date).getTime(),
      }
  }
}

export const calculateWeekSpan = (
  payload: number,
  offset = 0,
  from = 0,
  to = 6
) => {
  const date = new Date(payload)
  const dayOffset = Math.abs((date.getDay() + offset) % 7)

  return {
    upper: new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + to - dayOffset
    ).getTime(),
    lower: new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + from - dayOffset
    ).getTime(),
  }
}

export const trimTime = (date: Date, hour = 0, minute = 0) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
    minute
  ).getTime()

export const expandUnavailableSpan = (
  date: Date,
  type: Options['type'],
  span: number
) => {
  const trimmedTime = trimTime(date)
  if (Math.abs(span) <= 1) return trimmedTime
  const trimmedSpan = span > 0 ? span - 2 : span + 2
  switch (type) {
    case 'month':
      return new Date(
        date.getFullYear(),
        date.getMonth() + trimmedSpan,
        date.getDate()
      ).getTime()

    case 'year':
      return new Date(
        date.getFullYear() + trimmedSpan,
        date.getMonth(),
        date.getDate()
      ).getTime()

    case 'week':
      return trimmedTime
  }

  return trimmedTime + trimmedSpan * MILLISECOND_A_DAY
}

export const toPaddingNumber = (num: number) => num.toString().padStart(2, '0')
