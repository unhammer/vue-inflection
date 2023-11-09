<template>
<tr>
  <td class="notranslate infl-cell"
      v-for="([rowspan,rowindex,forms], index) in cells"
      :key="index"
      :rowspan="rowspan"
      :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
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
    name: 'inflectionRowPron',
    props: ['paradigm','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: [
                this.inflForm(['Nom']),
                this.inflForm(['Acc']),
                this.inflForm(['Neuter'])
            ].filter(r => r[0])
        }
    },
    methods: {
        inflForm: function (tagList) {
            return inflectedForm(this.paradigm, tagList)
        }
    }
}
</script>
