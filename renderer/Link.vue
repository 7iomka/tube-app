<template>
  <a :class="{ active: isActive }">
    <slot />
  </a>
</template>
<style scoped>
a {
  padding: 2px 10px;
  margin-left: -10px;
}
a.active {
  color: #ffeead;
}
</style>
<script setup>
import { useAttrs, computed } from 'vue';
import { usePageContext } from './usePageContext';

const pageContext = usePageContext();
const { href } = useAttrs();
const isActive = computed(() => {
  const { urlPathname } = pageContext.value;
  return href === '/' ? urlPathname === href : urlPathname.startsWith(href);
});
</script>
