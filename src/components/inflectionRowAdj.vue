<template>
<tr>
  <td class="infl-cell"
      v-for="([rowspan,rowindex,forms], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex">
    <span class='comma'
          v-for="form in forms"
          :key="form">
      {{form}}</span>
  </td>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm
       } from './mixins/ordbankUtils.js'

export default {
    name: 'inflectionRowAdj',
    props: ['paradigm','hasFem','lemmaId'],
    data: function () {
        return {
            rows: [ this.inflForm(['Pos',['Masc/Fem','Masc']]),
                    this.hasFem ? this.inflForm(['Pos','Fem']) : null,
                    this.inflForm(['Pos','Neuter']),
                    this.inflForm(['Pos','Def','Sing']),
                    this.inflForm(['Pos','Plur'])
                  ].filter(r => r)
        }
    },
    methods: {
        inflForm: function (tagList,exclTagList) {
            return inflectedForm(this.paradigm, tagList, exclTagList)
        }
    }
}
</script>
