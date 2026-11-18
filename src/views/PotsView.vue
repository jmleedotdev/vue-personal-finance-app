<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/BaseButton.vue'
import PotCard from '@/components/PotCard.vue'
import BaseModal from '@/components/BaseModal.vue'
import PotForm from '@/components/PotForm.vue'
import PotTransferForm from '@/components/PotTransferForm.vue'
import { formatCurrency } from '@/utils/currency'
import { usePotsStore, type PotInput, type PotTransferOperation } from '@/stores/pots'

const store = usePotsStore()
const { pots, themeOptions, canAddPot } = storeToRefs(store)
const adding = ref(false)
const addButton = useTemplateRef('addButton')
const deletingId = ref<string | null>(null)
const deletingPot = computed(() => pots.value.find((pot) => pot.id === deletingId.value))
const deletionError = ref('')
function openDelete(id: string) {
  deletionError.value = ''
  deletingId.value = id
}
function deletePot() {
  if (!deletingId.value) return
  if (store.deletePot(deletingId.value)) deletingId.value = null
  else
    deletionError.value =
      'This deletion would exceed the supported safe monetary values. Your pot and Current Balance have not changed.'
}
function deletionReturnFocus() {
  return canAddPot.value ? (addButton.value?.$el as HTMLButtonElement) : heading.value
}
const transferOperation = ref<PotTransferOperation>('add')
const transferPotId = ref<string | null>(null)
function openTransfer(id: string, operation: PotTransferOperation) {
  transferOperation.value = operation
  transferPotId.value = id
}
const transferPot = computed(() => pots.value.find((pot) => pot.id === transferPotId.value))
const editingId = ref<string | null>(null)
const editingPot = computed(() => pots.value.find((pot) => pot.id === editingId.value))
const editNames = computed(() =>
  pots.value.filter((pot) => pot.id !== editingId.value).map((pot) => pot.name),
)
const editThemes = computed(() => store.potThemeOptions(editingId.value ?? undefined))
function savePot(input: PotInput) {
  if (editingId.value && store.updatePot(editingId.value, input)) editingId.value = null
}
const heading = useTemplateRef('heading')
function addPot(input: PotInput) {
  if (store.addPot(input)) adding.value = false
}
</script>

<template>
  <main
    id="main-content"
    tabindex="-1"
    class="mx-auto flex w-full max-w-[1520px] min-w-0 flex-col gap-8 px-4 pt-6 pb-[calc(84px+env(safe-area-inset-bottom))] md:px-10 md:pt-8 md:pb-[calc(109px+env(safe-area-inset-bottom))] xl:pb-8"
  >
    <header class="flex min-h-14 items-center justify-between gap-4">
      <h1 ref="heading" tabindex="-1" class="text-preset-1">Pots</h1>
      <BaseButton
        ref="addButton"
        aria-label="Add New Pot"
        :disabled="!canAddPot"
        @click="adding = true"
        >+ Add New Pot</BaseButton
      >
    </header>
    <section
      v-if="!pots.length"
      aria-labelledby="empty-pots-heading"
      class="rounded-xl bg-white px-5 py-6 md:p-8"
    >
      <h2 id="empty-pots-heading" class="text-preset-2">No pots yet</h2>
      <p class="mt-4 text-gray-500">
        Create a pot with Add New Pot to start saving toward your next goal.
      </p>
    </section>
    <div v-else class="grid min-w-0 gap-6 xl:grid-cols-2">
      <PotCard
        v-for="pot in pots"
        :key="pot.id"
        :pot="pot"
        :can-add-money="store.currentBalance > 0"
        @edit="editingId = $event"
        @delete="openDelete"
        @add-money="openTransfer($event, 'add')"
        @withdraw="openTransfer($event, 'withdraw')"
      />
    </div>
    <BaseModal
      v-if="deletingPot"
      :heading="`Delete ‘${deletingPot.name}’?`"
      :description="`Are you sure you want to delete this pot? This action cannot be reversed. ${formatCurrency(deletingPot.total)} will be returned to your Current Balance.`"
      :return-focus="deletionReturnFocus"
      @close="deletingId = null"
    >
      <p v-if="deletionError" role="alert" class="text-red">{{ deletionError }}</p>
      <BaseButton variant="destroy" @click="deletePot">Yes, Confirm Deletion</BaseButton>
      <BaseButton variant="tertiary" class="min-h-8" @click="deletingId = null"
        >No, Go Back</BaseButton
      >
    </BaseModal>
    <BaseModal
      v-if="transferPot"
      :heading="`${transferOperation === 'add' ? 'Add to' : 'Withdraw from'} ‘${transferPot.name}’`"
      :description="
        transferOperation === 'add'
          ? 'Reserve money from your Current Balance to save toward your goal. You can add beyond your target.'
          : 'Withdraw money from your pot into your Current Balance. You can withdraw up to the full saved amount without removing your goal.'
      "
      :return-focus="() => heading"
      @close="transferPotId = null"
    >
      <PotTransferForm
        :pot="transferPot"
        :operation="transferOperation"
        :preview="(input) => store.previewTransfer(transferPot!.id, input, transferOperation)"
        :confirm="(input) => store.transferMoney(transferPot!.id, input, transferOperation)"
        @complete="transferPotId = null"
      />
    </BaseModal>
    <BaseModal
      v-if="adding"
      heading="Add New Pot"
      description="Create a pot to set savings targets. These can help keep you on track as you save for special purchases."
      :return-focus="() => heading"
      @close="adding = false"
    >
      <PotForm :themes="themeOptions" :names="pots.map((pot) => pot.name)" @submit="addPot" />
    </BaseModal>
    <BaseModal
      v-if="editingPot"
      heading="Edit Pot"
      description="If your saving targets change, feel free to update your pots."
      @close="editingId = null"
    >
      <PotForm
        :initial-pot="editingPot"
        :themes="editThemes"
        :names="editNames"
        @submit="savePot"
      />
    </BaseModal>
  </main>
</template>
