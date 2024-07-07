<!-- Setup -->
<script setup>
import { defineCalendarOptions, RangeCalendar } from '@vue3-range-calendar/lib'
import '@vue3-range-calendar/lib/index.css'
import { ref, computed } from 'vue'
// Basic Usage
const start = ref(null)
const end = ref(null)

// Attach Element
const attachElement = ref(null)
const attachDirection = ref('-')
const options = computed(() => ({
  attachElement,
  attachDirection: attachDirection.value
}))

// Type
const weekStart = ref(null)
const weekEnd = ref(null)
const monthStart = ref(null)
const monthEnd = ref(null)
const yearStart = ref(null)
const yearEnd = ref(null)

// Unavailable
const [
  currentYear,
  currentMonth,
  currentDate
] = [new Date().getFullYear(), new Date().getMonth(), new Date().getDate()]
const unavailableOptions = {
  unavailable: [{
    from: new Date(currentYear, currentMonth, currentDate),
    to: new Date(currentYear, currentMonth,  currentDate + 5 )
  }]
}

const today = new Date()
const presetOptions = {
  presets: [
    {
      text: 'Last 7 days',
      modifier: () => {
        return {
          start: today,
          end: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        }
      },
    },
    {
      text: 'Last 30 days',
      modifier: () => {
        return {
          start: today,
          end: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        }
      },
    },
  ],
}
</script>

# Example

## 1. Basic Usage

Use v-model to bind start date and end date.

<span>Start: </span>
<input v-model="start" />
<br>
<span>End: </span>
<input v-model="end" />
<br>
<hr>
<range-calendar v-model:start="start" v-model:end="end" />

<hr>

#### Sample code

```vue
<script setup>
import { ref } from 'vue'
const start = ref(null)
const end = ref(null)
</script>

<template>
  <input v-model="start" />
  <input v-model="end" />
  <range-calendar v-model:start="start" v-model:end="end" />
</template>
```

## 2. Type

The default select type of calendar is **date**, you can also change the type to select week, month, year.

<hr>

#### Sample code

```vue
<script setup>
import { ref } from 'vue'

const weekStart = ref(null)
const weekEnd = ref(null)
const monthStart = ref(null)
const monthEnd = ref(null)
const yearStart = ref(null)
const yearEnd = ref(null)
</script>

<template>
  <range-calendar v-model:start="weekStart" v-model:end="weekEnd" :options="{type: 'week'}" />
  <range-calendar v-model:start="monthStart" v-model:end="monthEnd" :options="{type: 'month'}" />
  <range-calendar v-model:start="yearStart" v-model:end="yearEnd" :options="{type: 'year'}" />
</template>
```


### 2.1 Week select calendar
<br>
<range-calendar v-model:start="weekStart" v-model:end="weekEnd" :options="{type: 'week'}" />
<hr>

### 2.2 Month select calendar
<br>
<range-calendar v-model:start="monthStart" v-model:end="monthEnd" :options="{type: 'month'}" />
<hr>

### 2.3 Year select calendar
<br>
<range-calendar v-model:start="yearStart" v-model:end="yearEnd" :options="{type: 'year'}" />
<hr>


## 3. Attach Element / Attach Direction

You can pass the element you want to attach, to let the calendar attach to the element, and you can also assign the attach direction to the calendar.

<span>Change the option to show calendar and assign direction.</span>

<div>
  <span>Direction: </span>
  <select style="padding: 5px; border-radius: 5px;" v-model="attachDirection" ref="attachElement">
    <option value="-">None</option>
    <option value="top">Top</option>
    <option value="bottom">Bottom</option>
    <option value="left">Left</option>
    <option value="right">Right</option>
  </select>
</div>

<br>
  <range-calendar v-if="attachDirection !== '-'" :options="options" />
<hr>

#### Sample code

```vue
<script setup>
import { ref, computed } from 'vue'

const attachElement = ref(null)
const attachDirection = ref('-')
const options = computed(() => ({
  attachElement,
  attachDirection: attachDirection.value
}))
</script>

<template>
  <select v-model="attachDirection" ref="attachElement">
    <option value="-" disabled>-</option>
    <option value="top">top</option>
    <option value="bottom">bottom</option>
    <option value="left">left</option>
    <option value="right">right</option>
  </select>
  <br>
  <range-calendar v-if="attachDirection !== '-'" :options="options" />
</template>
```

