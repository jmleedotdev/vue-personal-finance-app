import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import BaseSelect from '../BaseSelect.vue'

const options = [
  { value: 'all', label: 'All Transactions' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'bills', label: 'Bills' },
]

describe('BaseSelect', () => {
  it('moves away from a newly disabled active option and disables a fully unavailable selector', async () => {
    const wrapper = mount(BaseSelect, { props: { label: 'Category', options, modelValue: 'all' } })
    try {
      const combobox = wrapper.get('[role="combobox"]')
      await combobox.trigger('keydown', { key: 'End' })
      await wrapper.setProps({
        options: options.map((option) => ({ ...option, disabled: option.value === 'bills' })),
      })
      expect(wrapper.get(`[id="${combobox.attributes('aria-activedescendant')}"]`).text()).toBe(
        'All Transactions',
      )
      await combobox.trigger('keydown', { key: 'End' })
      expect(wrapper.get(`[id="${combobox.attributes('aria-activedescendant')}"]`).text()).toBe(
        'Entertainment',
      )
      await wrapper.setProps({ options: options.map((option) => ({ ...option, disabled: true })) })
      expect(combobox.attributes('disabled')).toBeDefined()
      expect(combobox.attributes('aria-expanded')).toBe('false')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('treats spaces inside a typed label as search text, not selection', async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: 'Category',
        options: [
          { value: 'shopping', label: 'Food Shopping' },
          { value: 'delivery', label: 'Food Delivery' },
        ],
      },
    })
    const combobox = wrapper.get('[role="combobox"]')
    for (const key of 'food d') await combobox.trigger('keydown', { key })
    expect(combobox.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get(`[id="${combobox.attributes('aria-activedescendant')}"]`).text()).toBe(
      'Food Delivery',
    )
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await combobox.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['delivery']])
  })

  it('preserves the active option through reordering and finds a valid fallback when it is removed', async () => {
    const wrapper = mount(BaseSelect, { props: { label: 'Category', options, modelValue: 'all' } })
    const combobox = wrapper.get('[role="combobox"]')
    const activeText = () =>
      wrapper.get(`[id="${combobox.attributes('aria-activedescendant')}"]`).text()
    await combobox.trigger('keydown', { key: 'End' })
    expect(activeText()).toBe('Bills')
    await wrapper.setProps({ options: [options[2]!, options[0]!, options[1]!] })
    expect(activeText()).toBe('Bills')
    await wrapper.setProps({ options: [options[1]!] })
    expect(activeText()).toBe('Entertainment')
    await combobox.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['entertainment']])
  })

  it('has no operable popup when options are empty', async () => {
    const wrapper = mount(BaseSelect, {
      props: { label: 'Category', options: [], placeholder: 'No categories' },
    })
    const combobox = wrapper.get('[role="combobox"]')
    expect((combobox.element as HTMLButtonElement).disabled).toBe(true)
    await combobox.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('dismisses on outside pointer interaction or focus leaving without stealing focus', async () => {
    const wrapper = mount(BaseSelect, {
      props: { label: 'Category', options, modelValue: 'all' },
      attachTo: document.body,
    })
    const outside = document.createElement('button')
    document.body.append(outside)
    try {
      const combobox = wrapper.get('[role="combobox"]')
      await combobox.trigger('click')
      outside.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await wrapper.vm.$nextTick()
      expect(combobox.attributes('aria-expanded')).toBe('false')
      await combobox.trigger('click')
      await combobox.trigger('keydown', { key: 'ArrowDown' })
      outside.focus()
      await combobox.trigger('focusout', { relatedTarget: outside })
      expect(combobox.attributes('aria-expanded')).toBe('false')
      const updates = wrapper.emitted('update:modelValue') ?? []
      expect(updates[updates.length - 1]).toEqual(['entertainment'])
      expect(document.activeElement).toBe(outside)
    } finally {
      wrapper.unmount()
      outside.remove()
    }
  })

  it('associates help and error text with the field and clears corrected errors', async () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: 'Category',
        options,
        help: 'Choose one category',
        error: 'Choose a category',
      },
    })
    const combobox = wrapper.get('[role="combobox"]')
    const descriptions = () =>
      combobox
        .attributes('aria-describedby')
        ?.split(' ')
        .map((id) => wrapper.get(`[id="${id}"]`).text())
    expect(descriptions()).toEqual(['Choose one category', 'Choose a category'])
    expect(combobox.attributes('aria-invalid')).toBe('true')
    await wrapper.setProps({ error: '' })
    expect(descriptions()).toEqual(['Choose one category'])
    expect(combobox.attributes('aria-invalid')).toBeUndefined()
  })

  it('shows a placeholder and cannot open while disabled, including when disabled after opening', async () => {
    const wrapper = mount(BaseSelect, {
      props: { label: 'Category', options, placeholder: 'Choose a category', disabled: true },
    })
    const combobox = wrapper.get('[role="combobox"]')
    expect(combobox.text()).toBe('Choose a category')
    expect((combobox.element as HTMLButtonElement).disabled).toBe(true)
    ;(combobox.element as HTMLButtonElement).click()
    await combobox.trigger('keydown', { key: 'ArrowDown' })
    expect(combobox.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ disabled: false })
    await combobox.trigger('click')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    await wrapper.setProps({ disabled: true })
    expect(combobox.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('opens with Space and finds options by typing their labels', async () => {
    const wrapper = mount(BaseSelect, { props: { label: 'Category', options } })
    const combobox = wrapper.get('[role="combobox"]')
    await combobox.trigger('keydown', { key: ' ' })
    expect(combobox.attributes('aria-expanded')).toBe('true')
    await combobox.trigger('keydown', { key: 'b' })
    await combobox.trigger('keydown', { key: 'i' })
    expect(wrapper.get(`[id="${combobox.attributes('aria-activedescendant')}"]`).text()).toBe(
      'Bills',
    )
    await combobox.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['bills']])
  })

  it('cancels with Escape and supports endpoint navigation and Tab selection', async () => {
    const wrapper = mount(BaseSelect, { props: { label: 'Category', options, modelValue: 'all' } })
    const combobox = wrapper.get('[role="combobox"]')
    await combobox.trigger('keydown', { key: 'End' })
    expect(wrapper.get(`[id="${combobox.attributes('aria-activedescendant')}"]`).text()).toBe(
      'Bills',
    )
    await combobox.trigger('keydown', { key: 'Escape' })
    expect(combobox.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(combobox.text()).toBe('All Transactions')
    await combobox.trigger('keydown', { key: 'Home' })
    expect(wrapper.get(`[id="${combobox.attributes('aria-activedescendant')}"]`).text()).toBe(
      'All Transactions',
    )
    await combobox.trigger('keydown', { key: 'ArrowDown' })
    const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true })
    combobox.element.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([['entertainment']])
  })

  it('keeps focus on the combobox while navigating and commits only on Enter', async () => {
    const wrapper = mount(BaseSelect, {
      props: { label: 'Category', options, modelValue: 'all' },
      attachTo: document.body,
    })
    try {
      const combobox = wrapper.get('[role="combobox"]')
      ;(combobox.element as HTMLButtonElement).focus()
      await combobox.trigger('keydown', { key: 'ArrowDown' })
      expect(combobox.attributes('aria-expanded')).toBe('true')
      await combobox.trigger('keydown', { key: 'ArrowDown' })
      const activeId = combobox.attributes('aria-activedescendant')
      expect(wrapper.get(`[id="${activeId}"]`).text()).toBe('Entertainment')
      expect(document.activeElement).toBe(combobox.element)
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      await combobox.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('update:modelValue')).toEqual([['entertainment']])
      expect(combobox.attributes('aria-expanded')).toBe('false')
      expect(combobox.attributes('aria-activedescendant')).toBeUndefined()
      expect(document.activeElement).toBe(combobox.element)
    } finally {
      wrapper.unmount()
    }
  })

  it('opens labeled options and updates v-model when an option is selected', async () => {
    const wrapper = mount(
      defineComponent({
        components: { BaseSelect },
        setup: () => ({ selected: ref('all'), options }),
        template:
          '<BaseSelect v-model="selected" label="Category" :options="options" /><p>{{ selected }}</p>',
      }),
    )
    const combobox = wrapper.get('[role="combobox"]')
    expect(wrapper.get(`[id="${combobox.attributes('aria-labelledby')}"]`).text()).toBe('Category')
    expect(combobox.text()).toBe('All Transactions')
    expect(combobox.attributes('aria-expanded')).toBe('false')
    await combobox.trigger('click')
    expect(combobox.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[role="listbox"]').attributes('id')).toBe(
      combobox.attributes('aria-controls'),
    )
    const choices = wrapper.findAll('[role="option"]')
    expect(choices.map((option) => option.text())).toEqual([
      'All Transactions',
      'Entertainment',
      'Bills',
    ])
    expect(choices[0]!.attributes('aria-selected')).toBe('true')
    await choices[2]!.trigger('click')
    expect(combobox.text()).toBe('Bills')
    expect(wrapper.get('p').text()).toBe('bills')
    expect(combobox.attributes('aria-expanded')).toBe('false')
  })
})
