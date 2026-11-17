import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it.each(['primary', 'secondary', 'tertiary', 'destroy', 'pagination'] as const)(
    '%s buttons cannot activate while disabled and can activate when re-enabled',
    async (variant) => {
      const wrapper = mount(BaseButton, {
        props: { variant, disabled: true },
        slots: { default: 'Continue' },
      })
      const button = wrapper.get('button')
      expect(button.element.disabled).toBe(true)
      button.element.click()
      expect(wrapper.emitted('click')).toBeUndefined()
      await wrapper.setProps({ disabled: false })
      button.element.click()
      expect(wrapper.emitted('click')).toHaveLength(1)
    },
  )

  it('exposes a named native button that activates without submitting by default', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Save changes' } })
    const button = wrapper.get('button')
    expect(button.text()).toBe('Save changes')
    expect(button.element.type).toBe('button')
    button.element.click()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
