<script setup lang="ts">
import { X } from '@lucide/vue'
import Button from './Button.vue'

interface Payment {
    id: string
    merchant: string
    created_at: string
    amount: number
    status: string
}

defineProps < {
    payment: Payment | null
    isOpen: boolean
} > ()

defineEmits < {
    close: []
} > ()

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    })
}
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-40 bg-black/50 transition-opacity" @click="$emit('close')" />
    
    <div :class="[
              'fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-lg transition-transform duration-300',
              isOpen ? 'translate-x-0' : 'translate-x-full',
            ]">
        <div v-if="payment" class="flex h-full flex-col overflow-hidden">
            <div class="flex items-center justify-between border-b border-[#E5E5EA] px-6 py-4">
                <h2 class="text-lg font-bold">Payment Details</h2>
                <button type="button" @click="$emit('close')" class="cursor-pointer rounded-lg p-2 hover:bg-[#F0F0F3] transition-colors">
                  <X :size="20" class="text-[#6B6B76]" />
                </button>
            </div>
    
            <div class="flex-1 overflow-y-auto px-6 py-4">
                <div class="space-y-5">
                    <div>
                        <label class="text-xs font-semibold text-[#6B6B76] uppercase">Payment ID</label>
                        <p class="mt-1 font-mono text-sm font-semibold text-[#14151C]">{{ payment.id }}</p>
                    </div>
    
                    <div>
                        <label class="text-xs font-semibold text-[#6B6B76] uppercase">Merchant</label>
                        <p class="mt-1 text-sm font-semibold text-[#14151C]">{{ payment.merchant }}</p>
                    </div>
    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-semibold text-[#6B6B76] uppercase">Amount</label>
                            <p class="mt-1 text-sm font-semibold text-[#14151C]">
                                {{ Number(payment.amount).toLocaleString('id-ID', { minimumFractionDigits: 2 }) }}
                            </p>
                        </div>
                    </div>
    
                    <div>
                        <label class="text-xs font-semibold text-[#6B6B76] uppercase">Status</label>
                        <p class="mt-1 text-sm font-semibold text-[#14151C] capitalize">{{ payment.status }}</p>
                    </div>
    
                    <div>
                        <label class="text-xs font-semibold text-[#6B6B76] uppercase">Date</label>
                        <p class="mt-1 text-sm font-semibold text-[#14151C]">{{ formatDate(payment.created_at) }}</p>
                    </div>
    
                    <div>
                        <label class="text-xs font-semibold text-[#6B6B76] uppercase">Time</label>
                        <p class="mt-1 text-sm font-semibold text-[#14151C]">{{ formatTime(payment.created_at) }}</p>
                    </div>
                </div>
            </div>
    
            <div class="border-t border-[#E5E5EA] px-6 py-4">
                <Button type="button" variant="primary" class="w-full" @click="$emit('close')">Close</Button>
            </div>
        </div>
    </div>
</template>
