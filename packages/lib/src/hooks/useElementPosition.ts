export const useElementPosition = (
  el: HTMLElement,
  calendarEl: HTMLElement,
  direction: 'top' | 'bottom' | 'left' | 'right' = 'bottom'
) => {
  const interval = 20
  const {
    top,
    left,
    width: targetWidth,
    height: targetHeight,
  } = el.getBoundingClientRect()

  const [calendarWidth, calendarHeight] = [
    calendarEl.offsetWidth,
    calendarEl.offsetHeight,
  ]

  const { top: parentTop, left: parentLeft } =
    calendarEl.offsetParent?.getBoundingClientRect?.() ?? {
      top: 0,
      left: 0,
    }

  const toAdjustedLeft = (left: number) => {
    return `calc(${left}px +  var(--left-adjustment, 0px))`
  }

  const toAdjustedTop = (top: number) => {
    return `calc(${top}px + var(--top-adjustment, 0px))`
  }

  const defaultTopValue = toAdjustedTop(
    top + targetHeight + interval - parentTop
  )

  const defaultLeftValue = toAdjustedLeft(
    left + targetWidth + interval - parentLeft
  )

  switch (direction) {
    case 'bottom':
      return {
        left: toAdjustedLeft(left - parentLeft),
        top: defaultTopValue,
      }

    case 'top':
      return {
        left: toAdjustedLeft(left - parentLeft),
        top: toAdjustedTop(top - parentTop - calendarHeight - interval),
      }

    case 'left':
      return {
        left: toAdjustedLeft(left - parentLeft - calendarWidth - interval),
        top: toAdjustedTop(top - parentTop),
      }

    case 'right':
      return {
        left: defaultLeftValue,
        top: toAdjustedTop(top - parentTop),
      }

    default:
      return {}
  }
}
