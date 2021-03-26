<template>
<tr>
  <td class="infl" :class="$mq"
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
    props: ['paradigm','hasFem'],
    data: function () {
        return {
            rows: [ this.inflForm(['Pos',['Masc/Fem','Masc']]),
                    this.hasFem ? this.inflForm(['Pos','Fem']) : null,
                    this.inflForm(['Pos','Neuter']),
                    this.inflForm(['Pos','Def','Sing']),
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
            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
