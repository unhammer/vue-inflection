
// functions for calculating and merging inflection table cells

export function calculateStandardParadigms (lemma,edit) {
    if (lemma.paradigm_info) {
        return mergeParadigms(
            lemma.paradigm_info && lemma.paradigm_info.filter(paradigm =>
                                        paradigm.standardisation=='STANDARD' &&
                                        !paradigm.to && // we assume this is in the past if not null
                                    (!edit || !paradigm.exclude)
                                       ))
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
    if (wf1 == wf2) {
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
    return res
}

// check if  infl has all tags in tagList
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
function mergeCells(infl1, infl2, tagList) {
    let wf1 = null, wf2 = null
    for (let i = 0; i < infl1.length; i++) {
        if (hasTags(infl1[i], tagList)) {
            if (!word_formsEqual(infl1[i].word_form, infl2[i].word_form)) {
                wf1 = infl1[i].word_form
                wf2 = infl2[i].word_form
            }
        } else if (!word_formsEqual(infl1[i].word_form, infl2[i].word_form)) { // difference in different tag list
            return true
        }
    }
    if (wf1) {
        return appendTwoWordForms(wf1,wf2)
    } else {
        return false
    }
}

function mergeParadigm(p, tagList, mergedCell) {
    return { exclude: p.exclude,
             from: p.from,
             to: p.to,
             tags: p.tags,
             inflection: p.inflection.map(infl => {
                 if (!hasTags(infl, tagList)) {
                     return infl
                 } else {
                     return { tags: infl.tags,
                              word_form: mergedCell,
                              rowspan: infl.rowspan
                            }
                 }
             })
           }
}

// returns true if the paradigms are equal on tagLists
// OBSOLETE?
export function compareParadigms(p1, p2, tagLists) {
    let equal = true
    tagLists.map(tagList => {
        let infl1 = p1.inflection.find(infl => hasTags(infl, tagList))
        let infl2 = p2.inflection.find(infl => hasTags(infl, tagList))
        if ((infl1 && !infl2) ||
            (!infl1 && infl2) ||
            (infl1 && infl2 && !word_formsEqual(infl1.word_form, infl2.word_form))) {
            equal = false
        }
    })
    return equal
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
                   word_form: paradigm.tags[1] },
                 ... infl ]
    }
    let res = []
    let tags = []
    for (let i = 0; i < infl.length; i++) {
        if (!infl[i].tags.length) {
            i
        } else if (tagsEqual(tags, infl[i].tags)) {
            res[res.length-1].word_form = appendTwoWordForms(res[res.length-1].word_form, infl[i].word_form)
        } else {
            tags = infl[i].tags
            res.push( { tags: tags,
                        word_form: infl[i].word_form,
                        rowspan: 1
                      } )
        }
    }
    return { exclude: paradigm.exclude,
             from: paradigm.from,
             to: paradigm.to,
             tags: paradigm.tags,
             inflection: res
           }
}

// Iterate through tagList list and merge paradigms that are equal except on tagList,
// merging their word forms into an array
export function mergeParadigms (paradigmInfo) {
    paradigmInfo = paradigmInfo.map(paradigm => normalizeInflection(paradigm))
    let PI = []
    let tagLists = [ ['Masc/Fem'],
                     ['Fem'],
                     ['Neuter'],
                     ['Pos','Def','Sing'],
                     ['Pos','Plur'],
                     ['Pres'],
                     ['Past'],
                     ['Imp'],
                     ['Inf'], // new
                     ['Plur','Def'],
                     ['Plur','Ind'],
                     ['Acc']
                   ]
    tagLists.map(tagList => {
        paradigmInfo.map(paradigm => {
            let found = false
            let mergedCell = null
            let mergeRow = null
            PI.forEach((p,i) => {
                let merged = mergeCells(p.inflection, paradigm.inflection, tagList)
                if (!merged) {
                    found = true // equal one found
                } else if (merged != true) { // merged cell
                    mergedCell = merged
                    mergeRow = i
                }
            })
            if (mergedCell) {
                let p = mergeParadigm(paradigm, tagList, mergedCell)
                PI[mergeRow] = p
            } else if (!found) {
                PI.push(paradigm)
            }
        })
        paradigmInfo = PI
        PI = []
    })
    return paradigmInfo
}

function inflectedForms (paradigm, tagList, exclTagList) {
    console.log(paradigm)
    let inflection = paradigm.inflection.filter(
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
                  return found
                })
    return [inflection[0] && inflection[0].rowspan,
            inflection[0] && inflection[0].index,
            appendWordForms(inflection.map(i => i.word_form))]
}

// Calculate inflection table cell. If cells are vertically merged rowspan is the number of cells merged.
// noVerticalMerge is used for nouns
// see inflectionTable.vue for vertical merging
export function inflectedForm (paradigm, tagList, exclTagList, noVerticalMerge) {
    let [rowspan, index, forms] = inflectedForms(paradigm,tagList,exclTagList)
    if (!rowspan && !noVerticalMerge) {
        return null
    } else if (!forms) {
        return [ rowspan, index, [ '-' ] ]
    } else if (typeof forms == 'string') {
        return [ rowspan, index, [ forms ] ]
    } else {
        return [ rowspan, index, forms ]
    }
}


const tagNames_nob = { Sing: "entall",
                       Plur: "flertall",
                       Ind: "ubestemt",
                       Def: "bestemt",
                       Finite: "finitte former",
                       Inf: "infinitiv",
                       Pres: "presens",
                       Past: "preteritum",
                       PresPerf: "presens perfektum",
                       Imp: "imperativ",
                       PerfPart: "perfektum partisipp",
                       Fem: "hunkjønn",
                       Masc: "hankjønn",
                       MascFem: "hankjønn/ hunkjønn",
                       Neuter: "intetkjønn",
                       PresPart: "presens partisipp",
                       Deg: "gradbøying",
                       Cmp: "komparativ",
                       SupInd: "superlativ ubestemt",
                       SupDef: "superlativ bestemt",
                       Nom: "subjektsform",
                       Acc: "objektsform"
                     }

const tagNames_nno = { Sing: "eintal",
                       Plur: "fleirtal",
                       Ind: "ubunden",
                       Def: "bunden",
                       Finite: "finitte former",
                       Inf: "infinitiv",
                       Pres: "presens",
                       Past: "preteritum",
                       PresPerf: "presens perfektum",
                       Imp: "imperativ",
                       PerfPart: "perfektum partisipp",
                       Fem: "hokjønn",
                       Masc: "hankjønn",
                       MascFem: "hankjønn/ hokjønn",
                       Neuter: "inkjekjønn",
                       PresPart: "presens partisipp",
                       Deg: "gradbøying",
                       Cmp: "komparativ",
                       SupInd: "superlativ ubunden",
                       SupDef: "superlativ bunden",
                       Nom: "subjektsform",
                       Acc: "objektsform"
                     }

export function tagToName (tag, language) {
    switch (language) {
    case 'nob':
        return tagNames_nob[tag]
    case 'nno':
        return tagNames_nno[tag]
    }
}

const indefArticle_nob = { Masc: "en",
                           MascFem: "en/ei",
                           Fem: "ei/en",
                           Neuter: "et" }

const indefArticle_nno = { Masc: "ein",
                           MascFem: "ein/ei",
                           Fem: "ei",
                           Neuter: "eit" }

export function indefArticle (tagList, language) {
    switch (language) {
    case 'nob':
        return indefArticle_nob[tagList[1]]
    case 'nno':
        return indefArticle_nno[tagList[1]]
    }
}
