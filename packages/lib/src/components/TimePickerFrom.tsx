import { computed, defineComponent, PropType } from 'vue'
import { MINUTES_AN_HOUR } from '../constants'
import { toPaddingNumber } from '../utils'
import TimePicker from './TimePicker'

export default defineComponent({
  props: {
    span: {
      type: Object as PropType<{
        from?: {
          hour?: number
          minute?: number
        }
        to?: {
          hour?: number
          minute?: number
        }
      }>,
      default: () => ({
        hour: 0,
        minute: 0,
      }),
    },
    tick: {
      type: Number,
      default: 10,
    },
    modelValue: {
      type: String,
      default: '-:-',
    },
    isRange: {
      type: Boolean,
      default: false,
    },
    isSameDay: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const model = computed({
      get: () => props.modelValue,
      set: value => {
        emit('update:modelValue', value)
      },
    })

    const dataset = computed(() => {
      const currentHour = parseInt(props.modelValue.split(':')[0], 10)
      const minHour = props.span?.from?.hour ?? 0
      const minMinute = props.span?.from?.minute ?? 0
      const maxHour =
        ((!props.isRange || props.isSameDay) && props.span?.to?.hour) || 23
      const maxMinute =
        ((!props.isRange || props.isSameDay) && props.span?.to?.minute) || 59

      const upperLimit = (minute: number) =>
        currentHour !== minHour || minute >= minMinute
      const lowerLimit = (minute: number) =>
        currentHour !== maxHour || minute <= maxMinute

      return {
        hour: [...Array(maxHour - minHour + 1)].map((_, i) =>
          toPaddingNumber(minHour + i)
        ),
        minute: [...Array(Math.floor(MINUTES_AN_HOUR / props.tick))]
          .map((_, i) => i * props.tick)
          .filter(upperLimit)
          .filter(lowerLimit)
          .map(minute => toPaddingNumber(minute)),
      }
    })

    return () => <TimePicker dataset={dataset.value} v-model={model.value} />
  },
})
