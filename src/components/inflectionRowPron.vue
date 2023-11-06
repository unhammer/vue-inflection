<template>
<tr>
  <td class="infl-cell"
      v-for="([rowspan,rowindex,forms], index) in cells"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
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

import { inflectedForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowPron',
    props: ['paradigm','lemmaId'],
    data: function () {
        return {
            cells: [
                this.inflForm(['Nom']),
                this.inflForm(['Acc']),
                this.inflForm(['Neuter'])
            ].filter(r => r)
        }
    },
    methods: {
        inflForm: function (tagList) {
            return inflectedForm(this.paradigm, tagList)
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemmaId + ' td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
