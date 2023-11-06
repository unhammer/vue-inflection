<template>
<tr>
  <td class="infl-cell"
      v-for="([[rowspan,rowindex,forms,g,standardisation], headers], index) in rows"
      :key="index"
      :headers="headers"
      :rowspan="rowspan"
      :index="rowindex"
      @mouseover.stop="hiliteRow(rowindex)">
    <span v-if="standardisation!='STANDARD'">(</span>
    <span>
      <span class='comma'
            v-for="form in forms"
            :key="form"
            v-html="formattedForm(form)"/>
    </span>
    <span v-if="standardisation!='STANDARD'">)</span>
  </td>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm, markdownToHTML
       } from './mixins/ordbankUtils.js'

export default {
    name: 'inflectionRowAdj',
    props: ['paradigm','hasFem','hasSing','lemmaId'],
    data: function () {
        return {
            rows: [ this.hasSing ? this.inflForm(['Pos',['Masc/Fem','Masc']],
                                                 `Sing${this.lemmaId} Masc${this.lemmaId}`) : null,
                    this.hasFem && this.hasSing ? this.inflForm(['Pos','Fem'],
                                                                `Sing${this.lemmaId} Fem${this.lemmaId}`) : null,
                    this.hasSing ? this.inflForm(['Pos','Neuter'],
                                                 `Sing${this.lemmaId} Neuter${this.lemmaId}`) : null,
                    this.hasSing ? this.inflForm(['Pos','Def','Sing'],
                                                 `Sing${this.lemmaId} Def${this.lemmaId}`) : null,
                    this.inflForm(['Pos','Plur'], 'Plur' + this.lemmaId)
                  ].filter(r => r && r[0])
        }
    },
    methods: {
        inflForm: function (tagList,headers) {
            return [inflectedForm(this.paradigm, tagList, []), headers]
        },
        formattedForm: function (form) {
            return markdownToHTML(form)
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemmaId + ' td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
