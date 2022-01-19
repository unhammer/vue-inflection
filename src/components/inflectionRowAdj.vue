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
    name: 'inflectionRowAdj',
    props: ['paradigm','hasFem','hasSing','lemmaId'],
    data: function () {
        return {
            rows: [ this.hasSing ? this.inflForm(['Pos',['Masc/Fem','Masc']]) : null,
                    this.hasFem && this.hasSing ? this.inflForm(['Pos','Fem']) : null,
                    this.hasSing ? this.inflForm(['Pos','Neuter']) : null,
                    this.hasSing ? this.inflForm(['Pos','Def','Sing']) : null,
                    this.inflForm(['Pos','Plur'])
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
