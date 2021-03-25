<template>
<div @mouseover="unhiliteRows()">
  <div style="overflow-y: hidden">
  <template v-if="lemma && lemma.word_class=='NOUN'">
    <table v-if="mq!='xs'"
           class="infl rounded top"
           :class="mq"
           v-show="show || showTable">
      <tr>
        <th class="lemma xborder-lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
          <span class="sub" v-if="nounGender"> {{nounGender}}</span>
        </th>
      </tr>
      <tr>
        <td>
          <table class="infl rounded" :class="mq">
            <tr>
              <th class="infl sub xborder-top-left" :class="mq"
                  v-if="!nounGender"
                  rowspan='2'>kjønn</th>
              <th class="infl xborder-top" :class="mq" v-if="language=='nob'" colspan='2'>entall</th>
              <th class="infl xborder-top-right" :class="mq" v-if="language=='nob'" colspan='2'>flertall</th>
              <th class="infl xborder-top" :class="mq" v-if="language=='nno'" colspan='2'>eintal</th>
              <th class="infl xborder-top-right" :class="mq" v-if="language=='nno'" colspan='2'>fleirtal</th>
            </tr>
            <tr>
              <th class="infl sub xborder-bottom" :class="mq">
                ubestemt <span v-if="mq!='xs'">form</span>
              </th>
              <th class="infl sub xborder-bottom" :class="mq">
                bestemt <span v-if="mq!='xs'">form</span>
              </th>
              <th class="infl sub xborder-bottom" :class="mq">
                ubestemt <span v-if="mq!='xs'">form</span>
              </th>
              <th class="infl sub xborder-bottom" :class="mq">
                bestemt <span v-if="mq!='xs'">form</span>
              </th>
            </tr>
            <inflectionRowNoun v-for="(paradigm, index) in standardParadigms"
                               :key="index"
                               :showGender="!nounGender"
                               :language="language"
                               :paradigm="paradigm"/>
          </table>
        </td>
      </tr>
    </table>
    <table v-else style="margin: 1em auto"
      class="infl rounded top" :class="mq" v-show="show || showTable">
      <tr>
        <th class="lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
          <span class="sub" v-if="nounGender"> {{nounGender}}</span>
        </th>
      </tr>
      <tr>
        <td>
          <table class="infl" :class="mq">
            <inflectionRowsNoun v-for="(tags, index) in inflTagsNoun"
                                :key="index"
                                :tags="tags"
                                :language="language"
                                :paradigms="standardParadigms"/>
          </table>
        </td>
      </tr>
    </table>
  </template>
  <template v-if="lemma && lemma.word_class=='VERB'">
    <table v-if="mq!='xs'"
           class="infl rounded top" :class="mq" v-show="show || showTable">
      <tr>
        <th class="lemma xborder-lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
        </th>
      </tr>
      <tr v-for="i in mq=='xs' ? [1,2] : [0]" :key="i">
        <td>
          <table class="infl rounded" :class="mq">
            <tr>
              <th v-if="!i || i==1" class="infl xborder-top-left" :class="mq">infinitiv</th>
              <th v-if="!i || i==1" class="infl xborder-top" :class="mq">presens</th>
              <th v-if="!i || i==1" class="infl xborder-top" :class="mq">preteritum</th>
              <th v-if="!i || i==2" class="infl xborder-top" :class="mq">presens perfektum</th>
              <th v-if="(!i || i==2) && hasImp" class="infl xborder-top-right" :class="mq">imperativ</th>
            </tr>
            <inflectionRowVerb v-for="(paradigm, index) in standardParadigmsVerb"
                               :key="index"
                               :part="i"
                               :paradigm="paradigm"
                               :mq="mq"/>
          </table>
        </td>
      </tr>
      <tr v-for="j in mq=='xs' ? [3,4] : [-1]" :key="j">
        <td>
          <table class="infl rounded" :class="mq">
            <template v-if="hasPerfPart">
              <tr>
                <th class="infl xborder-top-left" :class="mq"
                    :colspan="hasPerfPartDef ? (j<0?4:(j==3?3:1)) : 1">perfektum partisipp</th>
                <th v-if="j<0 || j==4"
                    class="infl xborder-top-right" :class="mq"
                    rowspan="2">presens partisipp</th>
              </tr>
              <tr>
                <th v-if="(j<0 || j==3) && hasPerfPartDef && language=='nob'"
                    class="infl sub xborder-bottom" :class="mq">han-/hunkjønn</th>
                <th v-if="(j<0 || j==3) && hasPerfPartDef && language=='nno'"
                    class="infl sub xborder-bottom" :class="mq">hankjønn /<br/>hokjønn</th>
                <th class="infl sub xborder-bottom" :class="mq"
                    v-if="(j<0 || j==3) && language=='nob'">intetkjønn</th>
                <th class="infl sub xborder-bottom" :class="mq"
                    v-if="(j<0 || j==3) && language=='nno'">inkjekjønn</th>
                <th v-if="(j<0 || j==3) && hasPerfPartDef"
                    class="infl sub xborder-bottom" :class="mq">bestemt form</th>
                <th v-if="(j<0 || j==4) && hasPerfPartDef"
                    class="infl sub xborder-bottom" :class="mq">flertall</th>
              </tr>
            </template>
            <template v-else>
              <tr>
                <th v-if="j<0 || j==4"
                    class="infl xborder-top" :class="mq">presens partisipp</th>
              </tr>
            </template>
            <inflectionRowParticiple v-for="(paradigm, index) in standardParadigms"
                                     :key="index"
                                     :part="j"
                                     :language="language"
                                     :hasPerfPart="hasPerfPart"
                                     :paradigm="paradigm"
                                     :mq="mq"/>
          </table>
        </td>
      </tr>
    </table>
    <table v-else style="margin: 1em auto"
      class="infl rounded top" :class="mq" v-show="show || showTable">
      <tr>
        <th class="lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
        </th>
      </tr>
      <tr>
        <td>
          <table class="infl" :class="mq" >
            <inflectionRowsVerb v-for="(tags, index) in inflTagsVerb"
                                :key="index"
                                :tags="tags"
                                :language="language"
                                :paradigms="standardParadigms"/>
          </table>
        </td>
      </tr>
    </table>
  </template>
  <template v-if="lemma && lemma.word_class=='ADJ'">
    <table v-if="mq!='xs'"
           class="infl rounded top"
           :class="mq"
           v-show="show || showTable">
      <tr>
        <th class="lemma xborder-lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
        </th>
      </tr>
      <tr>
        <td>
          <table class="infl rounded" :class="mq">
            <tr>
              <th class="infl xborder-top-left" :class="mq"
                  v-if="language=='nob'" :colspan="hasFem ? 4 : 3">entall</th>
              <th class="infl xborder-top-right" :class="mq"
                  v-if="language=='nob'" rowspan="2">flertall</th>
              <th class="infl xborder-top" :class="mq"
                  v-if="language=='nno'" :colspan="hasFem ? 4 : 3">eintal</th>
              <th class="infl xborder" :class="mq"
                  v-if="language=='nno'" rowspan="2">fleirtal</th>
            </tr>
            <tr>
              <th v-if="hasFem" class="infl sub xborder-bottom" :class="mq">hankjønn</th>
              <th v-if="!hasFem && language=='nob'"
                  class="infl sub xborder-bottom" :class="mq"><nobr>hankjønn /</nobr><br/>hunkjønn</th>
              <th v-if="!hasFem && language=='nno'"
                  class="infl sub xborder-bottom" :class="mq"><nobr>hankjønn /</nobr><br/>hokjønn</th>
              <th v-if="hasFem && language=='nob'"
                  class="infl sub xborder-bottom" :class="mq">hunkjønn</th>
              <th v-if="hasFem && language=='nno'"
                  class="infl sub xborder-bottom" :class="mq">hokjønn</th>
              <th class="infl sub xborder-bottom" :class="mq" v-if="language=='nob'">intetkjønn</th>
              <th class="infl sub xborder-bottom" :class="mq" v-if="language=='nno'">inkjekjønn</th>
              <th class="infl sub xborder-bottom" :class="mq">bestemt form</th>
            </tr>
            <inflectionRowAdj v-for="(paradigm, index) in standardParadigms"
                              :key="index"
                              :hasDeg="hasDeg"
                              :hasFem="hasFem"
                              :paradigm="paradigm"/>
          </table>
        </td>
      </tr>
      <tr v-if="hasDeg">
        <td>
          <table class="infl rounded" :class="mq">
            <tr>
              <th class="infl xborder-top-left-right" v-if="hasDeg" colspan="3">gradbøying</th>
            </tr>
            <tr>
              <th class="infl xborder-bottom">komparativ</th>
              <th class="infl xborder-bottom">superlativ<br/><span class="sub">ubestemt form</span></th>
              <th class="infl xborder-bottom">superlativ<br/><span class="sub">bestemt form</span></th>
            </tr>
            <inflectionRowAdjDeg v-for="(paradigm, index) in standardParadigmsAdjDeg"
                                 :key="index"
                                 :paradigm="paradigm"/>
          </table>
        </td>
      </tr>
    </table>
    <table v-else style="margin: 1em auto"
      class="infl rounded top" :class="mq" v-show="show || showTable">
      <tr>
        <th class="lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
        </th>
      </tr>
      <tr>
        <td>
          <table class="infl" :class="mq" >
            <inflectionRowsAdj v-for="(tags, index) in inflTagsAdj"
                               :key="index"
                               :tags="tags"
                               :language="language"
                               :paradigms="standardParadigms" />
          </table>
        </td>
      </tr>
    </table>
  </template>
  <template v-if="lemma && isUninflected">
    <table class="infl" :class="mq" v-show="show || showTable">
      <tr>
        <th class="lemma xborder-top">
          <span class="lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span></th>
      </tr>
      <tr>
        <td>
          <table class="infl" :class="mq">
            <tr>
              <th class="infl xborder">ubøyelig</th>
            </tr>
            <tr>
              <td class="infl xborder">{{lemma.lemma}}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </template>
  </div>
