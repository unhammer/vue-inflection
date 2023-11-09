<template>
<tr class="infl-row">
  <template v-if="tags.tags && cells.length">
    <th class="infl-label xs"
        :id="tags.label"
        scope="row">
      {{$t(tags.label)}}
    </th>
    <td class="notranslate infl-cell xs"
        v-for="([rowspan,rowindex,forms], index) in cells"
        :key="index"
        :colspan="rowspan"
        :headers="tags.block + ' ' + (tags.label || '')"
        :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
        @mouseover="$emit('hilite', rowindex, lemmaId)"
        @mouseleave="$emit('unhilite')">
      <span class='comma'
            v-for="(form, index) in forms"
            :key="index">{{form}}</span>
    </td>
  </template>
  <template v-if="tags.title">
    <th class="infl-group"
        :id="tags.title"
        scope="col"
        :colspan="paradigms.length+1">
      {{$t(tags.title)}}
    </th>
  </template>
</tr>
</template>

<script>

import { inflectedForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsAdj',
    props: ['paradigms','tags','lemmaId'],
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
        }
    }
}

</script>
