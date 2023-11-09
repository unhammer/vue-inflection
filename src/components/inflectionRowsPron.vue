<template>
<tr class="infl-row">
  <template v-if="tags.tags">
    <th v-if="tags.label"
        class="infl-label xs"
        :id="tags.label"
        scope="row">
      {{$t(tags.label)}}
    </th>
    <td class="notranslate infl-cell"
        v-for="([rowspan,rowindex,forms], index) in cells"
        :key="index"
        :colspan="rowspan"
        :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
        @mouseover="$emit('hilite', rowindex, lemmaId)"
        @mouseleave="$emit('unhilite')">
      <span class='comma'
            v-for="(form, index) in forms"
            :key="index">
        {{form}}</span>
    </td>
  </template>
</tr>
</template>

<script>

import { inflectedForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsPron',
    props: ['paradigms','tags','lemmaId'],
    data: function () {
        return {
            cells: this.paradigms.map(p => this.inflForm(p, this.tags.tags))
        }
    },
    methods: {
        inflForm: function (paradigm, tagList) {
            let forms = inflectedForm(paradigm, tagList, [])
            return forms || [1,0,[this.lemma]] // workaround for missing inflection
        }
    }
}
</script>
