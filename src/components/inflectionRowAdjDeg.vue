<template>
<tr>
  <td class="infl-cell"
      v-for="([[rowspan,rowindex,forms,g,standardisation], headers], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      :headers="headers"
      @mouseover.stop="hiliteRow(rowindex)">
    <span v-if="standardisation!='STANDARD'">(</span>
    <span>
      <span class='comma'
            v-for="form in forms"
            :key="form">{{form}}</span>
    </span>
    <span v-if="standardisation!='STANDARD'">)</span>
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
            rows: [ this.inflForm(['Cmp'],'Deg Cmp'),
                    this.inflForm(['Sup','Ind'], 'Deg SupInd'),
                    this.inflForm(['Sup','Def'], 'Deg SupDef')
                  ].filter(r => r && r[0])
               }
    },
    methods: {
        inflForm: function (tagList, headers) {
            return [inflectedForm(this.paradigm, tagList), headers]
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemmaId + ' td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
