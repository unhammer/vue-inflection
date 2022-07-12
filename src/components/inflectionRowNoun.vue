<template>
<tr>
  <template v-for="([prefix, [rowspan,rowindex,forms], gender, colref], index) in cells"> 
    <th v-if="gender"
        class="infl-label"
        :id="colref"
        scope="row"
        headers="gender"
        :key="index"
        :rowspan="rowspan"
        :index="rowindex"
        @mouseover.stop="hiliteRow(rowindex)">
      <span class='comma'
            v-for="(form, i) in forms"
            :key="i">{{tagToName(form)}}</span>
    </th>
    <td v-else
        class="infl-cell"
        :headers="colref"
        :key="index"
        :rowspan="rowspan"
        :index="rowindex"
        @mouseover.stop="hiliteRow(rowindex)">
      <span class='comma'
            v-for="(form, i) in forms"
            :key="i"><em v-if="prefix" class="context">{{prefix}}</em>&nbsp;<span v-html="formattedForm(form)"/></span>
    </td>
  </template>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm, tagToName, indefArticle, markdownToHTML
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowNoun',
    props: ['paradigm','language', 'showGender', 'lemma'],
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
    methods: {
        indefArticle: function () {
            return indefArticle(this.paradigm.tags, this.language)
        },
        inflForm: function (tagList,prefix) {
            let forms = inflectedForm(this.paradigm, tagList, [])
            if (!forms) {
                return null
            } else if (tagList[0]=='_gender') {
                return [prefix, forms, true, forms[2]]
            } else {
                let gender = (this.showGender && forms[3]) ? forms[3].join(' ') + ' ' : ''
                return [prefix, forms, false, gender + tagList[0] +  ' ' + tagList[0] + tagList[1]]
            } 
        },
        formattedForm: function (form) {
            return markdownToHTML(form)
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemma.id + ' td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
