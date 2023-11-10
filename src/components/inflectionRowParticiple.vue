<template>
<tr>
  <td class="notranslate infl-cell left"
      :class="{'merge-right': forms[0]==='-', 'non-standard': paradigm.standardisation!='STANDARD', hilite: $parent.hilited(rowindex, lemmaId)}"
      v-for="([prefix, [rowspan,rowindex,forms,gender,standardisation], suffix, headers], index) in rows"
      :key="index"
      :rowspan="rowspan"
      :headers="headers"
      @mouseover="$emit('hilite', rowindex, lemmaId)"
      @mouseleave="$emit('unhilite')">
    <span v-if="standardisation!='STANDARD'">(</span>
    <span>
      <span class='comma'
            v-for="(form, index) in forms"
            :key="index">
        <em v-if="prefix" class="context">{{prefix}}&nbsp;</em>
        <span :style="form=='-' ? 'color: white':''">{{form}}</span>
        <em v-if="suffix" :lang="lang" translate="yes" class="context nobr"> {{suffix}}</em>
      </span>
    </span>
    <span v-if="standardisation!='STANDARD'">)</span>
  </td>
  
</tr>
</template>

<script>

import { inflectedForm, indefArticle
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowParticiple',
    props: ['paradigm','hasPerfPart','hasPerfPartFem','dict', 'translate', 'lang', 'part','lemmaId', 'context'],
    data: function () {
        return { rows: [
            this.hasPerfPart && this.part!=4 ?
                this.inflForm(['Adj','Masc/Fem'],
                              this.context ? indefArticle(['Masc/Fem'], this.dict) : null,
                              this.context ? ' + ' + this.translate('tags.NOUN') : null,
                              `PerfPart${this.lemmaId} Masc${this.lemmaId}`) : null,
            this.hasPerfPartFem && this.part!=4 ?
                this.inflForm(['Adj','Fem'],
                              this.context ? indefArticle(['Fem'], this.dict) : null,
                              this.context ?  ' + ' + this.translate('tags.NOUN') : null,
                              `PerfPart${this.lemmaId} Fem${this.lemmaId}`): null,
            this.hasPerfPart && this.part!=4 ?
                this.inflForm(['Adj','Neuter'],
                              this.context ? indefArticle(['Neuter'], this.dict) : null,
                              this.context ?  ' + ' + this.translate('tags.NOUN') : null,
                              `PerfPart${this.lemmaId} Neuter${this.lemmaId}`) : null,
            this.hasPerfPart && this.part!=4 ?
                this.inflForm(['Adj','Def'],
                              this.context ? 'den/det' : null,
                              this.context ?  ' + ' + this.translate('tags.NOUN') : null,
                              `PerfPart${this.lemmaId} Def${this.lemmaId}`) : null,
            this.hasPerfPart && this.part!=3 ?
                this.inflForm(['Adj','Plur'],
                              null,
                              this.context ?  ' + ' + this.translate('tags.NOUN') : null,
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
            if (forms && forms[0]) {
                return [prefix, forms, suffix, headers]
            } else {
                return null
            }
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
