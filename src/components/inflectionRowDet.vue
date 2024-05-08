<template>
<tr>
  <td class="infl-cell"
      v-for="([[rowspan,rowindex,forms],headers], index) in cells"
      :key="index"
      :rowspan="rowspan"
      :headers="headers"
      :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
      :data-rowindex="rowindex.join(',')"
      @mouseover="$emit('hilite', rowindex, lemmaId)"
      @mouseleave="$emit('unhilite')">
    <span class='comma'
          v-for="(form, i) in forms"
          :key="i">
    {{form}}</span>
  </td>
</tr>
</template>

<script>

import { inflectedForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowDet',
    props: ['paradigm','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: [ this.inflForm(['Masc'],`Sing${this.lemmaId} Masc${this.lemmaId}`),
                     this.inflForm(['Fem'],`Sing${this.lemmaId} Fem${this.lemmaId}`),
                     this.inflForm(['Neuter'],`Sing${this.lemmaId} Neuter${this.lemmaId}`),
                     this.inflForm(['Def'],`Sing${this.lemmaId} Def${this.lemmaId}`),
                     this.inflForm([ 'Plur'],'Plur' + this.lemmaId)
                   ].filter(r => r[0] && r[0][0])
        }
    },
    methods: {
        inflForm: function (tagList, headers) {
            return [inflectedForm(this.paradigm, tagList), headers]
        }
    }
}
</script>
