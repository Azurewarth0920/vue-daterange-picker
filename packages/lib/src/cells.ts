import { MILLISECOND_A_DAY } from './constants'

const refTable: Record<number, string> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}

export const getDateCells = (
  { year, month }: { year: number; month: number },
  offset = 0
) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const lastDayOfLastMonth = new Date(year, month - 1, 0)

  const startingMargin = Math.abs((firstDay.getDay() + offset) % 7)
  const endingMargin = (7 - ((lastDay.getDate() + startingMargin) % 7)) % 7
  const totalCells = lastDay.getDate() + startingMargin + endingMargin

  return [...Array(totalCells)]
    .map((_, key) => key + 1)
    .map(item => {
      if (item <= startingMargin) {
        return {
          date: lastDayOfLastMonth.getDate() - startingMargin + item,
          position: 'last',
          day: refTable[
            (lastDayOfLastMonth.getDay() - startingMargin + item + offset) % 7
          ],
          month: month - 1,
        }
      }

      if (item > lastDay.getDate() + startingMargin) {
        return {
          date: item - startingMargin - lastDay.getDate(),
          position: 'next',
          day: refTable[
            (item - startingMargin - lastDay.getDate() + offset) % 7
          ],
          month: month + 1,
        }
      }

      return {
        date: item - startingMargin,
        position: 'current',
        day: refTable[
          (firstDay.getDay() + item - startingMargin - 1 + offset) % 7
        ],
        month: month,
      }
    })
}

export const getWeekHeader = (locale = 'en', offset = 0) => [...Array(7)]
  .map((_, index) => Math.abs(index - offset) % 7)
  .map(day => new Date(new Date().getTime() - (new Date().getDay()) * MILLISECOND_A_DAY + MILLISECOND_A_DAY * day))
  .map(date =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'short',
    }).format(date)
  )

export const getMonthCells = () => [...Array(12)].map((_, key) => key + 1)

export const getYearCells = ({ year }: { year: number }) =>
  [...Array(12)].map((_, key) => key + year - ((year - 1970) % 12))

export type DateFormatterArgs = {
  date: number
  month: number
  year: number
  position: string
  day: string
}

export type MonthFormatterArgs = { month: number; year: number }

export type YearFormatterArgs = { year: number }

export const defaultDateFormatter = ({ date }: DateFormatterArgs) =>
  date.toString()

export const defaultMonthFormatter = ({ month }: MonthFormatterArgs) =>
  month.toString()

export const defaultYearFormatter = ({ year }: YearFormatterArgs) =>
  year.toString()

export const defaultFormatters = {
  date: defaultDateFormatter,
  month: defaultMonthFormatter,
  year: defaultYearFormatter,
}

export const table = {
  date: getDateCells,
  week: getDateCells,
  fixed: getDateCells,
  month: getMonthCells,
  year: getYearCells,
}
