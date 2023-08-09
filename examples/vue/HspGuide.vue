<template>
  <div class="hello" :style="{height: styleOpts.height + 'px'}">
    hello world
  </div>
</template>
<script>
export default {
  name: 'Hello',
  data () {
  },
  // created() { this.$sdk.native.setSystemStatusBar({hidden: true}, null); },
  methods: {
  }
}
</script>
<style scoped>
.hello {
  font-size: 58px;
}
</style>