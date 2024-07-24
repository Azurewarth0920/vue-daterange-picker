import { computed, defineComponent, PropType } from 'vue'
import { MINUTES_AN_HOUR } from '../constants'
import { toPaddingNumber } from '../utils'
import TimePicker from './TimePicker'

export default defineComponent({
  props: {
    span: {
      type: Object as PropType<{
        hour?: number
        minute?: number
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
      default: '',
    },
    isSameDay: {
      type: Boolean,
      required: true,
    },
    from: {
      type: String,
      default: '',
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
      const [fromHour, fromMinute] = props.from
        .split(':')
        .map(item => parseInt(item || '0', 10))
      const [toHour] = model.value
        .split(':')
        .map(item => parseInt(item || '0', 10))
      const maxHour = props.span.hour || 23
      const maxMinute = props.span.minute || 59
      const offsetHour = (props.isSameDay && fromHour) || 0
      const offsetMinutes =
        (props.isSameDay && fromHour === toHour && fromMinute) || 0

      const preset = [...Array(Math.floor(MINUTES_AN_HOUR / props.tick))]
        .map((_, i) => i * props.tick)
        .filter(tick => tick >= offsetMinutes)

      return {
        hour: [...Array(maxHour + 1 - offsetHour)].map((_, i) =>
          toPaddingNumber(offsetHour + i)
        ),
        minute: (preset.length
          ? toHour === maxHour
            ? preset.filter(tick => maxMinute >= tick)
            : preset
          : []
        ).map(minute => toPaddingNumber(minute)),
      }
    })

    return () => <TimePicker dataset={dataset.value} v-model={model.value} />
  },
})
