<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <inflectionTable :lemmaList="lemmaList" :mq="$mq" />
  </div>
</template>

<script>
import inflectionTable from './components/inflectionTable.vue'

import Vue from 'vue'
import VueMq from 'vue-mq'

// same breakpoints as bootstrap-vue
Vue.use(VueMq, {
    breakpoints: {
        xs: 576,
        sm: 768,
        md: 992,
        lg: 1200,
        xl: Infinity
    }
})

export default {
  name: 'App',
  components: {
    inflectionTable
  },
  data: function() {
    return {
      lemmaList: [{"word_class": "NOUN", "lemma":"fly","id":18042,"hgno":2,"initial_lexeme":"","final_lexeme":"fly","paradigm_info":[{"paradigm_id":667,"inflection_group":"NOUN","standardisation":"STANDARD","tags":["NOUN","Neuter"],"from":"1996-01-01","to":null,"inflection":[{"word_form":"fly","tags":["Sing","Ind"]},{"word_form":"flyet","tags":["Sing","Def"]},{"word_form":"fly","tags":["Plur","Ind"]},{"word_form":"flya","tags":["Plur","Def"]}]},{"paradigm_id":677,"inflection_group":"NOUN","standardisation":"STANDARD","tags":["NOUN","Neuter"],"from":"1996-01-01","to":null,"inflection":[{"word_form":"fly","tags":["Sing","Ind"]},{"word_form":"flyet","tags":["Sing","Def"]},{"word_form":"fly","tags":["Plur","Ind"]},{"word_form":"flyene","tags":["Plur","Def"]}]}]}]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
