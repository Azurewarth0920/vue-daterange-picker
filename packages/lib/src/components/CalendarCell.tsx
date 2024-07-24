import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    payload: {
      type: Number,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () => (
      <button class="calendar-cell" data-payload={props.payload}>
        {slots.default?.()}
      </button>
    )
  },
})
