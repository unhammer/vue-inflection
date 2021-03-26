<template>
<tr>
  <template v-if="tags.tags">
    <td v-if="tags.label" class="infl sub xs">
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
    props: ['paradigms','lemma','tags','language'],
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
            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }
    }
}
</script>
