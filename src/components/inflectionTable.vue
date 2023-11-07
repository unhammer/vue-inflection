<template>
<div @mouseover="unhiliteRows()" :id="'lemma'+lemma.id">
  <div class="infl-wrapper">
    <template v-if="isNoun">
      <div v-if="mq!='xs'"
           class="infl-wordclass"
           :class="mq">
        <div class="lemma label-border-lemma">
          <span class="infl-lemma" v-html="formattedLemma"/>
          <span class="sub"> {{wordClass}}</span>
          <span class="sub" v-if="nounGender"> {{nounGender}}</span>
        </div>
        <div>
          <table class="infl-table" :class="mq">
            <caption class="caption">{{$t('Inflection table for this noun')}}</caption>
            <thead>
              <tr>
                <th class="infl-label sub label-border-top-left" :class="mq"
                    v-if="!nounGender && hasGender"
                    :id="'Gender'+lemma.id"
                    scope="col"
                    rowspan='2'>{{$t('Gender')}}</th>
                <th v-if="hasSing"
                    :id="'Sing'+lemma.id"
                    class="infl-label label-border-top-left" :class="mq"
                    scope="col"
                    :colspan='hasDef?2:1'>
                  {{$t('Sing')}}</th>
                <th v-if="hasPlur"
                    :id="'Plur'+lemma.id"
                    class="infl-label label-border-top-right"
                    :class="mq" scope="col"
                    :colspan='hasDef?2:1'>
                  {{$t('Plur')}}</th>
              </tr>
              <tr>
                <th v-if="hasSing"
                    :id="'SingInd'+lemma.id"
                    class="infl-label sub label-border-bottom" scope="col" :class="mq">
                  {{$t('Ind')}} {{$t('Form')}}
                </th>
                <th v-if="hasDef && hasSing"
                    :id="'SingDef'+lemma.id"
                    class="infl-label sub label-border-bottom" scope="col" :class="mq">
                  {{$t('Def')}} {{$t('Form')}}
                </th>
                <th v-if="hasPlur" class="infl-label sub label-border-bottom"
                    :id="'PlurInd'+lemma.id"
                    scope="col" :class="mq">
                  {{$t('Ind')}} {{$t('Form')}}
                </th>
                <th v-if="hasDef && hasPlur"
                    class="infl-label sub label-border-bottom"
                    :id="'PlurDef'+lemma.id"
                    scope="col" :class="mq">
                  {{$t('Def')}} {{$t('Form')}}
                </th>
              </tr>
            </thead>
            <tbody>
              <inflectionRowNoun v-for="(paradigm, index) in standardParadigms"
                                 :key="index"
                                 :showGender="!nounGender"
                                 :dict="language"
                                 :lemma="lemma"
                                 :hasDef="hasDef"
                                 :hasSing="hasSing"
                                 :hasPlur="hasPlur"
                                 :paradigm="paradigm"
                                 @hilite="hilite"
                                 @unhilite="unhilite"
                                 />
            </tbody>
          </table>
        </div>
    </div>
    <div v-else
         class="infl-wordclass"
         :class="mq">
      <div class="lemma">
        <span class="infl-lemma" v-html="formattedLemma"/>
        <span class="sub"> {{wordClass}}</span>
        <span class="sub" v-if="nounGender"> {{nounGender}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <inflectionRowsNoun v-for="(tags, index) in inflTagsNoun"
                              :key="index"
                              :showGender="!nounGender"
                              :tags="tags"
                              :dict="language"
                              :lemmaId="lemma.id"
                              :paradigms="standardParadigms"
                              @hilite="hilite"
                              @unhilite="unhilite"
                              />
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
          <caption class="caption">{{$t('Inflection table for this verb')}}</caption>
          <thead>
            <tr>
              <th v-if="!i || i==1" class="infl-label label-border-top-left" :class="mq">{{$t('Inf')}}</th>
              <th v-if="!i || i==1" class="infl-label label-border-top" :class="mq">{{$t('Pres')}}</th>
              <th v-if="!i || i==1" class="infl-label label-border-top" :class="mq">{{$t('Past')}}</th>
              <th v-if="!i || i==2" class="infl-label label-border-top" :class="mq">{{$t('PresPerf')}}</th>
              <th v-if="(!i || i==2) && hasImp" class="infl-label label-border-top-right" :class="mq">{{$t('Imp')}}</th>
            </tr>
          </thead>
          <tbody>
            <inflectionRowVerb v-for="(paradigm, index) in standardParadigms"
                               :key="index"
                               :part="i"
                               :lemmaId="lemma.id"
                               :paradigm="paradigm"
                               @hilite="hilite"
                               @unhilite="unhilite"/>
          </tbody>
        </table>
      </div>
      <div v-for="j in mq=='xs' ? [3,4] : [-1]" :key="j">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{$t('Inflection table for the participles of this verb')}}</caption>
          <thead>
            <template v-if="hasPerfPart">
              <tr>
                <th class="infl-label label-border-top-left"
                    :class="mq"
                    :id="'PerfPart'+lemma.id"
                    scope="col"
                    :colspan="hasPerfPartFem ? 5 : (hasPerfPartDef ? (j<0?4:(j==3?3:1)) : 1)">
                  {{$t('PerfPart')}}
                </th>
                <th v-if="j<0 || j==4"
                    class="infl-label label-border-top-right" :class="mq"
                    :id="'PresPart'+lemma.id"
                    scope="col"
                    rowspan="2">{{$t('PresPart')}}</th>
              </tr>
              <tr>
                <th v-if="(j<0 || j==3) && hasPerfPartDef"
                    :id="'Masc'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">
                  {{$t('MascShort')}}&nbsp;/<br/>{{$t('Fem')}}</th>
                <th v-if="(j<0 || j==3) && hasPerfPartFem"
                    :id="'Fem'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">
                  {{$t('Fem')}}</th>
                <th :id="'Neuter'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq"
                    v-if="(j<0 || j==3)">{{$t('Neuter')}}</th>
                <th v-if="(j<0 || j==3) && hasPerfPartDef"
                    :id="'Def'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">{{$t('Def')}} {{$t('Form')}}</th>
                <th v-if="(j<0 || j==4) && hasPerfPartDef"
                    :id="'Plur'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">{{$t('Plur')}}</th>
              </tr>
            </template>
            <template v-else-if="hasPresPart">
              <tr>
                <th v-if="j<0 || j==4"
                    :id="'PresPart'+lemma.id"
                    class="infl-label label-border-top" :class="mq">{{$t('PresPart')}}</th>
              </tr>
            </template>
          </thead>
          <tbody>
            <inflectionRowParticiple v-for="(paradigm, index) in standardParadigms"
                                     :key="index"
                                     :part="j"
                                     :dict="language"
                                     :hasPerfPart="hasPerfPart"
                                     :hasPerfPartFem="hasPerfPartFem"
                                     :lemmaId="lemma.id"
                                     :paradigm="paradigm"
                                     :context="context"
                                     @hilite="hilite"
                                     @unhilite="unhilite"/>
          </tbody>
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
                              :lemmaId="lemma.id"
                              :paradigms="standardParadigms"
                              @hilite="hilite"
                              @unhilite="unhilite"/>
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
      <div v-if="hasSingAdj || hasPlur">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{$t('Inflection table for this adjective')}}</caption>
          <thead>
            <tr>
              <th v-if="hasSingAdj"
                  class="infl-label label-border-top-left"
                  :class="mq"
                  :id="'Sing'+lemma.id"
                  scope="col"
                  :colspan="hasFem ? 4 : 3">
                {{$t('Sing')}}
              </th>
              <th v-if="hasPlur"
                  class="infl-label label-border-top-right" :class="mq"
                  :id="'Plur'+lemma.id"
                  scope="col"
                  :rowspan="hasSingAdj ? 2 : 1">
                {{$t('Plur')}}
              </th>
            </tr>
            <tr v-if="hasSingAdj">
              <th v-if="hasFem"
                  class="infl-label sub label-border-bottom"
                  :id="'Masc'+lemma.id"
                  scope="col"
                  :class="mq">
                {{$t('Masc')}}
              </th>
              <th v-if="!hasFem"
                  class="infl-label sub label-border-bottom"
                  :id="'Masc'+lemma.id"
                  scope="col"
                  :class="mq">
                <span class="nobr">{{$t('MascShort')}}&nbsp;/</span><br/>{{$t('Fem')}}</th>
              <th v-if="hasFem"
                  class="infl-label sub label-border-bottom"
                  :id="'Fem'+lemma.id"
                  scope="col"
                  :class="mq">
                {{$t('Fem')}}
              </th>
              <th class="infl-label sub label-border-bottom"
                  :id="'Neuter'+lemma.id"
                  scope="col"
                  :class="mq">
                {{$t('Neuter')}}
              </th>
              <th class="infl-label sub label-border-bottom"
                  :id="'Def'+lemma.id"
                  scope="col"
                 :class="mq">
                {{$t('Def')}} {{$t('Form')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <inflectionRowAdj v-for="(paradigm, index) in standardParadigms"
                              :key="index"
                              :hasFem="hasFem"
                              :hasSing="hasSingAdj"
                              :lemmaId="lemma.id"
                              :paradigm="paradigm"
                              @hilite="hilite"
                              @unhilite="unhilite"/>
          </tbody>
        </table>
      </div>
      <div v-if="hasDeg">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{$t('Inflection table for this adjective (comparative, superlative)')}}</caption>
          <thead>
            <tr>
              <th class="infl-label label-border-top-left-right"
                  v-if="hasDeg"
                  :id="'Deg'+lemma.id"
                  scope="col"
                  colspan="3">
                {{$t('Deg')}}
              </th>
            </tr>
            <tr>
              <th :id ="'Cmp'+lemma.id"
                  scope="col"
                  class="infl-label label-border-bottom">
                {{$t('Cmp')}}
              </th>
              <th :id="'SupInd'+lemma.id"
                  scope="col"
                  class="infl-label label-border-bottom">
                {{$t('Sup')}}<br/><span class="sub">{{$t('Ind')}} {{$t('Form')}}</span>
              </th>
              <th :id="'SupDef'+lemma.id"
                  scope="col"
                  class="infl-label label-border-bottom">
                {{$t('Sup')}}<br/><span class="sub">{{$t('Def')}} {{$t('Form')}}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <inflectionRowAdjDeg v-for="(paradigm, index) in standardParadigms"
                                 :key="index"
                                 :lemmaId="lemma.id"
                                 :paradigm="paradigm"
                                 @hilite="hilite"
                                 @unhilite="unhilite"/>
          </tbody>
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
                             :lemmaId="lemma.id"
                             :paradigms="standardParadigms"
                             @hilite="hilite"
                             @unhilite="unhilite"/>
        </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && lemma.word_class=='ADV' && isADJ_Adv">
    <div v-if="mq!='xs'"
           class="infl-wordclass"
           :class="mq">
      <div class="lemma label-border-lemma">
        <span class="infl-lemma">{{lemma.lemma}} </span>
        <span class="sub">{{wordClass}}</span>
      </div>
      <div v-if="hasDeg">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{$t('Inflection table for this adverb')}}</caption>
          <thead>
            <tr>
              <th class="infl-label label-border-bottom">
                {{$t('Pos')}}
              </th>
              <th class="infl-label label-border-bottom">
                {{$t('Cmp')}}
              </th>
              <th class="infl-label label-border-bottom">
                {{$t('Sup')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <inflectionRowAdjAdv v-for="(paradigm, index) in standardParadigms"
                                 :key="index"
                                 :lemmaId="lemma.id"
                                 :paradigm="paradigm"
                                 @hilite="hilite"
                                 @unhilite="unhilite"/>
          </tbody>
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
          <inflectionRowsAdj v-for="(tags, index) in inflTagsAdjAdv"
                             :key="index"
                             :tags="tags"
                             :lemmaId="lemma.id"
                             :paradigms="standardParadigms"
                             @hilite="hilite"
                             @unhilite="unhilite"/>
        </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && lemma.word_class=='PRON' && standardParadigms[0] && standardParadigms[0].inflection">
    <div v-if="mq!='xs'"
         class="infl-wordclass"
         :class="mq">
      <div class="lemma label-border-lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <caption class="caption">{{$t('Inflection table for this pronoun')}}</caption>
          <thead>
            <tr>
              <th v-if="hasNom" class="infl-label sub label-border-top-left">
                {{$t('Nom')}}
              </th>
              <th v-if="hasAcc" class="infl-label sub label-border-top-right">
                {{$t('Acc')}}
              </th>
              <th v-if="hasNeuter" class="infl-label sub label-border-top-right">
                {{$t('Neuter')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <inflectionRowPron v-for="(paradigm, index) in standardParadigms"
                               :key="index"
                               :lemmaId="lemma.id"
                               :paradigm="paradigm"
                               @hilite="hilite"
                               @unhilite="unhilite"/>
          </tbody>
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
                              :lemmaId="lemma.id"
                              :paradigms="standardParadigms"
                              @hilite="hilite"
                              @unhilite="unhilite"/>
        </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && lemma.word_class=='DET' && !isUninflected">
    <div v-if="mq!='xs'"
         class="infl-wordclass"
         :class="mq">
      <div class="lemma label-border-lemma">
          <span class="infl-lemma">{{lemma.lemma}} </span>
          <span class="sub">{{wordClass}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <caption class="caption">{{$t('Inflection table for this determinative')}}</caption>
          <thead>
            <tr>
              <th v-if="hasSing"
                  class="infl-label label-border-top-left" :class="mq"
                  id="Sing"
                  scope="col"
                  :colspan="DETColspan">
                {{$t('Sing')}}
              </th>
              <th v-if="hasPlur"
                  class="infl-label label-border-top-right" :class="mq"
                  id="Plur"
                  scope="col"
                  :rowspan="hasSing?2:1">
                {{$t('Plur')}}
              </th>
            </tr>
            <tr v-if="hasSing">
              <th v-if="hasMasc"
                  class="infl-label sub label-border-bottom" :class="mq"
                  id="Masc"
                  scope="col">
                {{$t('Masc')}}
              </th>
              <th v-if="hasFem"
                  class="infl-label sub label-border-bottom" :class="mq"
                  id="Fem"
                  scope="col">
                {{$t('Fem')}}
              </th>
              <th v-if="hasNeuter"
                  class="infl-label sub label-border-bottom" :class="mq"
                  id="Neuter"
                  scope="col">
                {{$t('Neuter')}}
              </th>
              <th v-if="hasDef"
                  class="infl-label sub label-border-bottom" :class="mq"
                  id="Def"
                  scope="col">
                {{$t('Def')}} {{$t('Form')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <inflectionRowDet v-for="(paradigm, index) in standardParadigms"
                              :key="index"
                              :lemmaId="lemma.id"
                              :paradigm="paradigm"/>
          </tbody>
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
          <inflectionRowsDet v-for="(tags, index) in inflTagsDet"
                             :key="index"
                             :tags="tags"
                             :lemmaId="lemma.id"
                             :paradigms="standardParadigms"/>
        </table>
      </div>
    </div>
  </template>
  <template v-if="lemma && isUninflected && !isADJ_Adv">
    <div class="infl-wordclass" :class="mq">
      <div class="lemma label-border-top">
        <span class="lemma">{{lemma.lemma}} </span>
        <span class="sub">{{wordClass}}</span>
      </div>
      <div>
        <table class="infl-table" :class="mq">
          <caption class="caption">{{$t('Inflection table for this adverb')}}</caption>
          <thead>
            <tr>
              <th class="infl-label label-border">{{$t('Uninfl')}}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="infl-cell label-border">{{lemma.lemma}}</td>
            </tr>
          </tbody>
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
import inflectionRowAdjAdv from './inflectionRowAdjAdv.vue'
import inflectionRowVerb from './inflectionRowVerb.vue'
import inflectionRowParticiple from './inflectionRowParticiple.vue'
import inflectionRowPron from './inflectionRowPron.vue'
import inflectionRowDet from './inflectionRowDet.vue'

import inflectionRowsNoun from './inflectionRowsNoun.vue'
import inflectionRowsVerb from './inflectionRowsVerb.vue'
import inflectionRowsAdj from './inflectionRowsAdj.vue'
// import inflectionRowsAdjAdv from './inflectionRowsAdjAdv.vue'
import inflectionRowsPron from './inflectionRowsPron.vue'
import inflectionRowsDet from './inflectionRowsDet.vue'


import { calculateStandardParadigms,
         word_formsEqual, hasTags, hasInflForm, markdownToHTML
       } from './mixins/ordbankUtils.js'

export default {
    name: 'inflectionTable',
    components: { inflectionRowNoun,
                  inflectionRowAdj,
                  inflectionRowAdjDeg,
                  inflectionRowAdjAdv,
                  inflectionRowVerb,
                  inflectionRowParticiple,
                  inflectionRowPron,
                  inflectionRowDet,
                  inflectionRowsNoun,
                  inflectionRowsVerb,
                  inflectionRowsAdj,
                  inflectionRowsPron,
                  inflectionRowsDet
                },
    props: ['lemmaList', // list of JSON objects as returned from Ordbank API call, e.g.
                         // https://clarino.uib.no/ordbank-api-prod/lemmas?query=<lemma_id>&stubs=false&language=nob
            'mq',        // media query screen size
            'context',   // show participle context?
            'eng',       // is localization language English?
            'ukr',       // is localization language Ukrainian?
            'includeNonStandard'
           ],
    data: function () {
        return { language: this.lemmaList ? this.lemmaList[0].language : null,
                 locale: this.eng ? 'eng' : (this.ukr ? 'ukr' : (this.lemmaList ? this.lemmaList[0].language : null)),
                 hasFem: this.hasInflForm(['Fem']),
                 hasNeuter: this.hasInflForm(['Neuter']),
                 hasMasc: this.hasInflForm(['Masc']),
                 hasDeg: this.hasInflForm(['Cmp']),
                 hasDef: this.hasInflForm(['Def']),
                 hasSing: this.hasInflForm(['Sing']),
                 hasSingAdj: this.hasInflForm(['Sing','Ind']),
                 hasPlur: this.hasInflForm(['Plur']),
                 hasGender: this.hasInflForm(['Masc']) || this.hasInflForm(['Fem']) || this.hasInflForm(['Neuter']),
                 hasPresPart: this.hasInflForm(['Adj','<PresPart>']),
                 hasPerfPart: this.hasInflForm(['Adj','<PerfPart>']),
                 hasPerfPartDef: this.hasInflForm(['Adj','<PerfPart>','Def']),
                 hasPerfPartFem: this.hasInflForm(['Adj','<PerfPart>','Fem']), // non-standard forms only
                 hasImp: this.hasInflForm(['Imp']),
                 hasNom: this.hasInflForm(['Nom']),
                 hasAcc: this.hasInflForm(['Acc']),
                 isUninflected: this.lemmaList && (!['NOUN','PROPN','ADJ','VERB','PRON','DET','ABBR']
                                                   .find(wc=>wc==this.lemmaList[0].word_class) ||
                                                   this.lemmaList[0].paradigm_info[0].inflection_group == 'DET_simple'
                                                  ),
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
                 inflTagsNounIndG: [ { tags: ['_gender'] },
                                  { title: 'Sing' },
                                  { label: 'Ind', tags: ['Sing','Ind'], indefArt: true },
                                  { title: 'Plur'},
                                  { label: 'Ind', tags: ['Plur','Ind']}],
                 inflTagsNounIndNG: [{ title: 'Sing' },
                                  { label: 'Ind', tags: ['Sing','Ind'], indefArt: true },
                                  { title: 'Plur'},
                                  { label: 'Ind', tags: ['Plur','Ind']}],
                 inflTagsNounSingG: [ { tags: ['_gender'] },
                                      { title: 'Sing'},
                                      { label: 'Ind', tags: ['Sing','Ind']},
                                      { label: 'Def', tags: ['Sing','Def']}],
                 inflTagsNounSingNG: [ { title: 'Sing'},
                                       { label: 'Ind', tags: ['Sing','Ind']},
                                       { label: 'Def', tags: ['Sing','Def']}],
                 inflTagsNounPlur:    [{ title: 'Plur'},
                                       { label: 'Ind', tags: ['Plur','Ind']},
                                       { label: 'Def', tags: ['Plur','Def']}],
                 inflTagsNounPlurInd: [{ title: 'Plur'},
                                       { label: 'Ind', tags: ['Plur','Ind']}],
                 inflTagsAdjAdv: [ { label: 'Pos', tags: ['Pos']},
                                   { label: 'Cmp', tags: ['Cmp']},
                                   { label: 'Sup', tags: ['Sup']}
                                 ].filter(r=>r),
                 inflTagsPronNonNeuter: [{ label: 'Nom', tags: ['Nom'] },
                                         { label: 'Acc', tags: ['Acc'] }],
                 inflTagsPronNeuter: [{ tags: ['Neuter'] }],
                 inflTagsDetPl: [ { title: 'Sing' },
                                  { block: 'Sing', label: 'Masc', tags: ['Masc'] },
                                  { block: 'Sing', label: 'Fem', tags: ['Fem'] },
                                  { block: 'Sing', label: 'Neuter', tags: ['Neuter']},
                                  { block: 'Sing', label: 'Def', tags: ['Def']},
                                  { title: 'Plur'},
                                  { block: 'Plur', tags: ['Plur'] }
                                ],
                 inflTagsDetSg: [ { title: 'Sing' },
                                  { block: 'Sing', label: 'Masc', tags: ['Masc'] },
                                  { block: 'Sing', label: 'Fem', tags: ['Fem'] },
                                  { block: 'Sing', label: 'Neuter', tags: ['Neuter']},
                                  { block: 'Sing', label: 'Def', tags: ['Def']}
                                ],
                 hilitedLemma: null,
                 hilitedRows: [],
               }
    },
    computed: {
        wordClass: function () {
            if (this.lemmaList) {
                if (this.isADJ_Adv) {
                    return this.$t('ADV')
                } else {
                    return this.$t(this.lemmaList[0].word_class)
                        || this.lemmaList[0].word_class
                }
            } else {
                return null
            }
        },
        formattedLemma: function () {
            return markdownToHTML(this.lemma.markdown_lemma || this.lemma.lemma)
        },
        // the paradigms that should be shown in the table
        standardParadigms: function () {
            return this.getStandardParadigms()
        },
        DETColspan: function () {
            return (this.hasDef ? 1 : 0) +
                (this.hasMasc ? 1 : 0) + (this.hasFem ? 1 : 0) + (this.hasNeuter ? 1 : 0)
        },
        isNoun: function () {
            return this.lemma && (this.lemma.word_class=='NOUN' ||
                                  this.lemma.paradigm_info.find(pi=>pi.inflection_group == 'NOUN_regular'))
        },
        isADJ_Adv: function () {
            return this.lemmaList && this.lemmaList[0].paradigm_info[0].inflection_group == 'ADJ_adv'
        },
        inflTagsPron: function () {
            return this.isNeuterPron() ? this.inflTagsPronNeuter : this.inflTagsPronNonNeuter
        },
        inflTagsDet: function () {
            return this.hasPlur ? this.inflTagsDetPl : this.inflTagsDetSg
        },
        inflTagsNoun: function () {
            if (this.hasSing) {
                if (this.hasPlur) {
                    if (this.hasDef) {
                        return this.getGender() == '+' ? this.inflTagsNounG : this.inflTagsNounNG
                    } else {
                        return this.getGender() == '+' ? this.inflTagsNounIndG : this.inflTagsNounIndNG
                    }
                } else {
                    return this.getGender() == '+' ? this.inflTagsNounSingG : this.inflTagsNounSingNG
                }
            } else if (this.hasDef) {
                return this.inflTagsNounPlur
            } else {
                return this.inflTagsNounPlurInd
            }
        }, // hasImp, hasPerfPart, hasPerfPartDef, has
        inflTagsVerb: function () {
            return [{ label: 'Inf', tags: ['Inf'], excl: ['Pass'], prefix: 'å' },
                    { label: 'Pres', tags: ['Pres'], excl: ['Pass'] },
                    { label: 'Past', tags: ['Past'] },
                    { label: 'PresPerf', tags: ['<PerfPart>'], excl: ['Adj'], prefix: 'har' },
                    this.hasImp ? { label: 'Imp', tags: ['Imp'], suffix: '!' } : null,
                    this.hasPerfPart ? { title: 'PerfPart' } : null,
                    this.hasPerfPartDef ? { block: 'PerfPart', label: 'MascFem', tags: ['Adj','Masc/Fem']} : null,
                    this.hasPerfPartFem ? { block: 'PerfPart', label: 'Fem', tags: ['Adj','Fem']} : null,
                    this.hasPerfPart ? { block: 'PerfPart', label: 'Neuter', tags: ['Adj','Neuter']} : null,
                    this.hasPerfPartDef ? { block: 'PerfPart', label: 'Def', tags: ['Adj','Def']} : null,
                    this.hasPerfPartDef ? { block: 'PerfPart', label: 'Plur', tags: ['Adj','Plur']} : null,
                    this.hasPresPart ? { title: 'PresPart' } : null,
                    this.hasPresPart ? { block: 'PresPart', tags: ['Adj','<PresPart>'] } : null,
                   ].filter(r => r)
        },
        inflTagsAdj: function () {
            return [ this.hasSingAdj ? { title: 'Sing' } : null,
                     { block: 'Sing', label: 'MascFem', tags: ['Pos',['Masc/Fem','Masc']] },
                     { block: 'Sing', label: 'Fem', tags: ['Pos','Fem'] },
                     { block: 'Sing', label: 'Neuter', tags: ['Pos','Neuter']},
                     { block: 'Sing', label: 'Def', tags: ['Pos','Def','Sing']},
                     { title: 'Plur'},
                     { block: 'Plur', tags: ['Pos','Plur']},
                     { title: 'Deg'},
                     { block: 'Deg', label: 'Cmp', tags: ['Cmp']},
                     { block: 'Deg', label: 'SupInd', tags: ['Sup','Ind']},
                     { block: 'Deg', label: 'SupDef', tags: ['Sup','Def']}
                   ].filter(r=>r)
            },
        nounGender: function () {
            this.getGender()
            return !this.gender || this.gender=='+' ? null : this.$t(this.gender)
        },
        edit: function () {
            return this.lemma.mode == 'edit' || this.lemma.mode == 'new'
        }
    },
    methods: {
        hilited: function(rowindex, lemmaId) {
            console.log('hilited', rowindex, lemmaId)
            if(lemmaId === this.hilitedLemma)
                for(const item of rowindex) {
                    if (this.hilitedRows.includes(item)) {
                        return true
                    }
                }
          return false
            
        },
        hilite: function(rowindex, lemmaId) {
          this.hilitedLemma = lemmaId
          this.hilitedRows = rowindex
        },
        unhilite: function() {
          this.hilitedLemma = null
          this.hilitedRows = []
        },
        hasInflForm: function (tagList) { // checks only standard forms
            let info = false
            if (this.lemmaList) {
                this.lemmaList.forEach(lemma => {
                    if (lemma.paradigm_info &&
                        lemma.paradigm_info.find(
                            paradigm => (this.includeNonStandard ||
                                         (paradigm.standardisation == 'STANDARD' &&
                                          (!paradigm.code || paradigm.code[0] != 'M') && 
                                          !paradigm.to)) &&
                                hasInflForm(paradigm, tagList))) {
                        info = true
                    }
                })
            }
            return info
            },
        // the paradigms that should be shown in the table
        // sort Masc < Fem < Neuter, then sort alphabetically by word_form (first elt if it is a list)
        getStandardParadigms: function () {
            if (this.paradigms) {
                return this.paradigms
            }
            let paradigms = []
            this.lemmaList &&
                this.lemmaList.
                forEach(lemma =>
                        paradigms = paradigms.concat(
                            calculateStandardParadigms(lemma, this.edit, this.includeNonStandard)))
            if (!paradigms.length) {
                return []
            }

            let isNoun = paradigms[0].tags.find(t => t == 'NOUN') ||
                this.lemmaList && this.lemmaList[0].paradigm_info[0].inflection_group == 'NOUN_regular'
            
            let concat_wordforms = function (infl) {
                let chain = ''
                for (let i = 0; i < infl.length; i++) {
                    let wf = infl[i].word_form
                    if (wf == 'Masc' || wf == 'MascShort') { // Masc < Fem < Neuter
                        chain += 'a#'
                    } else if (wf == 'Fem' || wf == 'FemShort') {
                        chain += 'b#'
                    } else if (wf == 'Neuter'|| wf == 'NeuterShort') {
                        chain += 'c#'
                    } else if (typeof wf == 'string') {
                        chain += wf + '#'
                    } else if (!wf) {
                        null
                    } else {
                        chain += wf[0] + '#'
                    }
                }
                return chain
            }
            
            paradigms.forEach((p) => {
                // cases like ‘et nynorsk’, see #406, #510
                if (isNoun && p.tags.find(t=>t=='Uninfl') && p.inflection.length == 1) {
                    let standard = p.inflection[0].standardisation
                    p.inflection.push({ tags: ['Sing', 'Ind'],
                                        word_form: this.lemma.lemma,
                                        standardisation: standard })
                    p.inflection.push({ tags: ['Sing', 'Def'],
                                        word_form: '–',
                                        standardisation: standard })
                    p.inflection.push({ tags: ['Plur', 'Ind'],
                                        word_form: '–',
                                        standardisation: standard })
                    p.inflection.push({ tags: ['Plur', 'Def'],
                                        word_form: '–',
                                        standardisation: standard })
                }
            })

            paradigms = paradigms.sort((p1,p2) => {
                let chain1 = concat_wordforms(p1.inflection)
                let chain2 = concat_wordforms(p2.inflection)
                return chain1.localeCompare(chain2)
            })

            let currentTags = paradigms[0].tags
            let currentInfl = paradigms[0].inflection.map(infl => {
                infl.rowspan = 0
                infl.index = []
                return infl })
            // merge equal cells by setting rowspan
            paradigms.forEach((p,index) => {
                for (let i = 0; i < p.inflection.length; i++) {
                    if (currentInfl[i] &&
                        p.inflection[i] &&
                        currentInfl[i].rowspan > 0 &&
                        word_formsEqual(currentInfl[i].word_form,
                                        p.inflection[i].word_form,
                                        currentTags,
                                        p.tags,
                                        hasTags(currentInfl[i], ['Sing','Ind']) // no vertical merge
                                       )
                       ) {
                        currentInfl[i].index.push(index+1) // remember paradigm row, for hiliting
                        currentInfl[i].rowspan++
                        if (p.inflection[i].standardisation == 'STANDARD') {
                            currentInfl[i].standardisation = 'STANDARD'
                        }
                        if (isNoun) {
                            let gender = p.tags[1]
                            if (!currentInfl[i].gender.find(g=>g==gender)) {
                                currentInfl[i].gender.push(gender)
                            }
                        }
                        p.inflection[i].rowspan = 0
                    } else {
                        currentInfl[i] = p.inflection[i]
                        currentInfl[i].index = []
                        currentInfl[i].index.push(index+1) // remember paradigm row, for hiliting
                        currentInfl[i].rowspan = 1
                        if (isNoun) {
                            let gender = p.tags[1]
                            currentInfl[i].gender = [gender]
                        }
                    }
                }
            })
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
            // let isNoun = paradigms[0] ? paradigms[0].tags.find(t => t == 'NOUN') : null
            paradigms.forEach(p => {
                if (this.isNoun) {
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

td[class="infl-group"] {
  background-color: #FDF4F5;
  font-style: italic;
  text-align: center;
}

td[class*="infl-label"] {
  font-style: italic;
  text-align: left;
}

td[class="infl-cell"] {
  text-align: center;
}

.context {
    color: #666666;
}

</style>
