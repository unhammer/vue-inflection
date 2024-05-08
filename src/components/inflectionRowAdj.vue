<template>
<tr>
  <td class="notranslate infl-cell"
      v-for="([[rowspan,rowindex,forms,g,standardisation], headers], index) in rows"
      :key="index"
      :headers="headers"
      :rowspan="rowspan"
      :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
      :data-rowindex="rowindex.join(',')"
      @mouseover="$emit('hilite', rowindex, lemmaId)"
      @mouseleave="$emit('unhilite')">
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

import { inflectedForm, markdownToHTML
       } from './mixins/ordbankUtils.js'

export default {
    name: 'inflectionRowAdj',
    props: ['paradigm','hasFem','hasSing','lemmaId'],
    emits: ['hilite', 'unhilite'],
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
        }
    }
}
</script>
