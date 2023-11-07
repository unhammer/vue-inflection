<template>
<tr class="infl-row">
  <template v-if="tags.tags && cells.length">
    <th class="infl-label xs"
        :id="tags.label + lemmaId"
        scope="row">
      {{tagToName(tags.label)}}
    </th>
    <td class="notranslate infl-cell"
        v-for="([rowspan,rowindex,forms], index) in cells"
        :key="index"
        :colspan="rowspan"
        :headers="tags.block + lemmaId + ' ' + (tags.label ? tags.label + lemmaId : '')"
        :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
        @mouseover="$emit('hilite', rowindex, lemmaId)"
        @mouseleave="$emit('unhilite')">
      <span class='comma'
            v-for="(form, index) in forms"
            :key="index"
            v-html="formattedForm(form)"/>
    </td>
  </template>
  <template v-if="tags.title">
    <th class="infl-group"
        :id="tags.title"
        scope="col"
        :colspan="paradigms.length+1">
      {{tagToName(tags.title)}}
    </th>
  </template>
</tr>
</template>

<script>

import { inflectedForm, markdownToHTML, tagToName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsAdj',
    props: ['paradigms','tags','locale','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: !this.tags.title ?
                this.paradigms.map(
                    p => this.inflForm(p,
                                       this.tags.tags,
                                       this.tags.excl))
                .filter(r => r && r[0]) :
                []
        }
    },
    methods: {
        inflForm: function (paradigm, tagList, exclTagList) {
            return inflectedForm(paradigm, tagList, exclTagList)
        },
        formattedForm: function (form) {
            return markdownToHTML(form)
        },
        tagToName: function (tag) {
            return tagToName(tag, this.locale) || tag
        }
    }
}
</script>