</div>
</template>

<script>

import $ from 'jquery'

import inflectionRowNoun from './inflectionRowNoun.vue'
import inflectionRowAdj from './inflectionRowAdj.vue'
import inflectionRowAdjDeg from './inflectionRowAdjDeg.vue'
import inflectionRowVerb from './inflectionRowVerb.vue'
import inflectionRowParticiple from './inflectionRowParticiple.vue'

// import inflectionHead from './inflectionHead.vue'
import inflectionRowsNoun from './inflectionRowsNoun.vue'
import inflectionRowsVerb from './inflectionRowsVerb.vue'
import inflectionRowsAdj from './inflectionRowsAdj.vue'


import { calculateStandardParadigms, // compareParadigms,
         word_formsEqual, hasTags, tagToName
       } from './mixins/ordbankUtils.js'

const posNames = { NOUN: "substantiv",
                   VERB: "verb",
                   ADJ: "adjektiv",
                   ADV: "adverb",
                   ADP: "preposisjon",
                   INTJ: "interjeksjon",
                   DET: "determinativ",
                   PRON: "pronomen",
                   CCONJ: "konjunksjon",
                   SCONJ: "subjunksjon",
                   SYM: "symbol",
                   INFM: "infinitivsmerke"
                 }

export default {
    name: 'inflectionTable',
    components: { inflectionRowNoun,
                  inflectionRowAdj,
                  inflectionRowAdjDeg,
                  inflectionRowVerb,
                  inflectionRowParticiple,
                  // inflectionHead,
                  inflectionRowsNoun,
                  inflectionRowsVerb,
                  inflectionRowsAdj
                },
    props: ['lemmaList','showTable','inline', 'mq'],
    data: function () {
        return { wordClass: posNames[this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .word_class] || this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .word_class,
                 language: this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .language,
                 hasFem: this.hasInflForm(['Pos','Fem']),
                 hasDeg: this.hasInflForm(['Cmp']),
                 hasPerfPart: this.hasInflForm(['Adj','<PerfPart>']),
                 hasPerfPartDef: this.hasInflForm(['Adj','<PerfPart>','Def']),
                 hasImp: this.hasInflForm(['Imp']),
                 isUninflected: !['NOUN','ADJ','VERB'].find(wc=>wc==this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .word_class),
                 // genderList:
                 show: true,
                 lemma: this.lemmaList && this.lemmaList[0] ,
                 paradigms: null,
                 gender: null, // gender if NOUN and only one gender
                 inflTagsNounG: [ { tags: ['_gender'] }, // fixme: aspekt
                                  { title: 'Sing' },
                                  { label: 'Ind', tags: ['Sing','Ind'], indefArt: true },
                                  { label: 'Def', tags: ['Sing','Def']},
                                  { title: 'Plur'},
                                  { label: 'Ind', tags: ['Plur','Ind']},
                                  { label: 'Def', tags: ['Plur','Def']}],
                 inflTagsNounNG: [{ title: 'Sing' },
                                  { label: 'Ind', tags: ['Sing','Ind'], indefArt: true },
                                  { label: 'Def', tags: ['Sing','Def']},
                                  { title: 'Plur'},
                                  { label: 'Ind', tags: ['Plur','Ind']},
                                  { label: 'Def', tags: ['Plur','Def']}],
                 inflTagsAdj: [ { title: 'Sing' },
                                { label: 'MascFem', tags: ['Pos',['Masc/Fem','Masc']] },
                                { label: 'Fem', tags: ['Pos','Fem'] },
                                { label: 'Neuter', tags: ['Pos','Neuter']},
                                { label: 'Def', tags: ['Pos','Def','Sing']},
                                { title: 'Plur'},
                                { tags: ['Pos','Plur']},
                                { title: 'Deg'},
                                { label: 'Cmp', tags: ['Cmp']},
                                { label: 'SupInd', tags: ['Sup','Ind']},
                                { label: 'SupDef', tags: ['Sup','Def']}
                              ],
                 inflTagsVerbOld: [{ label: 'Inf', tags: ['Inf'], excl: ['Pass'], prefix: 'å' },
                                { label: 'Pres', tags: ['Pres'], excl: ['Pass'] },
                                { label: 'Past', tags: ['Past'] },
                                { label: 'PresPerf', tags: ['<PerfPart>'], excl: ['Adj'], prefix: 'har' },
                                { label: 'Imp', tags: ['Imp'], suffix: '!' },
                                { title: 'PerfPart' },
                                { label: 'MascFem', tags: ['Adj','Masc/Fem'],
                                  prefix: this.language == 'nob' ? 'en/ei' : 'ein/ei',
                                  suffix: ' + subst.'},
                                { label: 'Neuter', tags: ['Adj','Neuter'],
                                  prefix: this.language == 'nob' ? 'et' : 'eit',
                                  suffix: ' + subst.'},
                                { label: 'Def', tags: ['Adj','Def'],
                                  prefix: 'den/det',
                                  suffix: ' + subst.'},
                                { label: 'Plur', tags: ['Adj','Plur'],
                                  suffix: ' + subst.'},
                                { title: 'PresPart' },
                                { tags: ['Adj','<PresPart>'] },

                               ],
                 inflTagsVerb: [{ label: 'Inf', tags: ['Inf'], excl: ['Pass'], prefix: 'å' },
                                { label: 'Pres', tags: ['Pres'], excl: ['Pass'] },
                                { label: 'Past', tags: ['Past'] },
                                { label: 'PresPerf', tags: ['<PerfPart>'], excl: ['Adj'], prefix: 'har' },
                                { label: 'Imp', tags: ['Imp'], suffix: '!' },
                                { title: 'PerfPart' },
                                { label: 'MascFem', tags: ['Adj','Masc/Fem']},
                                { label: 'Def', tags: ['Adj','Def']},
                                { label: 'Plur', tags: ['Adj','Plur']},
                                { title: 'PresPart' },
                                { tags: ['Adj','<PresPart>'] },

                               ]
               }
    },
    computed: {
        // the paradigms that should be shown in the table
        standardParadigms: function () {
            return this.getStandardParadigms()
        },
        standardParadigmsVerb: function () {
            return this.removeDuplicates(this.getStandardParadigms(),
                                         [['Inf'],['Pres'],['Past'],['<PerfPart>'],['Imp']])
        },
        standardParadigmsAdjDeg: function () {
            return this.removeDuplicates(this.getStandardParadigms(),
                                         [['Cmp'],['Sup']])
        },
        inflTagsNoun: function () {
            return this.getGender() == '+' ? this.inflTagsNounG : this.inflTagsNounNG
        },
        nounGender: function () {
            this.getGender()
            return !this.gender || this.gender=='+' ? null : tagToName(this.gender,this.language)
        },
        edit: function () {
            return this.lemma.mode == 'edit' || this.lemma.mode == 'new'
        }
    },
    methods: {
        hasInflForm: function (tagList) {
            let info = this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .paradigm_info && this.lemmaList[0] .paradigm_info.find(
                paradigm => (paradigm.standardisation == 'STANDARD' &&
                             !paradigm.to &&
                             paradigm.inflection.find(
                                 infl => { let found = infl.word_form // there are empty cells!
                                           tagList.forEach(tag =>
                                                           { if (!infl.tags.find(t => t == tag)) {
                                                               found = false }
                                                           })
                                           return found })))
            return !!info
        },
        // the paradigms that should be shown in the table
        // sort Masc < Fem < Neuter, then sort alphabetically by word_form (first elt if it is a list)
        getStandardParadigms: function () {
            if (this.paradigms) {
                return this.paradigms
            }
            let paradigms = []
            this.lemmaList && this.lemmaList.forEach(lemma =>
                                    paradigms = paradigms.concat(calculateStandardParadigms(lemma, this.edit)))
            if (!paradigms.length) {
                return []
            }
            let isNoun = null
            paradigms = paradigms.sort((p1,p2) => {
                isNoun = p1.tags.find(t => t == 'NOUN')
                let r1 = isNoun ? p1.inflection[1].word_form : p1.inflection[0].word_form
                let r2 = isNoun ? p2.inflection[1].word_form : p2.inflection[0].word_form
                let tags1 = p1.tags
                let tags2 = p2.tags
                if ((tags1.find(t => t == 'Masc') &&
                     !tags2.find(t => t == 'Masc')) ||
                    (tags1.find(t => t == 'Fem') &&
                     !tags2.find(t => t == 'Masc') &&
                     !tags2.find(t => t == 'Fem'))) {
                    return -1
                } else if ((tags2.find(t => t == 'Masc') &&
                            !tags1.find(t => t == 'Masc')) ||
                           (tags2.find(t => t == 'Fem') &&
                            !tags1.find(t => t == 'Masc') &&
                            !tags1.find(t => t == 'Fem'))) {
                    return 1
                } else if (typeof r1 == 'string' && typeof r2 == 'string') {
                    return r2.localeCompare(r1)
                } else if (typeof r1 == 'string') {
                    return r2[0].localeCompare(r1)
                } else if (typeof r2 == 'string') {
                    return r2.localeCompare(r1[0])
                } else {
                    return r2[0].localeCompare(r1[0])
                }
            })
            let currentTags = paradigms[0].tags
            let currentInfl = paradigms[0].inflection.map(infl => {
                infl.rowspan = 0
                infl.index = []
                return infl })
            // merge equal cells by setting rowspan
            paradigms.forEach((p,index) => {
                if (isNoun) {
                    let gender = p.tags[1]
                    if (!this.gender) {
                        this.gender = gender
                    } else if (this.gender != gender) {
                        this.gender = '+'
                    }
                }
                for (let i = 0; i < p.inflection.length; i++) {
                    if (currentInfl[i].rowspan > 0 &&
                        word_formsEqual(currentInfl[i].word_form,
                                        p.inflection[i].word_form,
                                        currentTags,
                                        p.tags,
                                        hasTags(currentInfl[i], ['Sing','Ind']))
                       ) {
                        currentInfl[i].index.push(index+1) // remember paradigm row, for hiliting
                        currentInfl[i].rowspan++
                        p.inflection[i].rowspan = 0
                    } else {
                        // let ind = currentInfl[i].index
                        currentInfl[i] = p.inflection[i]
                        currentInfl[i].index = []
                        currentInfl[i].index.push(index+1) // remember paradigm row, for hiliting
                        currentInfl[i].rowspan = 1
                    }
                }
            })
            this.paradigms = paradigms
            return paradigms
        },
        // OBSOLETE because of merging of equal cells
        // remove duplicate rows
        // if used: have to adjust rowspans
        removeDuplicates: function (paradigms, tagLists) {
            tagLists
            return paradigms
            /* let res = []
            paradigms.forEach(p => {
                let found = false
                res.forEach(r => {
                    if (compareParadigms(p, r, tagLists)) {

                        found = false // true
                    }
                })
                if (!found) {
                    res.push(p)
                }
            })
            return res */
        },
        getGender: function () {
            let paradigms = this.getStandardParadigms()
            let isNoun = paradigms[0].tags.find(t => t == 'NOUN')
            paradigms.forEach(p => {
                if (isNoun) {
                    let gender = p.tags[1]
                    if (!this.gender) {
                        this.gender = gender
                    } else if (this.gender != gender) {
                        this.gender = '+' // more than one gender
                    }
                }
            })
            return this.gender
        },
        unhiliteRows: function () {
            $('td[index]').removeClass('hilite')
        }
    }
}
</script>

