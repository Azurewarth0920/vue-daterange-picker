import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    applyText: {
      type: [String, Boolean],
      default: 'Apply',
    },
    cancelText: {
      type: [String, Boolean],
      default: 'Cancel',
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['apply', 'cancel'],
  setup(props, { emit }) {
    return () => (
      <div class="calendar-footer">
        <button
          class="calendar-footer_button -cancel"
          onClick={() => emit('cancel')}
        >
          {props.cancelText}
        </button>
        <button
          class="calendar-footer_button -apply"
          onClick={() => emit('apply')}
          disabled={!props.isSelected}
        >
          {props.applyText}
        </button>
      </div>
    )
  },
})
