<template>
<tr>
  <td class="infl"
      :class="gender ? 'sub':''"
      v-for="([prefix, [rowspan,rowindex,forms], gender], index) in cells"
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

import { inflectedForm, tagToName, indefArticle
       } from '@/components/mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowNoun',
    props: ['paradigm','language', 'showGender'],
    data: function () {
        return {
            cells: [
                this.showGender ? this.inflForm(['_gender']) : null, // special gender column
                this.inflForm(['Sing','Ind'], this.indefArticle()),
                this.inflForm(['Sing','Def']),
                this.inflForm(['Plur','Ind']),
                this.inflForm(['Plur','Def'])
            ].filter(r => r)
        }
    },
    computed: {
    },
    methods: {
        indefArticle: function () {
            return indefArticle(this.paradigm.tags, this.language)
        },
        inflForm: function (tagList,prefix) {
            let forms = inflectedForm(this.paradigm, tagList, [])
            if (forms) {
                return [prefix, forms, tagList[0]=='_gender']
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
