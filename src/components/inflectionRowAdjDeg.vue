<template>
<tr>
  <td class="notranslate infl-cell"
      v-for="([[rowspan,rowindex,forms,g,standardisation], headers], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :headers="headers"
      :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
      :data-rowindex="rowindex.join(',')"
      @mouseover="$emit('hilite', rowindex, lemmaId)"
      @mouseleave="$emit('unhilite')">
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

import { inflectedForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowAdjDeg',
    props: ['paradigm','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            rows: [ this.inflForm(['Cmp'],`Deg${this.lemmaId} Cmp${this.lemmaId}`),
                    this.inflForm(['Sup','Ind'], `Deg${this.lemmaId} SupInd${this.lemmaId}`),
                    this.inflForm(['Sup','Def'], `Deg${this.lemmaId} SupDef${this.lemmaId}`)
                  ].filter(r => r && r[0])
               }
    },
    methods: {
        inflForm: function (tagList, headers) {
            return [inflectedForm(this.paradigm, tagList), headers]
        }
    }
}
</script>
