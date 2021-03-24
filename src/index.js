import Vue from 'vue'
import InflectionTable from './components/inflectionTable.vue'

export default {
    install(Vue, options) {
        Vue.component('inflectionTable', InflectionTable)
    }
}
