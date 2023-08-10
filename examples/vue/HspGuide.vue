<template>
  <div class=' hello wewuyi  werywui' :style="{height: styleOpts.height + 'px'}">
    <div :class="[{hello: true}, 'hello']" class=' hello wewuyi '></div>
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