<template>
<tr class="infl-row" :id="'lemma'+lemmaId">
  <template v-if="tags.tags">
    <th class="infl-label xs"
        :id="tags.tags.join('')"
        scope="row">
      {{translate("tags",  tags.label)}}
    </th>
    <template v-for="([prefix, [rowspan,rowindex,forms], headers], index) in cells">
      <th v-if="tags.tags[0]=='_gender'"
          class="infl-label"
          :id="forms[0]"
          :key="index"
          scope="row"
          :colspan="rowspan"
          :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
          :data-rowindex="rowindex.join(',')"
          @mouseover="$emit('hilite', rowindex, lemmaId)"
          @mouseleave="$emit('unhilite')">
        <span v-html="formattedForm(tags,forms[0])"/>
      </th>
      <td v-else
          class="notranslate infl-cell"
          :key="index + 'else'"
          :colspan="rowspan"
          :headers="headers"
          :class="{hilite: $parent.hilited(rowindex, lemmaId)}"
          :data-rowindex="rowindex.join(',')"
          @mouseover="$emit('hilite', rowindex, lemmaId)"
          @mouseleave="$emit('unhilite')">
        <span class='comma'
              v-for="(form, index) in forms"
              :key="index">
          <em v-if="prefix" class="context">{{prefix}}&nbsp;</em>
          <span v-html="formattedForm(tags,form)"/>
        </span>
      </td>
    </template>
  </template>
  <template v-if="tags.title">
    <th class="infl-group"
        :colspan="paradigms.length+1"
        scope="col"
        :id="tags.title">
      {{translate('tags',  tags.title)}}
    </th>
  </template>
</tr>
</template>

<script>

import { inflectedForm, markdownToHTML
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsNoun',
    props: ['paradigms','tags','dict', 'translate', 'lemmaId', 'showGender'],
    emits: ['hilite', 'unhilite'],
    data: function () {
        return {
            cells: !this.tags.title ?
                this.paradigms.map(
                    p => this.tags.gender ?
                        this.genderCat(p) :
                        this.inflForm(p,
                                      this.tags.tags,
                                      this.tags.indefArt ? this.indefArticle(p) : null) 
                ).filter(r => r) :
            []
        }
    },
    methods: {
        isMasc: function (paradigm) {
            return paradigm.tags.find(tag => tag == 'Masc')
        },
        isFem: function (paradigm) {
            return paradigm.tags.find(tag => tag == 'Fem')
        },
        isNeuter: function (paradigm) {
            return paradigm.tags.find(tag => tag == 'Neuter')
        },
        indefArticle: function (paradigm) {
            if (this.isMasc(paradigm) && this.dict=='nob' || this.dict == 'bm') {
                return "en"
            } else if (this.isMasc(paradigm) && this.dict=='nno' || this.dict == 'nn') {
                return "ein"
            } else if (this.isFem(paradigm) && this.dict=='nob' || this.dict == 'bm') {
                return "ei/en"
            } else if (this.isFem(paradigm) && this.dict=='nno' || this.dict == 'nn') {
                return "ei"
            } else if (this.isNeuter(paradigm) && this.dict=='nob' || this.dict == 'bm') {
                return "et"
            } else if (this.isNeuter(paradigm) && this.dict=='nno' || this.dict == 'nn') {
                return "eit"
            }
        },
        genderCat: function (paradigm) {
            if (this.isMasc(paradigm)) {
                return "hankjønn"
            } else if (this.isFem(paradigm) && this.dict=='nob' || this.dict == 'bm') {
                return "hunkjønn"
            } else if (this.isFem(paradigm) && this.dict=='nno' || this.dict == 'nn') {
                return "hokjønn"
            } else if (this.isNeuter(paradigm) && this.dict=='nob' || this.dict == 'bm') {
                return "intetkjønn"
            } else if (this.isNeuter(paradigm) && this.dict=='nno' || this.dict == 'nn') {
                return "inkjekjønn"
            }
        },
        inflForm: function (paradigm, tagList, prefix) {
            let forms = inflectedForm(paradigm, tagList, [])
            if (!forms) {
                return null
            } else {
                let gender = (this.showGender && forms[3]) ? forms[3].join(' ') + ' ' : ''
                return [prefix, forms, gender + tagList[0] +  ' ' + tagList[0] + tagList[1]]
            }
        },
        formattedForm: function (tags,form) {
            return tags.tags[0]=='_gender' ? this.translate('tags',  form) : markdownToHTML(form)
        }
    }
}
</script>
