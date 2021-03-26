<template>
<tr>
  <td class="infl"
      v-for="([prefix, [rowspan,rowindex,forms], suffix], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      @mouseover.stop="hiliteRow(rowindex)">
    <span class='comma'
          v-for="(form, index) in forms"
          :key="index">
      <nobr>
        <span v-if="prefix" class="context">{{prefix}}</span>
        {{form}}<span v-if="suffix" class="context">{{suffix}}</span>
      </nobr>
    </span>
  </td>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowVerb',
    props: ['paradigm','part'],
    data: function () {
        return {
            rows: [ !this.part || this.part==1 ? this.inflForm(['Inf'],['Pass'],'å') : null,
                    !this.part || this.part==1 ? this.inflForm(['Pres'],['Pass']) : null,
                    !this.part || this.part==1 ? this.inflForm(['Past']) : null,
                    !this.part || this.part==2 ? this.inflForm(['<PerfPart>'],['Adj'],'har') : null,
                    !this.part || this.part==2 ? this.inflForm(['Imp'],null,null,'!') : null
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
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))
        }
    }
}
</script>
