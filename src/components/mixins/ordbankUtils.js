
// functions for calculating and merging inflection table cells

export function calculateStandardParadigms (lemma,edit,all) {
    if (lemma.paradigm_info) {
        let paradigms = mergeParadigms(
            lemma.paradigm_info &&
                lemma.paradigm_info.filter(paradigm =>
                    (all || (paradigm.standardisation=='STANDARD' &&
                             (!paradigm.code || paradigm.code[0] != 'M') && 
                             !paradigm.to)) && // we assume this is in the past if not null
                        (!edit || !paradigm.exclude)
                ))
        paradigms.forEach(p => p.inflection.forEach(i =>
            i.markdown_word_form ?
                i.markdown_word_form = hyphenatedForm(i.markdown_word_form,lemma) :
                i.word_form = hyphenatedForm(i.word_form,lemma)))
        return paradigms
    } else {
        return []
    }
}

function appendWordForms(wf) {
    if (wf[1]) {
        return appendWordForms([appendTwoWordForms(wf[0],wf[1]),...wf.slice(2)])
    } else {
        return wf[0]
    }
}

function appendTwoWordForms (wf1, wf2) {
    let res
    if (!wf1) {
        res = wf2
    } else if (!wf2) {
        res = wf1
    } else if (wf1 == wf2) {
        res = wf1
    } else if (typeof wf1 == 'string') {
        if (typeof wf2 == 'string') {
            res = [wf1,wf2]
        } else if (wf2.find(x => x == wf1)) {
            res = wf2
        } else {
            res = [wf1,...wf2]
        }
    } else if (typeof wf2 == 'string') {
        if (wf1.find(x => x == wf2)) {
            res = wf1
        } else {
            res = [wf2,...wf1]
        }
    } else {
        let res = wf1.map(w => w)
        wf2.forEach(w => { if (!wf1.find(x => x == w)) { res.push(w) } })
    }
    if (Array.isArray(res)) res = res.sort((a,b) => a.localeCompare(b, 'no'))
    return res
}

// check if infl has all tags in tagList
export function hasTags (infl, tagList) {
    let found = true
    tagList.forEach(tag => { if (!infl.tags.find(t => t == tag)) { found = false } })
    return found
}

// Compare two wordforms (each either string, or set of strings)
// If checkTags is true checks in addition if tags1 and tags2 are equal.
// This is used to avoid merging of Sing Ind NOUN cells with differing gender
export function word_formsEqual (s1, s2, tags1, tags2, checkTags) {
    if (checkTags && tags1 && tags2 && !tagsEqual(tags1, tags2)) {
        return false
    } else if (!s1 && !s2) {
        return true
    } else if (typeof s1 == 'string') {
        return s1 == s2
    } else if (typeof s2 == 'string') {
        return false
    } else {
        let res = true
        s1.forEach(e => { if (!s2.find(v => v == e)) { res = false } })
        s2.forEach(e => { if (!s1.find(v => v == e)) { res = false } })
        return res
    }
}

// false if equal
function mergeCells(infl1, infl2, tagList, exclTagList) {
    if (!infl1.length || !infl2.length) {
        return true
    } else {
        let wf1 = null, wf2 = null, mwf1 = null, mwf2 = null
        for (let i = 0; i < infl1.length; i++) {
            let mf1 = infl1[i].markdown_word_form
            let f1 = infl1[i].word_form
            let mf2 = infl2[i] && infl2[i].markdown_word_form
            let f2 = infl2[i] && infl2[i].word_form
            if (hasTags(infl1[i], tagList) && (!exclTagList || !hasTags(infl1[i], exclTagList))) {
                if (!word_formsEqual(f1, f2)) {
                    wf1 = f1
                    wf2 = f2
                    mwf1 = mf1
                    mwf2 = mf2
                }
            } else if (!word_formsEqual(f1, f2)) { // difference in different tag list
                return true
            }
        }
        if (wf1) {
            return [ appendTwoWordForms(wf1,wf2), mwf1 ? appendTwoWordForms(mwf1,mwf2) : null ]
        } else {
            return false
        }
    }
}

function mergeParadigm (p, tagList, mergedCell) { // , standardisation) {
    return { exclude: p.exclude,
             from: p.from,
             to: p.to,
             standardisation: p.standardisation,
             tags: p.tags,
             inflection_group: p.inflection_group,
             inflection: p.inflection.map(infl => {
                 if (!hasTags(infl, tagList)) {
                     return infl
                 } else {
                     return { tags: infl.tags,
                              word_form: mergedCell[0],
                              markdown_word_form: mergedCell[1],
                              rowspan: infl.rowspan,
                              standardisation: infl.standardisation // : p.standardisation
                            }
                 }
             })
           }
}

