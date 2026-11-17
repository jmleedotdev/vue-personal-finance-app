import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import BaseInput from '../BaseInput.vue'

describe('BaseInput', () => {
  it('disables the native field and preserves input attributes on the field', async () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Pot name', disabled: true },
      attrs: { name: 'pot-name', maxlength: 30, placeholder: 'e.g. Holiday' },
    })
    const input = wrapper.get('input')
    expect(input.element.disabled).toBe(true)
    expect(input.element.name).toBe('pot-name')
    expect(input.element.maxLength).toBe(30)
    expect(input.element.placeholder).toBe('e.g. Holiday')
    await wrapper.setProps({ disabled: false })
    expect(input.element.disabled).toBe(false)
  })

  it('describes the field with help and error text and clears the error state when corrected', async () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Pot name', help: 'Choose a memorable name', error: 'Enter a name' },
    })
    const input = wrapper.get('input')
    const descriptions = () =>
      input
        .attributes('aria-describedby')
        ?.split(' ')
        .map((id) => wrapper.get(`[id="${id}"]`).text())
    expect(descriptions()).toEqual(['Choose a memorable name', 'Enter a name'])
    expect(input.attributes('aria-invalid')).toBe('true')
    await wrapper.setProps({ error: '' })
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(descriptions()).toEqual(['Choose a memorable name'])
  })

  it('associates its label and keeps the displayed value in sync with v-model', async () => {
    const wrapper = mount(
      defineComponent({
        components: { BaseInput },
        setup: () => ({ name: ref('Holiday') }),
        template: '<BaseInput v-model="name" label="Pot name" /><p>{{ name }}</p>',
      }),
    )
    const input = wrapper.get('input')
    expect(input.element.labels?.[0]?.textContent).toBe('Pot name')
    expect(input.element.value).toBe('Holiday')
    await input.setValue('Emergency fund')
    expect(wrapper.get('p').text()).toBe('Emergency fund')
  })
})
