<template>
<tr>
  <td class="infl"
      v-for="([rowspan,rowindex,forms], index) in cells"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      @mouseover.stop="hiliteRow(rowindex)">
    <span class='comma'
          v-for="(form, i) in forms"
          :key="i">
      <nobr>
        <span v-if="prefix" class="context">{{prefix}}</span>
        {{gender ? tagToName(form) : form}}</nobr>
    </span>
  </td>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm, tagToName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowPron',
    props: ['paradigm','language'],
    data: function () {
        return {
            cells: [
                this.inflForm(['Nom']),
                this.inflForm(['Acc'])
            ].filter(r => r)
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (tagList) {
            let forms = inflectedForm(this.paradigm, tagList, [])
            if (forms) {
                return forms
            } else {
                return null
            }
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
