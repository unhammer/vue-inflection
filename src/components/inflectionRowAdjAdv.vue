<template>
<tr>
  <td class="infl-cell"
      v-for="([rowspan,rowindex,forms], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      @mouseover.stop="hiliteRow(rowindex)">
    <span class='comma'
          v-for="form in forms"
          :key="form">
      {{form}}</span>
  </td>
  
</tr>
</template>

<script>

import $ from 'jquery'
import { inflectedForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowAdjAdv',
    props: ['paradigm','lemmaId'],
    data: function () {
        return {
            rows: [ this.inflForm(['Pos']),
                    this.inflForm(['Cmp']),
                    this.inflForm(['Sup'])
                  ].filter(r => r)
               }
    },
    methods: {
        inflForm: function (tagList,exclTagList) {
            return inflectedForm(this.paradigm, tagList, exclTagList)
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemmaId + ' td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