function tagsEqual (tl1, tl2) {
    if (tl1.length != tl2.length) {
        return false
    }
    for (let i = 0; i < tl1.length; i++) {
        if (tl1[i] != tl2[i]) {
            return false
        }
    }
    return true
}

// Merge values of repeated tags into first tag, remove the remaining ones.
// non-destructive.
function normalizeInflection(paradigm) {
    let infl = paradigm.inflection
    if (paradigm.tags[0] == 'NOUN') { // add extra virtual tag _gender
        infl = [ { tags: ["_gender"],
                   word_form: paradigm.tags[1] + 'Short' },
                 ... infl ]
    }
    let res = []
    let tags = []
    for (let i = 0; i < infl.length; i++) {
        if (!infl[i].tags.length) {
            i
        } else if (tagsEqual(tags, infl[i].tags)) {
            res[res.length-1].word_form = appendTwoWordForms(res[res.length-1].word_form, infl[i].word_form)
            res[res.length-1].merged_word_form = appendTwoWordForms(res[res.length-1].markdown_word_form, infl[i].markdown_word_form)
        } else {
            tags = infl[i].tags
            res.push( { tags: tags,
                        word_form: infl[i].word_form,
                        markdown_word_form: infl[i].markdown_word_form,
                        rowspan: 1,
                        standardisation: paradigm.standardisation
                      } )
        }
    }
    return { exclude: paradigm.exclude,
             from: paradigm.from,
             to: paradigm.to,
             standardisation: paradigm.standardisation,
             tags: paradigm.tags,
             inflection: res,
             inflection_group: paradigm.inflection_group,
           }
}

// Iterate through tagList list and merge paradigms that are equal except on tagList,
// merging their word forms into an array
function mergeParadigms (paradigmInfo) {
    // remove Metaordbok paradigms
    paradigmInfo = paradigmInfo.filter(p=> !p.code || p.code.charAt(0) != 'M')
        .map(p => normalizeInflection(p))
    let PI = []
    let tagLists = [ [['Imp'], null],
                     [['Masc/Fem'], null],
                     [['Fem'], null],
                     [['Neuter'], null],
                     [['Pos','Def','Sing'], null],
                     [['Pos','Plur'], null],
                     [['Pres'], null],
                     [['Past'], null],
                     [['Inf'], ['Pass']],
                     [['<PerfPart>', 'Plur'], null],
                     [['<PresPart>'], null],
                     [['Plur','Def'], null],
                     [['Plur','Ind'], null],
                     [['Acc'], null],
                   ]
    tagLists.map(tagList => {
        paradigmInfo.map(paradigm => {
            let found = false
            let mergedCell = null
            let mergeRow = null
            let standardisation = null
            PI.forEach((p,i) => { // try to merge cells from p and paradigm corresponding to tagList
                let merged = mergeCells(p.inflection, paradigm.inflection, tagList[0], tagList[1])
                if (!merged) {
                    p.standardisation == 'STANDARD' || paradigm.standardisation == 'STANDARD' ?
                        standardisation = 'STANDARD' : standardisation = 'NON-STANDARD'
                    if (standardisation) {
                        p.standardisation = standardisation
                        // todo: has to be spread to inflection!
                    }
                    found = true // equal one found
                } else if (merged != true) { // merged cell
                    mergedCell = merged
                    mergeRow = i
                    p.standardisation == 'STANDARD' || paradigm.standardisation == 'STANDARD' ?
                        standardisation = 'STANDARD' : standardisation = 'NON-STANDARD'
                }
            })
            if (mergedCell) {
                // replace cell by merged cell (by updating word form), update paradigm in PI
                let p = mergeParadigm(paradigm, tagList[0], mergedCell, standardisation)
                PI[mergeRow] = p
            } else if (!found) {
                PI.push(paradigm)
            } else {
                null // 
            }
        })
        paradigmInfo = PI
        PI = []
    })
    return paradigmInfo
}

function inflectedForms (paradigm, tagList, exclTagList) {
    let inflection = paradigm.inflection.filter(
        infl => { let found = infl.markdown_word_form || infl.word_form || '-'
                  // console.log('infl', infl)
                  // '-' necessary for non-standard display,
                  // where PerfPart Fem is lacking in standard paradigms (e.g., ‘ete’)
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
                  return found
                })
    return [ inflection[0] && inflection[0].rowspan,
             inflection[0] && inflection[0].index,
             appendWordForms(inflection.map(i => i.markdown_word_form || i.word_form || '-')),
             inflection[0] && inflection[0].gender,
             inflection[0] && inflection[0].standardisation ]
}