<style>

table.infl {
    /* border: 2px solid gray; */
    margin: 1em;
}

table.infl.rounded {
    border-collapse: separate;
    border-radius: 10px !important;
    border-spacing: 0;
    -moz-border-radius:6px !important;
}

table.infl.rounded.top {
    border: 2px solid gray;
}

table.infl.xs {
    margin: 0em;
}

th.infl {
    border: 1px solid lightgray;
    padding: .3em;
    padding-left: .5em;
    padding-right: .5em;
    text-align: center;
    vertical-align: top;
    font-weight: normal;
    font-style: italic;
}

th.infl.xs {
    border: 1px solid lightgray;
    padding: 0.2em;
}

td.infl {
    border: 1px solid lightgray;
    padding: .3em;
    padding-left: .5em;
    padding-right: .5em;
    font-weight: normal;
    cursor: arrow
    }

td.infl.xs {
    border-bottom: 1px solid lightgray;
    border-left: 1px solid lightgray;
    border-top: 0;
    border-right: 0;
    /* font-style: italic;  !! */
    /* font-weight: normal; !! */
    text-align: center;
    padding: .3em;
}

td.infl.sub.xs {
    border-bottom: 0 /* 1px solid lightgray*/;
    border-left: 0;
    /* font-style: normal; !! */
    text-align: center;
    padding: .3em;
    /* font-size: smaller */
}