## 4. Fixed span

`fixSpan (type: number)` property is provided to let the user select the fixed range.

<range-calendar v-model:start="start" v-model:end="end" :options="{fixedSpan: 5}" />
<hr>

#### Sample code 
```vue
<script setup>
const start = ref(null)
const end = ref(null)
</script>

<template>
  <range-calendar v-model:start="start" v-model:end="end" :options="{fixedSpan: 5}" />
</template>
```


## 5. Min span and max span
Type: `number`

minSpan and maxSpan are provided to restrict the minimum and maximum select range.

<range-calendar
  v-model:start="start"
  v-model:end="end"
  :options="{minSpan: 5, maxSpan: 10}"
/>

<hr>

#### Sample code

```vue
<script setup>
const start = ref(null)
const end = ref(null)
</script>

<template>
  <range-calendar
    v-model:start="start"
    v-model:end="end"
    :options="{
      minSpan: 5,
      maxSpan: 10
    }"
  />
</template>
```

## 6. Unavailable
Type: `{ from?: Date; to?: Date }[]`

By passing the unavailable property to options, cells can be prevent from selecting.

<range-calendar
    v-model:start="start"
    v-model:end="end"
    :options="unavailableOptions"
/>
<hr>

#### Sample code

```vue
<script setup>
const [
  currentYear,
  currentMonth,
  currentDate
] = [new Date().getFullYear(), new Date().getMonth(), new Date().getDate()]
const unavailableOptions = {
  unavailable: [{
    from: new Date(currentYear, currentMonth, currentDate),
    to: new Date(currentYear, currentMonth,  currentDate + 5 )
  }]
}
</script>
```



## 7. Passive mode

By default, the calendar use two way binding(v-model) to update `start` and `end`, but you can set the `passive: true` and emit change by clicking apply button, and reset select and emit cancel event by clicking cancel button.

<span>Start: </span>
<input v-model="start" />
<br>
<span>End: </span>
<input v-model="end" />
<br>

<range-calendar
  v-model:start="start"
  v-model:end="end"
  :options="{ passive: true }"
/>

<hr>

#### Sample code

```vue
<template>
  <range-calendar
    v-model:start="start"
    v-model:end="end"
    :options="{ passive: true }"
  />
</template>
```

## 8. Time selecting
You can enable time selecting by passing `timeSelection: true` to the options.

* Option `timeOptions` is provided to configure the behavior of time selection, check [here](/options.html#timeoptions)

<span>Start: </span>
<input v-model="start" />
<br>
<span>End: </span>
<input v-model="end" />
<hr>

<range-calendar
  v-model:start="start"
  v-model:end="end"
  :options="{ timeSelection: true }"
/>

<hr>

#### Sample code

```vue
<template>
  <range-calendar
    v-model:start="start"
    v-model:end="end"
    :options="{ timeSelection: true }"
  />
</template>
```

## 9. Single select

By default, the calendar is used for selecting date range, but you can activating single select mode by passing `singleSelect: true` to the option.

You can combine `timeSelection` and `singleSelect` to select a single day with time range.

<span>Start: </span>
<input v-model="start" />
<br>
<span>End: </span>
<input v-model="end" />
<hr>

<range-calendar
  v-model:start="start"
  v-model:end="end"
  :options="{ singleSelect: true }"
/>
<hr>

#### Sample code

```vue
<template>
  <range-calendar
    v-model:start="start"
    v-model:end="end"
    :options="{ timeSelection: true, singleSelect: true }"
  />
</template>
```
## 10. Preset

You can pass the preset options for let user to select preset range in the calendar.
The modifier receive current `start` and `end`, and should return the preset range of `start` and `end`.

<span>Start: </span>
<input v-model="start" />
<br>
<span>End: </span>
<input v-model="end" />
<hr>

<range-calendar
  v-model:start="start"
  v-model:end="end"
  :options="presetOptions"
/>
<hr>

#### Sample code

```vue
<script>
  const today = new Date()
  const options = {
    presets: [
      {
        text: 'Last 7 days',
        modifier: () => {
          return {
            start: today,
            end: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
          }
        },
      },
      {
        text: 'Last 30 days',
        modifier: () => {
          return {
            start: today,
            end: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
          }
        },
      },
    ],
  }
</script>

<template>
  <range-calendar
    v-model:start="start"
    v-model:end="end"
    :options="options"
  />
</template>
``` -->