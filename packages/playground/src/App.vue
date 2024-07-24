<template>
  <p>
    Start: <input
      v-model="start"
      type="text"
    > End:
    <input
      v-model="end"
      type="text"
    >
  </p>
  <hr>
  <range-calendar
    v-model:start="start"
    v-model:end="end"
    :options="options"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineCalendarOptions, RangeCalendar } from '@vue3-range-calendar/lib'
import '@vue3-range-calendar/lib/index.css'
const start = ref<string>('')
const end = ref<string>('')
const today = new Date()

const options = defineCalendarOptions({
  fixedSpan:3,
  presets: [
    {
      text: 'Last 7 days',
      modifier: () => {
        return {
          start: today,
          end: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        }
      },
    },
    {
      text: 'Last 30 days',
      modifier: () => {
        return {
          start: today,
          end: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        }
      },
    },
  ],
})
</script>
