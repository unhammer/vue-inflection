<template>
<div :id="'lemma'+lemma.id">
  <div class="infl-wrapper">
    <template v-if="isNoun">
        <table v-if="mq!='xs'" class="infl-table" :class="mq">
          <caption class="caption">{{translate('caption.NOUN')}}</caption>
          <thead :lang="lang">
            <tr>
              <th class="infl-label sub label-border-top-left" :class="mq"
                  v-if="!nounGender && hasGender"
                  :id="'Gender'+lemma.id"
                  scope="col"
                  rowspan='2'>{{translate('tags.Gender')}}</th>
              <th v-if="hasSing"
                  :id="'Sing'+lemma.id"
                  class="infl-label label-border-top-left" :class="mq"
                  scope="col"
                  :colspan='hasDef?2:1'>
                {{translate('tags.Sing')}}</th>
              <th v-if="hasPlur"
                  :id="'Plur'+lemma.id"
                  class="infl-label label-border-top-right"
                  :class="mq" scope="col"
                  :colspan='hasDef?2:1'>
                {{translate('tags.Plur')}}</th>
            </tr>
            <tr>
              <th v-if="hasSing"
                  :id="'SingInd'+lemma.id"
                  class="infl-label sub label-border-bottom" scope="col" :class="mq">
                {{translate('tags.Ind')}} {{translate('tags.Form')}}
              </th>
              <th v-if="hasDef && hasSing"
                  :id="'SingDef'+lemma.id"
                  class="infl-label sub label-border-bottom" scope="col" :class="mq">
                {{translate('tags.Def')}} {{translate('tags.Form')}}
              </th>
              <th v-if="hasPlur" class="infl-label sub label-border-bottom"
                  :id="'PlurInd'+lemma.id"
                  scope="col" :class="mq">
                {{translate('tags.Ind')}} {{translate('tags.Form')}}
              </th>
              <th v-if="hasDef && hasPlur"
                  class="infl-label sub label-border-bottom"
                  :id="'PlurDef'+lemma.id"
                  scope="col" :class="mq">
                {{translate('tags.Def')}} {{translate('tags.Form')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <inflectionRowNoun v-for="(paradigm, index) in standardParadigms"
                                :key="index"
                                :showGender="!nounGender && hasGender"
                                :dict="dict"
                                :translate="translate"
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
        <table v-else class="infl-table" :class="mq">
          <inflectionRowsNoun v-for="(tags, index) in inflTagsNoun"
                              :key="index"
                              :showGender="!nounGender && hasGender"
                              :tags="tags"
                              :dict="dict"
                              :translate="translate"
                              :lemmaId="lemma.id"
                              :paradigms="standardParadigms"
                              @hilite="hilite"
                              @unhilite="unhilite"
                              />
        </table>
  </template>
  <template v-if="lemma && lemma.word_class=='VERB'">
    <template v-if="mq!='xs'">
      <div v-for="i in mq=='xs' ? [1,2] : [0]" :key="i">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{translate('caption.VERB')}}</caption>
          <thead :lang="lang">
            <tr>
              <th v-if="!i || i==1" class="infl-label label-border-top-left" :class="mq">{{translate('tags.Inf')}}</th>
              <th v-if="!i || i==1" class="infl-label label-border-top" :class="mq">{{translate('tags.Pres')}}</th>
              <th v-if="!i || i==1" class="infl-label label-border-top" :class="mq">{{translate('tags.Past')}}</th>
              <th v-if="!i || i==2" class="infl-label label-border-top" :class="mq">{{translate('tags.PresPerf')}}</th>
              <th v-if="(!i || i==2) && hasImp" class="infl-label label-border-top-right" :class="mq">{{translate('tags.Imp')}}</th>
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
          <caption class="caption">{{translate('caption.VERBPP')}}</caption>
          <thead :lang="lang">
            <template v-if="hasPerfPart">
              <tr>
                <th class="infl-label label-border-top-left"
                    :class="mq"
                    :id="'PerfPart'+lemma.id"
                    scope="col"
                    :colspan="hasPerfPartFem ? 5 : (hasPerfPartDef ? (j<0?4:(j==3?3:1)) : 1)">
                  {{translate('tags.PerfPart')}}
                </th>
                <th v-if="j<0 || j==4"
                    class="infl-label label-border-top-right" :class="mq"
                    :id="'PresPart'+lemma.id"
                    scope="col"
                    rowspan="2">{{translate('tags.PresPart')}}</th>
              </tr>
              <tr>
                <th v-if="(j<0 || j==3) && hasPerfPartDef"
                    :id="'Masc'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">
                  {{translate('tags.MascShort')}}&nbsp;/<br/>{{translate('tags.Fem')}}</th>
                <th v-if="(j<0 || j==3) && hasPerfPartFem"
                    :id="'Fem'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">
                  {{translate('tags.Fem')}}</th>
                <th :id="'Neuter'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq"
                    v-if="(j<0 || j==3)">{{translate('tags.Neuter')}}</th>
                <th v-if="(j<0 || j==3) && hasPerfPartDef"
                    :id="'Def'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">{{translate('tags.Def')}} {{translate('tags.Form')}}</th>
                <th v-if="(j<0 || j==4) && hasPerfPartDef"
                    :id="'Plur'+lemma.id"
                    scope="col"
                    class="infl-label sub label-border-bottom" :class="mq">{{translate('tags.Plur')}}</th>
              </tr>
            </template>
            <template v-else-if="hasPresPart">
              <tr>
                <th v-if="j<0 || j==4"
                    :id="'PresPart'+lemma.id"
                    class="infl-label label-border-top" :class="mq">{{translate('tags.PresPart')}}</th>
              </tr>
            </template>
          </thead>
          <tbody>
            <inflectionRowParticiple v-for="(paradigm, index) in standardParadigms"
                                     :key="index"
                                     :part="j"
                                     :translate="translate"
                                     :dict="dict"
                                     :lang="lang"
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
    </template>
    <table v-else class="infl-table" :class="mq" >
      <inflectionRowsVerb v-for="(tags, index) in inflTagsVerb"
                          :key="index"
                          :tags="tags"
                          :translate="translate"
                          :lang="lang"
                          :lemmaId="lemma.id"
                          :paradigms="standardParadigms"
                          @hilite="hilite"
                          @unhilite="unhilite"/>
    </table>
  </template>
  <template v-if="lemma && lemma.word_class=='ADJ'">
    <div v-if="mq!='xs'">
      <template v-if="hasSingAdj || hasPlur">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{translate('caption.ADJ')}}</caption>
          <thead :lang="lang">
            <tr>
              <th v-if="hasSingAdj"
                  class="infl-label label-border-top-left"
                  :class="mq"
                  :id="'Sing'+lemma.id"
                  scope="col"
                  :colspan="hasFem ? 4 : 3">
                {{translate('tags.Sing')}}
              </th>
              <th v-if="hasPlur"
                  class="infl-label label-border-top-right" :class="mq"
                  :id="'Plur'+lemma.id"
                  scope="col"
                  :rowspan="hasSingAdj ? 2 : 1">
                {{translate('tags.Plur')}}
              </th>
            </tr>
            <tr v-if="hasSingAdj">
              <th v-if="hasFem"
                  class="infl-label sub label-border-bottom"
                  :id="'Masc'+lemma.id"
                  scope="col"
                  :class="mq">
                {{translate('tags.Masc')}}
              </th>
              <th v-if="!hasFem"
                  class="infl-label sub label-border-bottom"
                  :id="'Masc'+lemma.id"
                  scope="col"
                  :class="mq">
                <span class="nobr">{{translate('tags.MascShort')}}&nbsp;/</span><br/>{{translate('tags.Fem')}}</th>
              <th v-if="hasFem"
                  class="infl-label sub label-border-bottom"
                  :id="'Fem'+lemma.id"
                  scope="col"
                  :class="mq">
                {{translate('tags.Fem')}}
              </th>
              <th class="infl-label sub label-border-bottom"
                  :id="'Neuter'+lemma.id"
                  scope="col"
                  :class="mq">
                {{translate('tags.Neuter')}}
              </th>
              <th class="infl-label sub label-border-bottom"
                  :id="'Def'+lemma.id"
                  scope="col"
                 :class="mq">
                {{translate('tags.Def')}} {{translate('tags.Form')}}
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
      </template>
      <template v-if="hasDeg">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{translate('caption.ADJCS')}}</caption>
          <thead :lang="lang">
            <tr>
              <th class="infl-label label-border-top-left-right"
                  v-if="hasDeg"
                  :id="'Deg'+lemma.id"
                  scope="col"
                  colspan="3">
                {{translate('tags.Deg')}}
              </th>
            </tr>
            <tr>
              <th :id ="'Cmp'+lemma.id"
                  scope="col"
                  class="infl-label label-border-bottom">
                {{translate('tags.Cmp')}}
              </th>
              <th :id="'SupInd'+lemma.id"
                  scope="col"
                  class="infl-label label-border-bottom">
                {{translate('tags.Sup')}}<br/><span class="sub">{{translate('tags.Ind')}} {{translate('tags.Form')}}</span>
              </th>
              <th :id="'SupDef'+lemma.id"
                  scope="col"
                  class="infl-label label-border-bottom">
                {{translate('tags.Sup')}}<br/><span class="sub">{{translate('tags.Def')}} {{translate('tags.Form')}}</span>
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
      </template>
    </div>
    <table v-else class="infl-table" :class="mq" >
      <inflectionRowsAdj v-for="(tags, index) in inflTagsAdj"
                          :key="index"
                          :tags="tags"
                          :translate="translate"
                          :lemmaId="lemma.id"
                          :paradigms="standardParadigms"
                          @hilite="hilite"
                          @unhilite="unhilite"/>
    </table>
  </template>
  <template v-if="lemma && lemma.word_class=='ADV' && isADJ_Adv">
    <template v-if="mq!='xs'">
      <template v-if="hasDeg">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{translate('caption.ADV')}}</caption>
          <thead :lang="lang">
            <tr>
              <th class="infl-label label-border-bottom">
                {{translate('tags.Pos')}}
              </th>
              <th class="infl-label label-border-bottom">
                {{translate('tags.Cmp')}}
              </th>
              <th class="infl-label label-border-bottom">
                {{translate('tags.Sup')}}
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
      </template>
    </template>
    <table v-else class="infl-table" :class="mq" >
      <inflectionRowsAdj v-for="(tags, index) in inflTagsAdjAdv"
                          :key="index"
                          :tags="tags"
                          :lemmaId="lemma.id"
                          :paradigms="standardParadigms"
                          @hilite="hilite"
                          @unhilite="unhilite"/>
    </table>
  </template>
  <template v-if="lemma && lemma.word_class=='PRON' && standardParadigms[0] && standardParadigms[0].inflection">
    <template v-if="mq!='xs'">
        <table class="infl-table" :class="mq">
          <caption class="caption">{{translate('caption.PRON')}}</caption>
          <thead :lang="lang">
            <tr>
              <th v-if="hasNom" class="infl-label sub label-border-top-left">
                {{translate('tags.Nom')}}
              </th>
              <th v-if="hasAcc" class="infl-label sub label-border-top-right">
                {{translate('tags.Acc')}}
              </th>
              <th v-if="hasNeuter" class="infl-label sub label-border-top-right">
                {{translate('tags.Neuter')}}
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
    </template>
    <table v-else class="infl-table" :class="mq">
      <inflectionRowsPron v-for="(tags, index) in inflTagsPron"
                          :key="index"
                          :tags="tags"
                          :translate="translate"
                          :lemmaId="lemma.id"
                          :paradigms="standardParadigms"
                          @hilite="hilite"
                          @unhilite="unhilite"/>
    </table>
  </template>
  <template v-if="lemma && lemma.word_class=='DET' && !isUninflected">
    <table v-if="mq!='xs'" class="infl-table" :class="mq">
      <caption class="caption">{{translate('caption.DET')}}</caption>
      <thead :lang="lang">
        <tr>
          <th v-if="hasSing"
              class="infl-label label-border-top-left" :class="mq"
              id="Sing"
              scope="col"
              :colspan="DETColspan">
            {{translate('tags.Sing')}}
          </th>
          <th v-if="hasPlur"
              class="infl-label label-border-top-right" :class="mq"
              id="Plur"
              scope="col"
              :rowspan="hasSing?2:1">
            {{translate('tags.Plur')}}
          </th>
        </tr>
        <tr v-if="hasSing">
          <th v-if="hasMasc"
              class="infl-label sub label-border-bottom" :class="mq"
              id="Masc"
              scope="col">
            {{translate('tags.Masc')}}
          </th>
          <th v-if="hasFem"
              class="infl-label sub label-border-bottom" :class="mq"
              id="Fem"
              scope="col">
            {{translate('tags.Fem')}}
          </th>
          <th v-if="hasNeuter"
              class="infl-label sub label-border-bottom" :class="mq"
              id="Neuter"
              scope="col">
            {{translate('tags.Neuter')}}
          </th>
          <th v-if="hasDef"
              class="infl-label sub label-border-bottom" :class="mq"
              id="Def"
              scope="col">
            {{translate('tags.Def')}} {{translate('tags.Form')}}
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
    <table v-else class="infl-table" :class="mq">
      <inflectionRowsDet v-for="(tags, index) in inflTagsDet"
                          :key="index"
                          :tags="tags"
                          :translate="translate"
                          :lemmaId="lemma.id"
                          :paradigms="standardParadigms"/>
    </table>
  </template>
  <template v-if="lemma && isUninflected && !isADJ_Adv">
    <table class="infl-table" :class="mq">
      <caption class="caption">{{translate('caption.ADV')}}</caption>
      <thead :lang="lang">
        <tr>
          <th class="infl-label label-border">{{translate('tags.Uninfl')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="infl-cell label-border">{{lemma.lemma}}</td>
        </tr>
      </tbody>
    </table>
  </template>
  </div>
</div>
</template>

<script>

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
import inflectionRowsPron from './inflectionRowsPron.vue'
import inflectionRowsDet from './inflectionRowsDet.vue'


import { getStandardParadigms,
         hasInflForm,
         markdownToHTML
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
            'locale',
            'langTag',
            'customTranslate',
            'includeNonStandard'
           ],
    data: function () {
        return { dict: this.lemmaList ? this.lemmaList[0].language : null,
                 translate: this.customTranslate || this.defaultTranslate,
                 lang: this.langTag || this.locale || this.$i18n.locale,
                 hasFem: this.hasInflForm(['Fem']),
                 hasNeuter: this.hasInflForm(['Neuter']) && !this.hasInflForm(['Nom']),
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
                   ].filter(r=>r)
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
            return !this.gender || this.gender=='+' ? null : this.translate('tags', this.gender)
        },
        edit: function () {
            return this.lemma.mode == 'edit' || this.lemma.mode == 'new'
        }
    },
    methods: {
        defaultTranslate: function(...args) {
              if (args.includes(undefined)) {
                  return ""
              }
              return this.locale ? this.$t(args.join("."), {locale: this.locale}) : this.$t(args.join("."))
        },
        hilited: function(rowindex, lemmaId) {
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
        getStandardParadigms: function () {
            return this.paradigms || getStandardParadigms(this.lemmaList, this.edit, this.includeNonStandard)
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
            let paradigms = getStandardParadigms(this.lemmaList)
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

td.infl-group {
  background-color: #FDF4F5;
  font-style: italic;
  text-align: center;
}

td.infl-label {
  font-style: italic;
  text-align: left;
}

td.infl-cell {
  text-align: center;
}

.context {
    color: #666666;
}

</style>
