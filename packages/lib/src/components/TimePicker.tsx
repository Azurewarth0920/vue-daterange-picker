import { computed, defineComponent, PropType, watch } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: '-:-',
    },
    dataset: {
      type: Object as PropType<{
        hour: string[]
        minute: string[]
      }>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const time = computed({
      get: () => {
        const [hour, minute] = props.modelValue.split(':')
        return {
          hour: props.dataset.hour.includes(hour) ? hour : '-',
          minute: props.dataset.minute.includes(minute) ? minute : '-',
        }
      },
      set: ({ hour, minute }: { hour: string; minute: string }) => {
        emit('update:modelValue', `${hour}:${minute}`)
      },
    })

    const minute = computed({
      get: () => time.value.minute,
      set: (minute: string) => {
        time.value = { ...time.value, minute }
      },
    })

    const hour = computed({
      get: () => time.value.hour,
      set: (hour: string) => {
        time.value = { ...time.value, hour }
      },
    })

    watch(
      () => props.dataset,
      (_, { hour: hourSet, minute: minuteSet }) => {
        if (!hourSet.includes(hour.value) && hour.value !== '-') {
          hour.value = '-'
        }

        if (!minuteSet.includes(minute.value) && minute.value !== '-') {
          minute.value = '-'
        }
      }
    )

    return () => (
      <div class="time-picker">
        <select v-model={hour.value} class="time-picker_select">
          <option disabled value="-">
            -
          </option>
          {props.dataset.hour.map(hour => (
            <option value={hour}>{hour}</option>
          ))}
        </select>
        <span class="time-picker_separate">:</span>
        <select v-model={minute.value} class="time-picker_select">
          <option disabled value="-">
            -
          </option>
          {props.dataset.minute.map(minute => (
            <option value={minute}>{minute}</option>
          ))}
        </select>
      </div>
    )
  },
})
