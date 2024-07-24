import { defineComponent, PropType } from 'vue'
import { Preset } from '../options'
import { trimTime } from '../utils'

export default defineComponent({
  props: {
    presets: {
      type: Object as PropType<Preset[]>,
      required: true,
    },
    start: {
      type: Number,
      default: null,
    },
    end: {
      type: Number,
      default: null,
    },
    serializer: {
      type: Function as PropType<(dateString: string) => Date>,
      required: true,
    },
    deserializer: {
      type: Function as PropType<(dateObj: Date) => string>,
      required: true,
    },
    timeSelection: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:start', 'update:end'],
  setup(props, { emit }) {
    const serializer = props.timeSelection
      ? (date: Date) => props.serializer(props.deserializer(date)).getTime()
      : (date: Date) => trimTime(date)

    const handleClick = (modifier: Preset['modifier']) => {
      const { start, end } = modifier({
        start: new Date(props.start),
        end: new Date(props.end),
      })

      const timeSet = [serializer(start), serializer(end)]

      emit('update:start', Math.min(...timeSet))
      emit('update:end', Math.max(...timeSet))
    }

    const isMatched = (modifier: Preset['modifier']) => {
      const { start, end } = modifier({
        start: new Date(props.start),
        end: new Date(props.end),
      })

      const timeSet = [serializer(start), serializer(end)]

      return (
        Math.min(...timeSet) === props.start &&
        Math.max(...timeSet) === props.end
      )
    }

    return () => (
      <ul class="calendar-presets">
        {props.presets.map(preset => (
          <li class="calendar-presets_item">
            <button
              class={[
                'calendar-presets_button',
                isMatched(preset.modifier) && '-active',
              ]}
              onClick={() => handleClick(preset.modifier)}
            >
              {preset.text}
            </button>
          </li>
        ))}
      </ul>
    )
  },
})
