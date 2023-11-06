<template>
<tr>
  <td class="infl-cell left"
      :class= "forms[0]=='-' ? 'merge-right':'' + paradigm.standardisation!='STANDARD' ? 'non-standard':''"
      v-for="([prefix, [rowspan,rowindex,forms,gender,standardisation], suffix, headers], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :index="rowindex"
      :headers="headers"
      @mouseover.stop="hiliteRow(rowindex)">
    <span v-if="standardisation!='STANDARD'">(</span>
    <span>
      <span class='comma'
            v-for="(form, index) in forms"
            :key="index">
        <em v-if="prefix" class="context">{{prefix}} </em>
        <span :style="form=='-' ? 'color: white':''">{{form}}</span>
        <em v-if="suffix" class="context nobr"> {{suffix}}</em>
      </span>
    </span>
    <span v-if="standardisation!='STANDARD'">)</span>
  </td>
  
</tr>
</template>

<script>

// needed for hiliting
import $ from 'jquery'

import { inflectedForm, indefArticle, posName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowParticiple',
    props: ['paradigm','hasPerfPart','hasPerfPartFem','language','locLang','part','lemmaId', 'context'],
    data: function () {
        return { rows: [
            this.hasPerfPart && this.part!=4 ?
                this.inflForm(['Adj','Masc/Fem'],
                              this.context ? indefArticle(['Masc/Fem'], this.language) : null,
                              this.context ? '+ ' + this.posName('NOUN') : null,
                              `PerfPart${this.lemmaId} Masc${this.lemmaId}`) : null,
            this.hasPerfPartFem && this.part!=4 ?
                this.inflForm(['Adj','Fem'],
                              this.context ? indefArticle(['Fem'], this.language) : null,
                              this.context ?  '+ ' + this.posName('NOUN') : null,
                              `PerfPart${this.lemmaId} Fem${this.lemmaId}`): null,
            this.hasPerfPart && this.part!=4 ?
                this.inflForm(['Adj','Neuter'],
                              this.context ? indefArticle(['Neuter'], this.language) : null,
                              this.context ?  '+ ' + this.posName('NOUN') : null,
                              `PerfPart${this.lemmaId} Neuter${this.lemmaId}`) : null,
            this.hasPerfPart && this.part!=4 ?
                this.inflForm(['Adj','Def'],
                              this.context ? 'den/det' : null,
                              this.context ?  '+ ' + this.posName('NOUN') : null,
                              `PerfPart${this.lemmaId} Def${this.lemmaId}`) : null,
            this.hasPerfPart && this.part!=3 ?
                this.inflForm(['Adj','Plur'],
                              null,
                              this.context ?  '+ ' + this.posName('NOUN') : null,
                              `PerfPart${this.lemmaId} Plur${this.lemmaId}`) : null,
            this.part!=3 ? this.inflForm(['Adj','<PresPart>'],
                                         null,
                                         null,
                                         `PresPart${this.lemmaId}`) : null
        ].filter(r => r) }
    },
    methods: {
        inflForm: function (tagList,prefix,suffix,headers) {
            let forms = inflectedForm(this.paradigm, tagList)
            if (forms) {
                return [prefix, forms, suffix, headers]
            } else {
                return null
            }
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('#lemma' + this.lemmaId + ' td[index*='+ i + ']').addClass('hilite'))
        },
        posName: function (tag) {
            return posName(tag, this.locLang)
        }
    }
}

</script>

<style>

td.merge-left {
    border-right: none
}

td.merge-right {
    border-left: none !important;
}

td.non-standard {
/*    background: green */
}

</style>
