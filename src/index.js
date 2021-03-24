import Vue from 'vue'
import inflectionTable from './components/inflectionTable.vue'

export default {
    install(Vue, options) {
        Vue.component('inflectionTable', inflectionTable)
    }
}