// Calculate inflection table cell.
// If cells are vertically merged rowspan is the number of cells merged.
// noVerticalMerge is used for nouns
// see inflectionTable.vue for vertical merging and setting final rowspan
export function inflectedForm (paradigm, tagList, exclTagList, noVerticalMerge) {
    let [rowspan, index, forms, gender, standardisation] = inflectedForms(paradigm,tagList,exclTagList)
    if (rowspan == 0 && !noVerticalMerge) {
        return null // cell has been merged
    } else if (!rowspan && !noVerticalMerge) {
        return [null] // cell is empty
    } else if (!forms) {
        return [ rowspan, index, [ '-' ], null, standardisation ]
    } else if (typeof forms == 'string') {
        return [ rowspan, index, [ forms ], gender, standardisation ]
    } else {
        return [ rowspan, index, forms, gender, standardisation ]
    }
}

export function hasInflForm (paradigm, tagList) {
    let res = !paradigm.to &&
        paradigm.inflection_group != "VERB_sPass" && // fix for bug in paradigm def.
        paradigm.inflection.find(
            infl => { let found = infl.word_form // there are empty cells!
                      if (found) {
                          tagList.forEach(tag =>
                              { if (!infl.tags.find(t => t == tag) && // have to include common tags!
                                    !paradigm.tags.find(t => t == tag)) {
                                    found = false }
                              })
                      }
                      return found
                    })
    return !!res
}

const tagNames = [ 'Form', 'Gender', 'Sing', 'Plur', 'Ind', 'Def', 'Finite', 'Inf', 'Pres', 'Past',
                   'PresPerf', 'Imp', 'PerfPart', 'Fem', 'FemShort', 'Masc', 'MascShort', 'MascFem',
                   'Neuter', 'NeuterShort', 'PresPart', 'Deg', 'Pos', 'Cmp',
                   'Sup', 'SupInd', 'SupDef', 'Nom', 'Acc', 'Uninfl' ]

function hyphenatedForm (form, lemma) {
    if (lemma &&
        lemma.word_class == 'NOUN' &&
        lemma.lemma.length > 10 &&
        lemma.initial_lexeme &&
        !tagNames.find(f=>f==form) &&
        !lemma.neg_junction) {
        let junction = (lemma.junction && lemma.junction != '-') ? lemma.junction : null
        let il = lemma.initial_lexeme + (junction || '') + '­'
        let pfx_length = lemma.initial_lexeme.length + (junction ? junction.length : 0)
        if (typeof form === 'string') {
            form = il + form.substring(pfx_length)
        } else {
            form = form.map(str => il + str.substring(pfx_length))
        }
    }
    return form
}

const indefArticle_nob = { Masc: "en",
                           MascFem: "en/ei",
                           Fem: "ei/en",
                           Neuter: "et" }

const indefArticle_nno = { Masc: "ein",
                           MascFem: "ein/ei",
                           Fem: "ei",
                           Neuter: "eit" }

export function indefArticle (tagList, dict) {
    switch (dict) {
    case 'nob':
        return indefArticle_nob[tagList[1]]
    case 'nno':
        return indefArticle_nno[tagList[1]]
    case 'bm':
        return indefArticle_nob[tagList[1]]
    case 'nn':
        return indefArticle_nno[tagList[1]]
    }
}

export function markdownToHTML (str) {
    [ ['_','sub'],
      ['^','sup']
    ].map(pair => str = markdownCharToHTML(str,...pair))
    return str
}

function markdownCharToHTML (str,c,e,whole) {
    let html = ""
    let start = true
    let pos = 0
    for (let i = str.indexOf(c,0);
         i >= 0;
         i = str.indexOf(c,i+1)) {
        if (start || whole) {
            html += str.substring(pos,i) + '<' + e + '>'
            if (c == '^') { // fraction
                let slash = str.indexOf('/', i+1)
                let end = str.indexOf(c,i+1)
                if (slash > -1 && slash < end) {
                    html += str.substring(i+1,slash) + '</sup>/<sub>'
                    i = slash
                    e = 'sub'
                }
            }
        } else {
            html += str.substring(pos,i) + '</' + e + '>'
        }
        start = !start
        pos = i + c.length
    }
    return html + str.substring(pos)
}

// the paradigms that should be shown in the table
// sort Masc < Fem < Neuter, then sort alphabetically by word_form (first elt if it is a list)
export function getStandardParadigms (lemmaList, edit, includeNonStandard) {
    let paradigms = []
    lemmaList &&
        lemmaList.
        forEach(lemma =>
            paradigms = paradigms.concat(
                calculateStandardParadigms(lemma, edit, includeNonStandard)))
    if (!paradigms.length) {
        return []
    }

    let isNoun = paradigms[0].tags.find(t => t == 'NOUN') ||
        lemmaList && lemmaList[0].paradigm_info[0].inflection_group == 'NOUN_regular'
    
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
                                word_form: lemmaList[0].lemma,
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
}
