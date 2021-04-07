<template>
<div @mouseover="unhiliteRows()">
  <div class="infl-wrapper">
    <template v-if="lemma && lemma.word_class=='NOUN'">
    <div v-if="mq!='xs'"
         class="infl-wordclass"
         :class="mq">
      <div class="lemma label-border-lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
          <span class="sub" v-if="nounGender"> {{nounGender}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
            <tr>
              <th class="infl-label sub label-border-top-left" :class="mq"
                  v-if="!nounGender"
                  rowspan='2'>kjønn</th>
              <th class="infl-label label-border-top-left" :class="mq" colspan='2'>
                {{tagToName('Sing')}}</th>
              <th class="infl-label label-border-top-right" :class="mq" colspan='2'>
                {{tagToName('Plur')}}
              </th>
            </tr>
            <tr>
              <th class="infl-label sub label-border-bottom" :class="mq">
                ubestemt form
              </th>
              <th class="infl-label sub label-border-bottom" :class="mq">
                bestemt form
              </th>
              <th class="infl-label sub label-border-bottom" :class="mq">
                ubestemt form
              </th>
              <th class="infl-label sub label-border-bottom" :class="mq">
                bestemt form
              </th>
            </tr>
            <inflectionRowNoun v-for="(paradigm, index) in standardParadigms"
                               :key="index"
                               :showGender="!nounGender"
                               :language="language"
                               :paradigm="paradigm"/>
          </table>
      </div>
    </div>
    <div v-else
         class="infl-wordclass"
         :class="mq">
      <div class="lemma">
        <span class="infl-lemma">{{lemma.lemma}} </span>
        <span class="sub">{{wordClass}}</span>
        <span class="sub" v-if="nounGender"> {{nounGender}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <inflectionRowsNoun v-for="(tags, index) in inflTagsNoun"
                              :key="index"
                              :tags="tags"
                              :language="language"
                              :paradigms="standardParadigms"/>
        </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && lemma.word_class=='VERB'">
    <div v-if="mq!='xs'"
           class="infl-wordclass" :class="mq">
      <div class="lemma label-border-lemma">
        <span class="infl-lemma">{{lemma.lemma}} </span>
        <span class="sub">{{wordClass}}</span>
      </div>
      <div v-for="i in mq=='xs' ? [1,2] : [0]" :key="i">
          <table class="infl-table" :class="mq">
            <tr>
              <th v-if="!i || i==1" class="infl-label label-border-top-left" :class="mq">infinitiv</th>
              <th v-if="!i || i==1" class="infl-label label-border-top" :class="mq">presens</th>
              <th v-if="!i || i==1" class="infl-label label-border-top" :class="mq">preteritum</th>
              <th v-if="!i || i==2" class="infl-label label-border-top" :class="mq">presens perfektum</th>
              <th v-if="(!i || i==2) && hasImp" class="infl-label label-border-top-right" :class="mq">imperativ</th>
            </tr>
            <inflectionRowVerb v-for="(paradigm, index) in standardParadigms"
                               :key="index"
                               :part="i"
                               :paradigm="paradigm"/>
          </table>
      </div>
      <div v-for="j in mq=='xs' ? [3,4] : [-1]" :key="j">
          <table class="infl-table" :class="mq">
            <template v-if="hasPerfPart">
              <tr>
                <th class="infl-label label-border-top-left" :class="mq"
                    :colspan="hasPerfPartDef ? (j<0?4:(j==3?3:1)) : 1">perfektum partisipp</th>
                <th v-if="j<0 || j==4"
                    class="infl-label label-border-top-right" :class="mq"
                    rowspan="2">presens partisipp</th>
              </tr>
              <tr>
                <th v-if="(j<0 || j==3) && hasPerfPartDef" class="infl-label sub label-border-bottom" :class="mq">
                  {{tagToName('Masc')}} /<br/>{{tagToName('Fem')}}</th>
                <th class="infl-label sub label-border-bottom" :class="mq"
                    v-if="(j<0 || j==3)">{{tagToName('Neuter')}}</th>
                <th v-if="(j<0 || j==3) && hasPerfPartDef"
                    class="infl-label sub label-border-bottom" :class="mq">bestemt form</th>
                <th v-if="(j<0 || j==4) && hasPerfPartDef"
                    class="infl-label sub label-border-bottom" :class="mq">{{tagToName('Plur')}}</th>
              </tr>
            </template>
            <template v-else>
              <tr>
                <th v-if="j<0 || j==4"
                    class="infl-label label-border-top" :class="mq">presens partisipp</th>
              </tr>
            </template>
            <inflectionRowParticiple v-for="(paradigm, index) in standardParadigms"
                                     :key="index"
                                     :part="j"
                                     :language="language"
                                     :hasPerfPart="hasPerfPart"
                                     :paradigm="paradigm"/>
          </table>
      </div>
    </div>
    <div v-else
         class="infl-wordclass" :class="mq">
      <div class="lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
      </div>
      <div>
          <table class="infl-table" :class="mq" >
            <inflectionRowsVerb v-for="(tags, index) in inflTagsVerb"
                                :key="index"
                                :tags="tags"
                                :language="language"
                                :paradigms="standardParadigms"/>
          </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && lemma.word_class=='ADJ'">
    <div v-if="mq!='xs'"
           class="infl-wordclass"
           :class="mq">
      <div class="lemma label-border-lemma">
        <span class="infl-lemma">{{lemma.lemma}} </span>
        <span class="sub">{{wordClass}}</span>
      </div>
      <div>
          <table class="infl-table" :class="mq">
            <tr>
              <th class="infl-label label-border-top-left" :class="mq" :colspan="hasFem ? 4 : 3">
                {{tagToName('Sing')}}
              </th>
              <th class="infl-label label-border-top-right" :class="mq" rowspan="2">
                {{tagToName('Plur')}}
              </th>
            </tr>
            <tr>
              <th v-if="hasFem" class="infl-label sub label-border-bottom" :class="mq">
                hankjønn
              </th>
              <th v-if="!hasFem" class="infl-label sub label-border-bottom" :class="mq">
                <span class="nobr">hankjønn /</span><br/>{{tagToName('Fem')}}</th>
              <th v-if="hasFem" class="infl-label sub label-border-bottom" :class="mq">
                {{tagToName('Fem')}}
              </th>
              <th class="infl-label sub label-border-bottom" :class="mq">{{tagToName('Fem')}}</th>
              <th class="infl-label sub label-border-bottom" :class="mq">bestemt form</th>
            </tr>
            <inflectionRowAdj v-for="(paradigm, index) in standardParadigms"
                              :key="index"
                              :hasDeg="hasDeg"
                              :hasFem="hasFem"
                              :paradigm="paradigm"/>
          </table>
      </div>
      <div v-if="hasDeg">
        <table class="infl-table" :class="mq">
            <tr>
              <th class="infl-label label-border-top-left-right" v-if="hasDeg" colspan="3">gradbøying</th>
            </tr>
            <tr>
              <th class="infl-label label-border-bottom">komparativ</th>
              <th class="infl-label label-border-bottom">superlativ<br/><span class="sub">ubestemt form</span></th>
              <th class="infl-label label-border-bottom">superlativ<br/><span class="sub">bestemt form</span></th>
            </tr>
            <inflectionRowAdjDeg v-for="(paradigm, index) in standardParadigms"
                                 :key="index"
                                 :paradigm="paradigm"/>
          </table>
      </div>
    </div>
    <div v-else
      class="infl-wordclass" :class="mq">
      <div class="lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq" >
          <inflectionRowsAdj v-for="(tags, index) in inflTagsAdj"
                             :key="index"
                             :tags="tags"
                             :language="language"
                               :paradigms="standardParadigms"/>
        </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && lemma.word_class=='PRON'">
    <div v-if="mq!='xs'"
         class="infl-wordclass"
         :class="mq">
      <div class="lemma label-border-lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <tr>
            <th class="infl-label sub label-border-top-left">
              subjektsform
            </th>
            <th class="infl-label sub label-border-top-right">
              objektsform
            </th>
          </tr>
          <inflectionRowPron v-for="(paradigm, index) in standardParadigms"
                             :key="index"
                             :language="language"
                             :paradigm="paradigm"/>
          </table>
      </div>
    </div>
    <div v-else
         class="infl-wordclass"
         :class="mq">
      <div class="lemma">
        <span class="infl-lemma">{{lemma.lemma}} </span>
        <span class="sub">{{wordClass}}</span>
        <span class="sub" v-if="nounGender"> {{nounGender}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <inflectionRowsPron v-for="(tags, index) in inflTagsPron"
                              :key="index"
                              :tags="tags"
                              :lemma="lemma.lemma"
                              :language="language"
                              :paradigms="standardParadigms"/>
        </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && isUninflected">
    <div class="infl-wordclass" :class="mq">
      <div class="lemma label-border-top">
        <span class="lemma">{{lemma.lemma}} </span>
        <span class="sub">{{wordClass}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <tr>
            <th class="infl-label label-border">ubøyelig</th>
          </tr>
          <tr>
            <td class="infl-cell label-border">{{lemma.lemma}}</td>
          </tr>
        </table>
      </div>
    </div>
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
import inflectionRowPron from './inflectionRowPron.vue'

import inflectionRowsNoun from './inflectionRowsNoun.vue'
import inflectionRowsVerb from './inflectionRowsVerb.vue'
import inflectionRowsAdj from './inflectionRowsAdj.vue'
import inflectionRowsPron from './inflectionRowsPron.vue'


import { calculateStandardParadigms,
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
                  inflectionRowPron,
                  inflectionRowsNoun,
                  inflectionRowsVerb,
                  inflectionRowsAdj,
                  inflectionRowsPron
                },
    props: ['lemmaList','inline','mq'],
    data: function () {
        return { wordClass: this.lemmaList ?
                 posNames[this.lemmaList[0].word_class] || this.lemmaList[0].word_class : null,
                 language: this.lemmaList ? this.lemmaList[0].language : null,
                 hasFem: this.hasInflForm(['Pos','Fem']),
                 hasDeg: this.hasInflForm(['Cmp']),
                 hasPerfPart: this.hasInflForm(['Adj','<PerfPart>']),
                 hasPerfPartDef: this.hasInflForm(['Adj','<PerfPart>','Def']),
                 hasImp: this.hasInflForm(['Imp']),
                 isUninflected: this.lemmaList && !['NOUN','ADJ','VERB','PRON'].find(wc=>wc==this.lemmaList[0].word_class),
                 show: false,
                 lemma: this.lemmaList && this.lemmaList[0],
                 paradigms: null,
                 gender: null, // gender if NOUN and only one gender
                 inflTagsNounG: [ { tags: ['_gender'] },
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
                               ],
                 inflTagsPronNonNeuter: [{ label: 'Nom', tags: ['Nom'] },
                                         { label: 'Acc', tags: ['Acc'] }],
                 inflTagsPronNeuter: [{ tags: ['Neuter'] }],
               }
    },
    computed: {
        // the paradigms that should be shown in the table
        standardParadigms: function () {
            return this.getStandardParadigms()
        },
        inflTagsPron: function () {
            return this.isNeuterPron() ? this.inflTagsPronNeuter : this.inflTagsPronNonNeuter
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
        tagToName: function (tag) {
            return tagToName(tag,this.language)
        },
        hasInflForm: function (tagList) {
            let info = this.lemmaList &&
                this.lemmaList[0].paradigm_info &&
                this.lemmaList[0].paradigm_info.find(
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
            this.lemmaList &&
                this.lemmaList.forEach(lemma =>
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
        isNeuterPron: function () {
            let paradigms = this.getStandardParadigms()
            let neuter = false
            paradigms.forEach(p => {
                if (p.tags.find(t => t == 'Neuter')) {
                    neuter = true
                }
            })
            return neuter
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

.sub {
    font-style: italic;
    font-weight: normal
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
