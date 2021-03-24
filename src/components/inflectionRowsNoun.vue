<template>
<tr>
  <template v-if="tags.tags">
    <td class="infl sub xs">
      {{tagToName(tags.label)}}
    </td>
    <td class="infl xs" :class="tags.tags[0]=='_gender' ? 'sub':''"
        v-for="([prefix, [rowspan,rowindex,forms]], index) in cells"
        :key="index"
        :colspan="rowspan"
        :index="rowindex"
        @mouseover.stop="hiliteRow(rowindex)">
    <span class='comma'
          v-for="(form, index) in forms"
          :key="index">
        <span v-if="prefix" class="context">{{prefix}}</span>
        {{tags.tags[0]=='_gender' ? tagToName(form) : form}}</span>
  </td>
  </template>
  <template v-if="tags.title">
    <td class="infl group"
        :colspan="paradigms.length+1">
      {{tagToName(tags.title)}}
    </td>
  </template>
</tr>
</template>

<script>

import $ from 'jquery'

import { inflectedForm, tagToName
       } from './mixins/ordbankUtils.js' 

export default {
    name: 'inflectionRowsNoun',
    props: ['paradigms','tags','language'],
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
    computed: {
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
            if (this.isMasc(paradigm) && this.language=='nob') {
                return "en"
            } else if (this.isMasc(paradigm) && this.language=='nno') {
                return "ein"
            } else if (this.isFem(paradigm) && this.language=='nob') {
                return "ei/en"
            } else if (this.isFem(paradigm) && this.language=='nno') {
                return "ei"
            } else if (this.isNeuter(paradigm) && this.language=='nob') {
                return "et"
            } else if (this.isNeuter(paradigm) && this.language=='nno') {
                return "eit"
            }
        },
        genderCat: function (paradigm) {
            if (this.isMasc(paradigm)) {
                return "hankjønn"
            } else if (this.isFem(paradigm) && this.language=='nob') {
                return "hunkjønn"
            } else if (this.isFem(paradigm) && this.language=='nno') {
                return "hokjønn"
            } else if (this.isNeuter(paradigm) && this.language=='nob') {
                return "intetkjønn"
            } else if (this.isNeuter(paradigm) && this.language=='nno') {
                return "inkjekjønn"
            }
        },
        inflForm: function (paradigm, tagList, prefix) {
            let forms = inflectedForm(paradigm, tagList, [])
            if (forms) {
                return [prefix, forms]
            } else {
                return null
            }
        },
        hiliteRow: function (rowindex) {
            $('td[index]').removeClass('hilite')
            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))
        },
        tagToName: function (tag) {
            return tagToName(tag, this.language)
        }
    }
}
</script>
