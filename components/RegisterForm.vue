<template>
  <div>
    <div class="text-center text-[28px] mb-4 font-bold">Sign up</div>

    <div class="px-6 pb-2">
      <TextInput
        placeholder="Full name"
        inputType="text"
        :autoFocus="true"
        :input="name"
        @update:input="name = $event"
        :error="errors && errors.name ? errors.name[0] : ''"
      />
    </div>

    <div class="px-6 pb-2">
      <TextInput
        placeholder="Email address"
        inputType="email"
        :input="email"
        @update:input="email = $event"
        :error="errors && errors.email ? errors.email[0] : ''"
      />
    </div>

    <div class="px-6 pb-2">
      <TextInput
        placeholder="Password"
        inputType="password"
        :input="password"
        @update:input="password = $event"
        :error="errors && errors.password ? errors.password[0] : ''"
      />
    </div>

    <div class="px-6 pb-2">
      <TextInput
        placeholder="Confirm password"
        inputType="password"
        @update:input="confirmPassword = $event"
        :input="confirmPassword"
        :error="
          errors && errors.confirmPassword ? errors.confirmPassword[0] : ''
        "
      />
    </div>
    <div class="px-6 text-[12px] text-gray-600">Forgot password?</div>

    <div class="px-6 pb-2 mt-6">
      <button
        :disabled="!name || !email || !password || !confirmPassword"
        :class="
          !name || !email || !password || !confirmPassword
            ? 'bg-gray-200'
            : 'bg-[#F02C56]'
        "
        @click="register()"
        class="w-full text-[17px] font-semibold text-white bg-[#F02C56] py-3 rounded-sm"
      >
        Sign up
      </button>
    </div>
  </div>
</template>

<script setup>
const { $userStore, $generalStore } = useNuxtApp();

let name = ref(null);
let email = ref(null);
let password = ref(null);
let confirmPassword = ref(null);
let errors = ref(null);

const register = async () => {
  errors.value = null;

  try {
    await $userStore.getTokens();
    await $userStore.register(
      name.value,
      email.value,
      password.value,
      confirmPassword.value
    );
    await $userStore.getUser();
    await $generalStore.getRandomUsers("suggested");
    await $generalStore.getRandomUsers("following");
    $generalStore.isLoginOpen = false;
  } catch (error) {
    console.log(error);
    errors.value = error.response.data.errors;
  }
};
</script>
