<template>
    <div class="modal">
        <div class="modal-container">
          <p>{{ title }}</p>
          <div class="modal-button-container">
            <button @click="emit('onCancel')">{{ cancelButtonText  }}</button>
            <button @click="emit('onConfirm')" class="confirm-btn">{{ confirmButtonText  }}</button>
          </div>
        </div>
      </div>
</template>

<script setup>
/* eslint-disable */

import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    title: String,
    confirmButtonText: String,
    cancelButtonText: String,
})

const emit = defineEmits(['onConfirm', 'onCancel'])

onMounted(() => {

});

</script>
  
<style lang="scss">


    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;

        .modal-container {
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            text-align: center;
            
            p {
                color: black;
            }

            .modal-button-container {
                margin-top: 1rem;
                display: flex;
                justify-content: space-around;

                .confirm-btn {
                }
            }
        }
    }



</style>
  