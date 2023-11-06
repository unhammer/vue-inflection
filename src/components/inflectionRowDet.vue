<template>
<tr>
  <td class="infl-cell"
      v-for="([[rowspan,rowindex,forms],headers], index) in cells"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      :headers="headers"
      @mouseover.stop="hiliteRow(rowindex)">
    <span class='comma'
          v-for="(form, i) in forms"
          :key="i">
    {{form}}</span>
  </td>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm, tagToName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowPron',
    props: ['paradigm','locLang','lemmaId'],
    data: function () {
        return {
            cells: [ this.inflForm(['Masc'],`Sing${this.lemmaId} Masc${this.lemmaId}`),
                     this.inflForm(['Fem'],`Sing${this.lemmaId} Fem${this.lemmaId}`),
                     this.inflForm(['Neuter'],`Sing${this.lemmaId} Neuter${this.lemmaId}`),
                     this.inflForm(['Def'],`Sing${this.lemmaId} Def${this.lemmaId}`),
                     this.inflForm([ 'Plur'],'Plur' + this.lemmaId)
                   ].filter(r => r[0])
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (tagList, headers) {
            return [inflectedForm(this.paradigm, tagList), headers]
        },
        tagToName: function (tag) {
            return tagToName(tag, this.locLang)
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemmaId + ' td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