td.hilite {
    background: lightgray
}

td.group {
    border-top: 1px solid lightgray;
    border-bottom: 0;
    border-right: 0;
    border-left: 0;
    background-color:  #faf1f0; /* #f7e1ea; */
    text-align: center;
    padding-left: 1em;
    /* font-weight: bold; */
    font-style: italic; /* !! */
}

th.lemma {
    padding: .5em;
    padding-bottom: 0.5em;
    text-align: center
    }
span.infl-lemma {
    font-weight: bold;
    color: #560027;
    font-size: larger
}
span.word_class {
    font-size: smaller
}
span.word_form {
    font-weight: bold
}

.sub {
    font-style: italic;
    font-weight: normal
}

.xborder {
    border: 1px solid gray
}
.xborder-top {
    border-spacing: 0;
    background-color: #faf1f0;
    /* background-color: #f7e1ea; */
    /* border-top: 1px solid gray;
    border-left: 1px solid gray;
    border-right: 1px solid gray */
}
.xborder-top-right {
    border-top-right-radius: 10px !important;
    border-spacing: 0;
    background-color: #faf1f0;
    /* background-color: #f7e1ea; */
    /* border-top: 1px solid gray;
    border-left: 1px solid gray;
    border-right: 1px solid gray */
}
.xborder-top-left {
    border-top-left-radius: 10px !important;
    border-spacing: 0;
    background-color: #faf1f0;
    /* background-color: #f7e1ea; */
    /* border-top: 1px solid gray;
    border-left: 1px solid gray;
    border-right: 1px solid gray */
}
.xborder-top-left-right {
    border-top-left-radius: 10px !important;
    border-top-right-radius: 10px !important;
    border-spacing: 0;
    background-color: #faf1f0;
    /* background-color: #f7e1ea; */
    /* border-top: 1px solid gray;
    border-left: 1px solid gray;
    border-right: 1px solid gray */
}

.xborder-lemma {
    border-top-left-radius: 10px !important;
    border-top-right-radius: 10px !important;
    border-spacing: 0;
}

.xborder-bottom {
    background-color: #faf1f0;
    /* background-color: #f7e1ea; */
    /* border-bottom: 1px solid gray;
    border-left: 1px solid gray;
    border-right: 1px solid gray */
}

span.comma:empty {
    display: none;
}

span.comma:not(:first-child):before {
    content: ", ";
}

div.comma:not(:last-child):after {
    content: ", ";
}
</style>
