<template>
<tr>
  <td class="infl-cell"
      v-for="([prefix, [rowspan,rowindex,forms,gender,standardisation], suffix], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
      :data-rowindex="rowindex.join(',')"
      @mouseover="$emit('hilite', rowindex, lemmaId)"
      @mouseleave="$emit('unhilite')">
    <span v-if="standardisation!='STANDARD'">(</span>
    <span>
      <span class="comma nobr"
            v-for="(form, index) in forms"
            :key="index">
        <em v-if="prefix" class="context">{{prefix}}&nbsp;</em>{{form}}<em v-if="suffix" class="context">{{suffix}}</em>
      </span>
    </span>
    <span v-if="standardisation!='STANDARD'">)</span>
  </td>
</tr>
</template>

<script>

import { inflectedForm, hasInflForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowVerb',
    props: ['paradigm','part','lemmaId'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            rows: [ !this.part || this.part==1 ? this.inflForm(['Inf'],['Pass'],'å') : null,
                    !this.part || this.part==1 ? this.inflForm(['Pres'],['Pass']) : null,
                    !this.part || this.part==1 ? this.inflForm(['Past']) : null,
                    !this.part || this.part==2 ? this.inflForm(['<PerfPart>'],['Adj'],'har') : null,
                    (!this.part || this.part==2) && hasInflForm(this.paradigm,['Imp']) ?
                    this.inflForm(['Imp'],null,null,'!') : null
                  ].filter(r => r)
        }
    },
    methods: {
        inflForm: function (tagList,exclTagList,prefix,suffix) {
            let forms = inflectedForm(this.paradigm, tagList, exclTagList)
            if (forms) {
                return [prefix, forms, suffix]
            } else {
                return null
            }
        }
    }
}
</script>
