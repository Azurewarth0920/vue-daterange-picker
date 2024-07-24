# Vue3 range calendar

## Overview
Vue3 range calendar is a calendar UI component library for picking date, week, month, year ranges, with zero dependencies for Vue3.

## Installation

::: code-group

```sh [npm]
$ npm add vue3-range-calendar
```

```sh [pnpm]
$ pnpm add vue3-range-calendar
```

```sh [yarn]
$ yarn add vue3-range-calendar
```

```sh [bun]
$ bun add vue3-range-calendar
```

## Usage

```js
import { createApp } from 'vue'
import rangeCalendarPlugin from 'vue3-range-calendar'
import 'vue3-range-calendar/index.css'

const app = createApp({...})
app.use(rangeCalendarPlugin)
```

And you can directly import the component RangeCalendar in another Component


```Vue
<script setup>
import { RangeCalendar } from 'vue3-range-calendar'
import 'vue3-range-calendar/index.css'
</script>

<template>
  <RangeCalendar />
</template>
```

:::

## Options

```ts
interface Options {
  /**
   * The date type of calendar.
   * The mode of calendar can be set, to choose date, week, month, year.
   * @default: 'date'
  */
  type: 'date' | 'week' | 'month' | 'year'

  /**
   * The target element that the calendar will be appended to
  */
  attachElement?: Ref<HTMLElement | null>

  /**
   * The attach direction of calendar
   * @default: 'bottom'
  */
  attachDirection?: 'top' | 'left' | 'bottom' | 'right'

  /**
   * Fix the selecting span to the provided value when selecting the range.
   * * This option will be ignored when type is set to `'week'`, because the week is already a kind of span.
  */
  fixedSpan?: number

  /**
   * The minium span when selecting the range.
  */
  minSpan?: number

  /**
   * The maximum span when selecting the range.
  */
  maxSpan?: number

  /**
   * The maximum span when selecting the range.
  */
  maxSpan?: number

  /**
   * The preset range of calendar, passing the configuration functions to define preset range.
   * User can click the preset range to choose a preset fixed range.
   * @param text The text displayed on button.
   * @param current The current selected range.
   * @return The range should be set.
  */
  preset?: { text: string, (current: { start?: Date, end?: Date }) => { start: Date, end: Date }[]}

  /**
   * The unavailable period of calendar.
  */
  unavailable?: { from?: Date; to?: Date }[]

  /**
   * The passive mode, value will be emitted to the parent component after apply button is clicked.
  */
  passive?: true | { applyText?: string; cancelText?: string }

  /**
   * Set the calender to single select mode, instead of selecting range of date.
  */
  singleSelect?: true


  /**
   * The formatters for the cell in each mode, you can customize the content of cell by passing the custom function to the formatters.
  */
  formatters?: {
    date?: (payload: { date: number; month: number; year: number; position: string; day: string }) => string
    month?: (payload: { month: number; year: number }) => string
    year?: (payload: { year: number }) => string
  }


  /**
   * The serializer for define that how will the calendar parse the date string passing through v-model.
   * @default: (dateString: string) => new Date(dateString)
  */
  serializer?: (dateString: string) => Date

  /**
   * The serializer for define that how will the calendar parse the date string passing through v-model.
   * @default: (dateString: string) => new Date(dateString)
  */
  deserializer?: (dateObj: Date) => string

  /**
   * Set timeSelection to true will be enable time selection
  */
  timeSelection?: true

  /**
   * The options for customizing time selection.
   * tick: Use minute as unit to set the tick of the time.
   * singleSelect: to select a time point instead of time range. (it is available only when the calender itself is set to singleSelect)
   * span: The selectable range of time.
  */
  timeOptions?: {
    tick?: number
    singleSelect?: false
    span?: {
      from?: {
        hour?: number
        minute?: number
      }
      to?: {
        hour: number
        minute: number
      }
    }
  }

  /**
  * Week starts from Sunday default but you let the week start from other weekday by modifying weekOffset.  
  * Eg. `weekOffset: 1` -> starts from Monday
  */
  weekOffset?: number

  /**
  * Set fixed week span in week selecting mode. (* Only available in week selecting mode.)  
  * Eg. `weekSpan: { from: 2, to: 4 }` -> in the week selecting mode, only Wed, Thu, Fri can be selected.
  */
  weekSpan?:  { from: number, to: number }

  /**
  * The number of displayed calendar at same time.
  * @default: 2
  */
  count?: number

  /**
  * The language of the calendar, utilized by the displayed text of weekday.
  * @default: 'en'
  */
 locale: localeString
}
```

## Events

```ts
interface Events {
  /**
  * When the start of the range is chosen, the start value will be emitted.
  * The value will be formatted by deserializer
  * @default: 'YYYY/MM/DD HH:mm'
  */
  "update:start": string

  /**
  * When the end of the range is chosen, the start value will be emitted.
  * The value will be formatted by deserializer
  * @default: 'YYYY/MM/DD HH:mm'
  */
  "update:end": string
  
  /**
  * When a cell is hovered, the value of the cell will be emitted.
  * The value will be formatted by deserializer
  * @default: 'YYYY/MM/DD HH:mm'
  */
  hover: string
  
  /**
  * After switching to the next period, this month, year of next period will be emitted.
  */
  switch-next: { year: number, month: number }

  /**
  * After switching to the previous period, this month, year of previous period will be emitted.
  */
  switch-prev: { year: number, month: number }

  /**
    * When the calendar is switched to a different type, this event will be emitted.
    * If the type is switching from the bigger range to smaller range (Eg. `year` -> `month`, `month` -> `week`), the payload of chosen cell will be also emitted.
  */
  switch-type: { type: 'date' | 'week' | 'month' | 'year', payload?: { year: number, month: number }}

  /**
    * This event will be emitted when apply button is clicked in passive mode.
    * And `update:start` and `update:end` will also be emitted
  */
  apply: void

  /**
    * This event will be emitted when cancel button is clicked in passive mode.
  */
  cancel: void
}
```

## TypeScript

You can use the function `defineCalendarOptions` to help you defining your options.

```Vue
<script setup lang="ts">
import { defineCalendarOptions } from 'vue3-range-calendar'
const options = defineCalendarOptions({ options... })
</script>

<template>
  <range-calendar :options="options" />
</template>
```