import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
import { Options } from '../options'
import CalendarCell from './CalendarCell'
import {
  getDateCells,
  getMonthCells,
  getYearCells,
  getWeekHeader,
  defaultFormatters,
} from '../cells'
import {
  calculateFixedSpan,
  calculateWeekSpan,
  deserializeDate,
  trimTime,
} from '../utils'

export default defineComponent({
  props: {
    date: {
      type: Number,
      required: true,
    },
    maxRange: {
      type: Object as PropType<{
          maxUpper?: number
          maxLower?: number
          minUpper?: number
          minLower?: number
        }
      >,
      default: () => ({}),
    },
    type: {
      type: String as PropType<Required<Options>['type']>,
      required: true,
    },
    bound: {
      type: Object as PropType<{
        upper: number | null
        lower: number | null
      }>,
      required: true,
    },
    isSelecting: {
      type: Boolean,
      required: true,
    },
    isCurrentType: {
      type: Boolean,
      required: true,
    },
    formatters: {
      type: Object as PropType<Options['formatters']>,
      default: null,
    },
    unavailable: {
      type: Array as PropType<{ lower: number; upper: number }[]>,
      default: () => [],
    },
    weekOffset: {
      type: Number,
      required: true,
    },
    weekSpan: {
      type: Object as PropType<{
        from?: number
        to?: number
      }>,
      default: null,
    },
    locale: {
      type: String,
      required: true,
    },
    fixedSpan: {
      type: Number,
      required: true,
    },
  },
  emits: ['cellSelected', 'cellHovered'],
  setup(props, { emit }) {
    const today = trimTime(new Date())
    const formatters = props.formatters
      ? { ...defaultFormatters, ...props.formatters }
      : defaultFormatters

    const hoveringPayload = ref<number | null>(null)

    const handleMouseEvent = (
      event: MouseEvent,
      eventName: 'cellSelected' | 'cellHovered'
    ) => {
      const rawPayload = (event.target as HTMLButtonElement).getAttribute(
        'data-payload'
      )

      if (!rawPayload) return
      const parsedPayload = parseInt(rawPayload, 10)
      hoveringPayload.value = parsedPayload
      emit(eventName, parsedPayload)
    }

    const currentAvailableSpan = computed(() => {
      const settled = settledDate.value
      if (!settled || !props.isSelecting)
        return {
          upper: Number.POSITIVE_INFINITY,
          lower: Number.NEGATIVE_INFINITY,
        }

      const upper =
        props.unavailable
          .map(({ lower }) => lower)
          .filter(lower => lower > settled)
          .sort((a, b) => a - b)[0] || Number.POSITIVE_INFINITY

      const lower =
        props.unavailable
          .map(({ upper }) => upper)
          .filter(upper => settled > upper)
          .sort((a, b) => b - a)[0] || Number.NEGATIVE_INFINITY

      return {
        upper,
        lower,
      }
    })

    const isInterval = (payload: number): '-interval' | false => {
      if (!props.bound.upper || !props.bound.lower || !props.isCurrentType)
        return false

      return (
        props.bound.upper > payload &&
        props.bound.lower < payload &&
        '-interval'
      )
    }

    const isSpanCell = (payload: number): string[] | string => {
      if (!hoveringPayload.value) return ''
      const { upper, lower } =
        props.type === 'week'
          ? calculateWeekSpan(hoveringPayload.value, props.weekOffset)
          : props.fixedSpan
          ? calculateFixedSpan(
              hoveringPayload.value,
              props.fixedSpan,
              props.type
            )
          : { upper: false, lower: false }

      if (typeof upper !== 'number' || typeof lower !== 'number') return ''
      if (upper === payload) return ['-span', '-span_upper']
      if (lower === payload) return ['-span', '-span_lower']
      return upper > payload && lower < payload ? '-span' : ''
    }

    const isCellAvailable = (payload: number): boolean => {
      if (!props.isCurrentType) return true
      if (props.maxRange && props.isSelecting && !props.fixedSpan) {
        const {
          maxUpper = Number.POSITIVE_INFINITY,
          maxLower = Number.NEGATIVE_INFINITY,
          minUpper = Number.NEGATIVE_INFINITY,
          minLower = Number.POSITIVE_INFINITY,
        } = props.maxRange
        if (
          payload >= maxUpper ||
          payload <= maxLower ||
          (payload < minUpper && payload > minLower)
        )
          return false
      }

      if (
        props.unavailable.some(
          ({ lower, upper }) => payload >= lower && payload <= upper
        ) ||
        currentAvailableSpan.value.upper < payload ||
        currentAvailableSpan.value.lower > payload
      )
        return false

      return true
    }

    const settledDate = ref<number | null>(null)

    watchEffect(() => {
      if (props.bound.lower && props.bound.upper) {
        if (settledDate.value == null) {
          settledDate.value = props.bound.lower
        }
      }
    })

    watchEffect(() => {
      if (props.isSelecting) {
        settledDate.value = null
      }
    })

    const cells = computed(() => {
      switch (props.type) {
        case 'month':
          return getMonthCells()
        case 'year':
          return getYearCells(deserializeDate(props.date))
      }
      return getDateCells(deserializeDate(props.date), props.weekOffset)
    })

    const cellAttrs = computed<
      {
        payload: number
        formatter: string
        classNames?: string[]
      }[]
    >(() => {
      const { year } = deserializeDate(props.date)
      switch (props.type) {
        case 'month':
          return (cells.value as ReturnType<typeof getMonthCells>).map(
            month => ({
              payload: new Date(year, month - 1, 1).getTime(),
              formatter: formatters.month({ year, month }),
            })
          )
        case 'year':
          return (cells.value as ReturnType<typeof getYearCells>).map(year => ({
            payload: new Date(year, 0, 1).getTime(),
            formatter: formatters.year({ year }),
          }))
      }

      return (cells.value as ReturnType<typeof getDateCells>).map(
        ({ date, position, day, month }) => {
          const payload = new Date(year, month - 1, date).getTime()
          return {
            classNames: [
              `-${position}`,
              `-${day}`,
              today === payload && '-today',
            ],
            payload,
            formatter: formatters.date({
              date,
              position,
              day,
              month,
              year,
            }),
          }
        }
      )
    })

    return () => (
      <div
        class={['calendar-body', `-${props.type}`]}
        onClick={e => handleMouseEvent(e, 'cellSelected')}
        onMouseover={e => handleMouseEvent(e, 'cellHovered')}
        onMouseout={() => (hoveringPayload.value = null)}
      >
        {['date', 'fixed', 'week'].includes(props.type) &&
          getWeekHeader(props.locale, props.weekOffset).map(shortName => (
            <span class="calendar-cell_leading">{shortName}</span>
          ))}
        {cellAttrs.value.map(({ payload, classNames, formatter }) => (
          <CalendarCell
            class={[
              ...(classNames ? classNames : []),
              `-${props.type}`,
              props.bound.upper === payload && '-upper',
              props.bound.lower === payload && '-lower',
              settledDate.value === payload && '-settled',
              !props.isSelecting && '-selected',
              isInterval(payload),
              !isCellAvailable(payload) && '-unavailable',
              isSpanCell(payload),
            ]}
            key={payload}
            payload={payload}
          >
            {formatter}
          </CalendarCell>
        ))}
      </div>
    )
  },
})
