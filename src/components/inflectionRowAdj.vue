<template>
<tr>
  <td class="infl-cell"
      v-for="([[rowspan,rowindex,forms], headers], index) in rows"
      :key="index"
      :headers="headers"
      :rowspan="rowspan"
      :index="rowindex"
      @mouseover.stop="hiliteRow(rowindex)">
    <span class='comma'
          v-for="form in forms"
          :key="form"
          v-html="formattedForm(form)"/>
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
            rows: [ this.hasSing ? this.inflForm(['Pos',['Masc/Fem','Masc']], 'Sing Masc') : null,
                    this.hasFem && this.hasSing ? this.inflForm(['Pos','Fem'], 'Sing Fem') : null,
                    this.hasSing ? this.inflForm(['Pos','Neuter'], 'Sing Neuter') : null,
                    this.hasSing ? this.inflForm(['Pos','Def','Sing'],'Sing Def') : null,
                    this.inflForm(['Pos','Plur'], 'Plur')
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
