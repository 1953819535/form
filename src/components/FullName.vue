<script lang="ts" setup>
const firstname = defineModel("firstname", { type: String, default: "" });
const lastname = defineModel("lastname", { type: String, default: "" });
</script>

<template>
  <div class="child-box">
    <div>
      <label>First Name: </label>
      <a-input v-model:value="firstname" />
    </div>
    <div>
      <label>Last Name: </label>
      <a-input v-model:value="lastname" />
    </div>
  </div>
</template>
