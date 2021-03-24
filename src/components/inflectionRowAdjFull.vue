<template>
<tr>
  <td class="infl">{{inflForm(['Pos',['Masc/Fem','Masc']])}}</td>
  <td v-if="hasFem" class="infl">{{inflForm(['Pos','Fem'])}}</td>
  <td class="infl">{{inflForm(['Pos','Neuter'])}}</td>
  <td class="infl">{{inflForm(['Pos','Def','Sing'])}}</td>
  <td class="infl">{{inflForm(['Pos','Plur'])}}</td>
  <template v-if="hasDeg">
    <td class="infl">{{inflForm(['Cmp'])}}</td>
    <td class="infl">{{inflForm(['Sup','Ind'])}}</td>
    <td class="infl">{{inflForm(['Sup','Def'])}}</td>
  </template>
</tr>
</template>

<script>

export default {
    name: 'inflectionRowAdj',
    props: ['paradigm','hasDeg','hasFem'],
    data: function () {
        return { }
    },
    methods: {
        inflForms: function (tagList,exclTagList) {
            let inflection = this.paradigm.inflection.filter(
                infl => { let found = infl.word_form
                          tagList.forEach(tag => {
                              if (typeof tag == 'string') {
                                  if (!infl.tags.find(t => t == tag)) {
                                      found = false }
                              } else {
                                  if (!infl.tags.find(t => tag.find(tg => tg == t))) {
                                      found = false }
                              }
                          })
                          if (exclTagList) {
                              exclTagList.forEach(tag =>
                                                  { if (infl.tags.find(t => t == tag)) {
                                                      found = false }
                                                  })
                          }
                          return found })
            return inflection.map(i => i.word_form)
        },
        inflForm: function (tagList,exclTagList) {
            return this.inflForms(tagList,exclTagList)[0]
        }
    }
}
</script>
