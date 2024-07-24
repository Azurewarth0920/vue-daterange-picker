import { defineComponent, PropType } from 'vue'
import { Options } from '../options'
import { deserializeDate } from '../utils'

export default defineComponent({
  props: {
    date: {
      type: Number,
      required: true,
    },
    type: {
      type: String as PropType<Options['type']>,
      required: true,
    },
    showGoPrev: {
      type: Boolean,
      required: true,
    },
    showGoNext: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['prevClicked', 'nextClicked', 'switchType'],
  setup(props, { emit }) {
    return () => (
      <div class="calendar-header">
        {props.showGoPrev && (
          <button
            class="calendar-header_button -prev"
            onClick={() => emit('prevClicked')}
          >
            Prev
          </button>
        )}
        <div class="calendar-header_text">
          {props.type !== 'year' && (
            <button
              class="calendar-header_title"
              onClick={() => emit('switchType')}
            >
              <span>{deserializeDate(props.date).year}</span>
              {props.type !== 'month' && (
                <span> / {deserializeDate(props.date).month}</span>
              )}
            </button>
          )}
        </div>
        {props.showGoNext && (
          <button
            class="calendar-header_button -next"
            onClick={() => emit('nextClicked')}
          >
            Next
          </button>
        )}
      </div>
    )
  },
})
