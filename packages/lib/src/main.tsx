import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  PropType,
  reactive,
  ref,
  watch,
} from 'vue'
import CalendarBody from './components/CalendarBody'
import CalendarHeader from './components/CalendarHeader'
import CalendarFooter from './components/CalendarFooter'
import CalendarPresets from './components/CalendarPresets'
import { defaults, Options } from './options'
import {
  calculateSpan,
  calculateWeekSpan,
  calculateFixedSpan,
  serializeDate,
  toPaddingNumber,
  trimTime,
  expandUnavailableSpan,
  deserializeDate,
} from './utils'
import { CELLS_IN_BLOCK, MONTH_A_YEAR } from './constants'
import { useElementPosition } from './hooks/useElementPosition'
import TimePickerFrom from './components/TimePickerFrom'
import TimePickerTo from './components/TimePickerTo'

export default defineComponent({
  props: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      default: '',
    },
    options: {
      type: Object as PropType<Options>,
      default: () => ({}),
    },
  },
  emits: [
    'update:start',
    'update:end',
    'hover',
    'switch-next',
    'switch-prev',
    'switch-type',
    'apply',
    'cancel',
  ],
  setup(props, { emit }) {
    const options = computed(() => {
      return {
        ...defaults,
        ...props.options,
      }
    })

    const getPassiveStart = () =>
      props.start
        ? options.value.serializer(props.start).getTime()
        : (null as number | null)

    const getPassiveEnd = () =>
      props.end
        ? options.value.serializer(props.end).getTime()
        : (null as number | null)

    const internalState = reactive({
      passiveStart: getPassiveStart(),
      passiveEnd: getPassiveEnd(),
      hovered: null as number | null,
      currentDate: serializeDate(props.start),
      currentType: options.value.type,
    })

    const calendarRef = ref<HTMLElement | null>(null)

    // Start/End reverted.
    const start = computed<number | null>({
      get: () => {
        if (options.value.passive) {
          return internalState.passiveStart
        }

        return props.start
          ? options.value.serializer(props.start).getTime()
          : null
      },
      set: (time: number | null) => {
        const payload = time ? options.value.deserializer(new Date(time)) : null
        if (options.value.passive) {
          internalState.passiveStart = time
          return
        }

        emit('update:start', payload)
      },
    })

    const end = computed<number | null>({
      get: () => {
        if (options.value.passive) {
          return internalState.passiveEnd
        }
        return props.end ? options.value.serializer(props.end).getTime() : null
      },
      set: (time: number | null) => {
        // TODO: Fix this logic
        let orderedTime = time
        console.log('time', start.value)

        if (
          typeof time === 'number' &&
          typeof start.value === 'number' &&
          start.value > time && !options.value.singleSelect
        ) {
          orderedTime = start.value
          start.value = time
        }

        const payload = orderedTime
          ? options.value.deserializer(new Date(orderedTime))
          : null

        if (options.value.passive) {
          internalState.passiveEnd = orderedTime
          return
        }

        emit('update:end', payload)
      },
    })

    const timeStart = computed({
      get: () => {
        if (!start.value) return '-:-'
        const date = new Date(start.value)
        return `${toPaddingNumber(date.getHours())}:${toPaddingNumber(
          date.getMinutes()
        )}`
      },
      set: (value: string) => {
        const [hour, minute] = value
          .split(':')
          .map(item => parseInt(item || '0', 10))
        start.value = start.value
          ? trimTime(new Date(start.value), hour || 0, minute || 0)
          : null
      },
    })

    const timeEnd = computed({
      get: () => {
        if (!end.value) return '-:-'
        const date = new Date(end.value)
        return `${toPaddingNumber(date.getHours())}:${toPaddingNumber(
          date.getMinutes()
        )}`
      },
      set: (value: string) => {
        const [hour, minute] = value
          .split(':')
          .map(item => parseInt(item || '0', 10))
        end.value = end.value
          ? trimTime(new Date(end.value), hour || 0, minute || 0)
          : null
      },
    })

    const dateOffset = computed(() => {
      return internalState.currentType === 'year'
        ? MONTH_A_YEAR * CELLS_IN_BLOCK
        : internalState.currentType === 'month'
        ? MONTH_A_YEAR
        : 1
    })

    const attachedStyles = ref({})

    const mountAttachmentStyle = () => {
      if (
        !options.value.attachElement ||
        !calendarRef.value ||
        !options.value.attachElement.value
      )
        return
      attachedStyles.value = {
        ...useElementPosition(
          options.value.attachElement.value,
          calendarRef.value,
          options.value.attachDirection
        ),
        visibility: 'visible',
      }
    }

    onMounted(() => {
      mountAttachmentStyle()
    })

    watch(
      () => options.value.attachDirection,
      () => {
        mountAttachmentStyle()
      }
    )

    const handleSwitch = (direction: 1 | -1) => {
      internalState.currentDate +=
        dateOffset.value * direction * options.value.count

      emit(
        direction > 0 ? 'switch-next' : 'switch-prev',
        deserializeDate(internalState.currentDate)
      )
    }

    const bound = computed<{
      upper: number | null
      lower: number | null
    }>(() => {
      const leftEdge = start.value
      const rightEdge = end.value || internalState.hovered

      if (!leftEdge || !rightEdge)
        return {
          upper: null,
          lower: null,
        }

      return {
        upper: trimTime(new Date(leftEdge > rightEdge ? leftEdge : rightEdge)),
        lower: trimTime(new Date(leftEdge > rightEdge ? rightEdge : leftEdge)),
      }
    })

    const unavailable = computed(() => {
      return (
        options.value.unavailable?.map(({ from, to }) => ({
          lower: from
            ? expandUnavailableSpan(
                from,
                options.value.type,
                options.value.fixedSpan * -1
              )
            : Number.POSITIVE_INFINITY,
          upper: to
            ? expandUnavailableSpan(
                to,
                options.value.type,
                options.value.fixedSpan
              )
            : Number.NEGATIVE_INFINITY,
        })) ?? []
      )
    })

    const maxRange = computed(() => {
      if (
        !start.value ||
        options.value.singleSelect ||
        options.value.type === 'week'
      ) {
        return
      }

      return {
        maxUpper: calculateSpan(
          start.value,
          options.value.maxSpan,
          options.value.type
        ),
        maxLower: calculateSpan(
          start.value,
          options.value.maxSpan,
          options.value.type,
          -1
        ),
        minUpper: calculateSpan(
          start.value,
          options.value.minSpan,
          options.value.type,
          1,
          -1
        ),
        minLower: calculateSpan(
          start.value,
          options.value.minSpan,
          options.value.type,
          -1,
          1
        ),
      }
    })

    const handleSwitchType = () => {
      internalState.currentType =
        internalState.currentType === 'month' ? 'year' : 'month'

      emit('switch-type', {
        type: internalState.currentType,
      })
    }

    const handleCellHovered = (payload: number) => {
      emit('hover', options.value.deserializer(new Date(payload)))

      if (options.value.singleSelect) return
      internalState.hovered = payload
    }

    const handleCellSelect = (payload: number) => {
      // Switch type
      if (internalState.currentType !== options.value.type) {
        internalState.currentDate =
          new Date(payload).getFullYear() * MONTH_A_YEAR +
          new Date(payload).getMonth()

        switch (internalState.currentType) {
          case 'year':
            emit('switch-type', {
              type: 'month',
              payload: deserializeDate(internalState.currentDate),
            })
            internalState.currentType = 'month'
            return
          case 'month':
            internalState.currentType = options.value.type
            emit('switch-type', {
              type: options.value.type,
              payload: deserializeDate(internalState.currentDate),
            })
            return
        }
      }

      // Select value
      if (options.value.singleSelect) {
        start.value = end.value = payload
        return
      }

      // Week mode or fixed span mode
      if (options.value.type === 'week') {
        const { upper, lower } = calculateWeekSpan(
          payload,
          options.value.weekOffset,
          options.value.weekSpan?.from ?? 0,
          options.value.weekSpan?.to ?? 6
        )
        start.value = lower
        nextTick(() => {
          end.value = upper
        })
        return
      }

      if (options.value.fixedSpan) {
        const { upper, lower } = calculateFixedSpan(
          payload,
          options.value.fixedSpan,
          options.value.type
        )

        start.value = lower
        nextTick(() => {
          end.value = upper
        })
        return
      }

      if (start.value && end.value) {
        start.value = payload
        end.value = null
        return
      }

      if (start.value == null) {
        start.value = payload
      } else {
        end.value = payload
      }
    }

    const isSelected = computed(() => {
      return !!(options.value.singleSelect
        ? start.value && end.value
        : start.value)
    })

    const isSameDay = computed(
      () => !!bound.value.upper && bound.value.upper === bound.value.lower
    )

    const handleApply = () => {
      const deserializedStart = start.value
        ? options.value.deserializer(new Date(start.value))
        : null

      const deserializedEnd = end.value
        ? options.value.deserializer(new Date(end.value))
        : null

      emit('update:start', deserializedStart)
      emit('update:end', deserializedEnd)
      emit('apply')
    }

    const handleCancel = () => {
      internalState.passiveStart = getPassiveStart()
      internalState.passiveEnd = getPassiveEnd()
      emit('cancel')
    }

    const isTimeRanged = computed(
      () =>
        !options.value.singleSelect || !options.value.timeOptions?.singleSelect
    )

    return () => (
      <div
        class={['calendar-wrapper', options.value.attachElement && '-attached']}
        style={attachedStyles.value}
        ref={calendarRef}
      >
        {[...Array(options.value.count)].map((_, index) => (
          <div class="calendar-unit">
            <CalendarHeader
              date={internalState.currentDate + index * dateOffset.value}
              type={internalState.currentType}
              showGoPrev={index === 0}
              showGoNext={index === options.value.count - 1}
              onPrevClicked={() => handleSwitch(-1)}
              onNextClicked={() => handleSwitch(1)}
              onSwitchType={handleSwitchType}
            />
            <CalendarBody
              date={internalState.currentDate + index * dateOffset.value}
              type={internalState.currentType}
              bound={bound.value}
              formatters={options.value.formatters}
              unavailable={unavailable.value}
              maxRange={maxRange.value}
              isSelecting={!end.value}
              isCurrentType={internalState.currentType === options.value.type}
              onCellHovered={handleCellHovered}
              onCellSelected={handleCellSelect}
              locale={options.value.locale}
              weekSpan={options.value.weekSpan}
              weekOffset={options.value.weekOffset}
              fixedSpan={options.value.fixedSpan}
            />
            {index === 0 &&
              options.value.timeSelection &&
              ['week', 'date'].includes(internalState.currentType) && (
                <TimePickerFrom
                  tick={options.value.timeOptions?.tick}
                  span={options.value.timeOptions?.span}
                  isRange={isTimeRanged.value}
                  isSameDay={isSameDay.value}
                  v-model={timeStart.value}
                />
              )}
            {index === options.value.count - 1 &&
              options.value.timeSelection &&
              isTimeRanged.value &&
              ['week', 'date'].includes(internalState.currentType) && (
                <TimePickerTo
                  tick={options.value.timeOptions?.tick}
                  span={options.value.timeOptions?.span?.to}
                  isSameDay={isSameDay.value}
                  from={timeStart.value}
                  v-model={timeEnd.value}
                />
              )}
            {index === options.value.count - 1 && options.value.passive && (
              <CalendarFooter
                onApply={handleApply}
                onCancel={handleCancel}
                isSelected={isSelected.value}
                applyText={
                  typeof options.value.passive === 'boolean'
                    ? undefined
                    : options.value.passive.applyText
                }
                cancelText={
                  typeof options.value.passive === 'boolean'
                    ? undefined
                    : options.value.passive.cancelText
                }
              />
            )}
          </div>
        ))}
        {options.value.presets && options.value.presets.length && (
          <CalendarPresets
            v-model:start={start.value}
            v-model:end={end.value}
            timeSelection={options.value.timeSelection || false}
            serializer={options.value.serializer}
            deserializer={options.value.deserializer}
            presets={options.value.presets}
          />
        )}
      </div>
    )
  },
})
