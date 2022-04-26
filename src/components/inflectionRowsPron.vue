<template>
<tr class="infl-row">
  <template v-if="tags.tags">
    <th v-if="tags.label" class="infl-label xs">
      {{tagToName(tags.label)}}
    </th>
    <td class="infl-cell"
        v-for="([rowspan,rowindex,forms], index) in cells"
        :key="index"
        :colspan="rowspan"
        :index="rowindex"
        @mouseover.stop="hiliteRow(rowindex)">
      <span class='comma'
            v-for="(form, index) in forms"
            :key="index">
        {{form}}</span>
    </td>
  </template>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm, tagToName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsPron',
    props: ['paradigms','lemma','tags','language','lemmaId'],
    data: function () {
        return {
            cells: this.paradigms.map(p => this.inflForm(p, this.tags.tags))
        }
    },
    computed: {
    },
    methods: {
        inflForm: function (paradigm, tagList) {
            let forms = inflectedForm(paradigm, tagList, [])
            return forms || [1,0,[this.lemma]] // workaround for missing inflection
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemmaId + ' td[index*='+ i + ']').addClass('hilite'))
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }
    }
}
</script>
