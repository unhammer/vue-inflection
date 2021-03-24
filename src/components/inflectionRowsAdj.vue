<template>
<tr>
  <template v-if="tags.tags && cells.length">
    <td class="infl sub xs">
      {{tagToName(tags.label)}}
    </td>
    <td class="infl xs"
        v-for="([rowspan,rowindex,forms], index) in cells"
        :key="index"
        :colspan="rowspan"
        :index="rowindex"
        @mouseover.stop="hiliteRow(rowindex)">
      <span class='comma'
            v-for="(form, index) in forms"
            :key="index">{{form}}</span>
    </td>
  </template>
  <template v-if="tags.title">
    <td class="infl group"
        :colspan="paradigms.length+1">
      {{tagToName(tags.title)}}
    </td>
  </template>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm, tagToName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsAdj',
    props: ['paradigms','tags','language'],
    data: function () {
        return {
            cells: !this.tags.title ?
                this.paradigms.map(
                    p => this.inflForm(p,
                                       this.tags.tags,
                                       this.tags.excl))
                .filter(r => r) :
                []
        }
    },
    methods: {
        inflForm: function (paradigm, tagList, exclTagList) {
            return inflectedForm(paradigm, tagList, exclTagList)
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language) || tag
        }
    }
}
</script>
