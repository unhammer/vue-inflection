<template>
<tr>
  <template v-for="([prefix, [rowspan,rowindex,forms,g,standardisation], gender, colref], index) in cells"> 
    <th v-if="gender"
        class="infl-label"
        :id="colref"
        scope="row"
        :headers="'Gender'+lemma.id"
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
      <span v-if="standardisation!='STANDARD'">(</span>
      <span>
        <span class='comma'
              v-for="(form, i) in forms"
              :key="i"><em v-if="prefix" class="context">{{prefix}}&nbsp;</em><span v-html="formattedForm(form)"/></span>
      </span>
      <span v-if="standardisation!='STANDARD'">)</span>
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
    props: ['paradigm','dict', 'locale', 'showGender', 'lemma','hasDef', 'hasSing', 'hasPlur'],
    data: function () {
        return {
            cells: [
                this.showGender ? this.inflForm(['_gender']) : null, // special gender column
                this.inflForm(['Sing','Ind'], this.hasSing, this.indefArticle()),
                this.inflForm(['Sing','Def'], this.hasSing && this.hasDef),
                this.inflForm(['Plur','Ind'], this.hasPlur),
                this.inflForm(['Plur','Def'], this.hasPlur && this.hasDef)
            ].filter(r => r)
        }
    },
    methods: {
        indefArticle: function () {
            return indefArticle(this.paradigm.tags, this.dict)
        },
        inflForm: function (tagList,display,prefix) {
            let forms = inflectedForm(this.paradigm, tagList, [])
            if (!forms) {
                return null
            } else if (forms[0] == null) {
                return display ? [null, [1,null,['–'],null,'STANDARD'], false, ''] : null
            } else if (tagList[0]=='_gender') {
                return [prefix, forms, true, forms[2]]
            } else {
                let gender = (this.showGender && forms[3]) ? forms[3].join(' ') + ' ' : ''
                return [prefix,
                        forms,
                        false,
                        gender + tagList[0] + this.lemma.id + ' ' + tagList[0] + tagList[1] + this.lemma.id
                       ]
            } 
        },
        formattedForm: function (form) {
            return markdownToHTML(form)
        },
        tagToName: function (tag) {
            return tagToName(tag, this.locale)
        },
        hiliteRow: function (rowindex) {
            if (rowindex) {
                $('td[index]').removeClass('hilite')
                rowindex.forEach(i => $('#lemma' + this.lemma.id + ' td[index*='+ i + ']').addClass('hilite'))
            }
        }
    }
}
</script>
