<template>
<tr>
  <td class="infl" :class="mq"
      v-for="([prefix, [rowspan,rowindex,forms], suffix], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      @mouseover.stop="hiliteRow(rowindex)">
    <span class='comma'
          v-for="(form, index) in forms"
          :key="index">
      <span v-if="prefix" class="context">{{prefix}}</span>
      {{form}}
      <nobr>
        <span v-if="suffix" class="context">{{suffix}}</span>
      </nobr>
    </span>
  </td>

</tr>
</template>

<script>

// needed for hiliting
import $ from 'jquery'

import { inflectedForm
       } from '@/components/mixins/ordbankUtils.js'

export default {
    name: 'inflectionRowParticiple',
    props: ['paradigm','hasPerfPart','language','part', 'mq'],
    data: function () {
        return { rows: [
            this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Masc/Fem'],
                                             this.language == 'nob' ? 'en/ei' : 'ein/ei',
                                             '+ substantiv') : null,
            this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Neuter'],
                                             this.language == 'nob' ? 'et' : 'eit',
                                             '+ substantiv') : null,
            this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Def'],'den/det', '+ substantiv') : null,
            this.hasPerfPart && this.part!=3 ? this.inflForm(['Adj','Plur'],null,'+ substantiv') : null,
            this.part!=3 ? this.inflForm(['Adj','<PresPart>']) : null
        ].filter(r => r) }
    },
    methods: {
        inflForm: function (tagList,prefix,suffix) {
            let forms = inflectedForm(this.paradigm, tagList)
            if (forms) {
                return [prefix, forms, suffix]
            } else {
                return null
            }
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))
        }
    }
}

</script>

<style>

span.context {
    color: gray;
}

</style>
