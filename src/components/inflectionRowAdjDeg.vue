<template>
<tr>
  <td class="infl-cell"
      v-for="([rowspan,rowindex,forms], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex">
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
    name: 'inflectionRowAdjDeg',
    props: ['paradigm','lemmaId'],
    data: function () {
        return {
            rows: [ this.inflForm(['Cmp']),
                    this.inflForm(['Sup','Ind']),
                    this.inflForm(['Sup','Def'])
                  ].filter(r => r)
               }
    },
    methods: {
        inflForm: function (tagList,exclTagList) {
            return inflectedForm(this.paradigm, tagList, exclTagList)
        }
    }
}
</script>
