(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
    typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
    (global = global || self, factory(global.inflectionTable = {}, global.$));
}(this, (function (exports, $) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;

    // functions for calculating and merging inflection table cells

    function calculateStandardParadigms (lemma,edit) {
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
        let res;
        if (wf1 == wf2) {
            res = wf1;
        } else if (typeof wf1 == 'string') {
            if (typeof wf2 == 'string') {
                res = [wf1,wf2];
            } else if (wf2.find(x => x == wf1)) {
                res = wf2;
            } else {
                res = [wf1,...wf2];
            }
        } else if (typeof wf2 == 'string') {
            if (wf1.find(x => x == wf2)) {
                res = wf1;
            } else {
                res = [wf2,...wf1];
            }
        } else {
            let res = wf1.map(w => w);
            wf2.forEach(w => { if (!wf1.find(x => x == w)) { res.push(w); } });
        }
        return res
    }

    // check if  infl has all tags in tagList
    function hasTags (infl, tagList) {
        let found = true;
        tagList.forEach(tag => { if (!infl.tags.find(t => t == tag)) { found = false; } });
        return found
    }

    // Compare two wordforms (each either string, or set of strings)
    // If checkTags is true checks in addition if tags1 and tags2 are equal.
    // This is used to avoid merging of Sing Ind NOUN cells with differing gender
    function word_formsEqual (s1, s2, tags1, tags2, checkTags) {
        if (checkTags && tags1 && tags2 && !tagsEqual(tags1, tags2)) {
            return false
        } else if (!s1 && !s2) {
            return true
        } else if (typeof s1 == 'string') {
            return s1 == s2
        } else if (typeof s2 == 'string') {
            return false
        } else {
            s1.forEach(e => { if (!s2.find(v => v == e)) { return false } });
            s2.forEach(e => { if (!s1.find(v => v == e)) { return false } });
            return true
        }
    }

    // false if equal
    function mergeCells(infl1, infl2, tagList) {
        let wf1 = null, wf2 = null;
        for (let i = 0; i < infl1.length; i++) {
            if (hasTags(infl1[i], tagList)) {
                if (!word_formsEqual(infl1[i].word_form, infl2[i].word_form)) {
                    wf1 = infl1[i].word_form;
                    wf2 = infl2[i].word_form;
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
        let infl = paradigm.inflection;
        if (paradigm.tags[0] == 'NOUN') { // add extra virtual tag _gender
            infl = [ { tags: ["_gender"],
                       word_form: paradigm.tags[1] },
                     ... infl ];
        }
        let res = [];
        let tags = [];
        for (let i = 0; i < infl.length; i++) {
            if (!infl[i].tags.length) ; else if (tagsEqual(tags, infl[i].tags)) {
                res[res.length-1].word_form = appendTwoWordForms(res[res.length-1].word_form, infl[i].word_form);
            } else {
                tags = infl[i].tags;
                res.push( { tags: tags,
                            word_form: infl[i].word_form,
                            rowspan: 1
                          } );
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
    function mergeParadigms (paradigmInfo) {
        paradigmInfo = paradigmInfo.map(paradigm => normalizeInflection(paradigm));
        let PI = [];
        let tagLists = [ ['Masc/Fem'],
                         ['Fem'],
                         ['Neuter'],
                         ['Pos','Def','Sing'],
                         ['Pos','Plur'],
                         ['Pres'],
                         ['Past'],
                         ['Imp'],
                         ['Plur','Def']
                       ];
        tagLists.map(tagList => {
            paradigmInfo.map(paradigm => {
                let found = false;
                let mergedCell = null;
                let mergeRow = null;
                PI.forEach((p,i) => {
                    let merged = mergeCells(p.inflection, paradigm.inflection, tagList);
                    if (!merged) {
                        found = true; // equal one found
                    } else if (merged != true) { // merged cell
                        mergedCell = merged;
                        mergeRow = i;
                    }
                });
                if (mergedCell) {
                    let p = mergeParadigm(paradigm, tagList, mergedCell);
                    PI[mergeRow] = p;
                } else if (!found) {
                    PI.push(paradigm);
                }
            });
            paradigmInfo = PI;
            PI = [];
        });
        return paradigmInfo
    }

    function inflectedForms (paradigm, tagList, exclTagList) {
        let inflection = paradigm.inflection.filter(
            infl => { let found = infl.word_form;
                      tagList.forEach(tag => {
                          if (typeof tag == 'string') {
                              if (!infl.tags.find(t => t == tag)) {
                                  found = false; }
                          } else {
                              if (!infl.tags.find(t => tag.find(tg => tg == t))) {
                                  found = false; }
                          }
                      });
                      if (exclTagList) {
                          exclTagList.forEach(tag =>
                                              { if (infl.tags.find(t => t == tag)) {
                                                  found = false; }
                                              });
                      }
                      return found
                    });
        return [inflection[0] && inflection[0].rowspan,
                inflection[0] && inflection[0].index,
                appendWordForms(inflection.map(i => i.word_form))]
    }

    // Calculate inflection table cell. If cells are vertically merged rowspan is the number of cells merged.
    // noVerticalMerge is used for nouns
    // see inflectionTable.vue for vertical merging
    function inflectedForm (paradigm, tagList, exclTagList, noVerticalMerge) {
        let [rowspan, index, forms] = inflectedForms(paradigm,tagList,exclTagList);
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
                           SupDef: "superlativ bestemt"
                         };

    const tagNames_nno = { Sing: "eintal",
                           Plur: "fleirtal",
                           Ind: "ubestemt",
                           Def: "bestemt",
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
                           SupInd: "superlativ ubestemt",
                           SupDef: "superlativ bestemt"
                         };

    function tagToName (tag, language) {
        switch (language) {
        case 'nob':
            return tagNames_nob[tag]
        case 'nno':
            return tagNames_nno[tag]
        }
    }

    const indefArticle_nob = { Masc: "en",
                               Fem: "ei/en",
                               Neuter: "et" };

    const indefArticle_nno = { Masc: "ein",
                               Fem: "ei",
                               Neuter: "eit" };

    function indefArticle (tagList, language) {
        switch (language) {
        case 'nob':
            return indefArticle_nob[tagList[1]]
        case 'nno':
            return indefArticle_nno[tagList[1]]
        }
    }

    //

    var script = {
        name: 'inflectionRowNoun',
        props: ['paradigm','language', 'showGender'],
        data: function () {
            return {
                cells: [
                    this.showGender ? this.inflForm(['_gender']) : null, // special gender column
                    this.inflForm(['Sing','Ind'], this.indefArticle()),
                    this.inflForm(['Sing','Def']),
                    this.inflForm(['Plur','Ind']),
                    this.inflForm(['Plur','Def'])
                ].filter(r => r)
            }
        },
        computed: {
        },
        methods: {
            indefArticle: function () {
                return indefArticle(this.paradigm.tags, this.language)
            },
            inflForm: function (tagList,prefix) {
                let forms = inflectedForm(this.paradigm, tagList, []);
                if (forms) {
                    return [prefix, forms, tagList[0]=='_gender']
                } else {
                    return null
                }
            },
            tagToName: function (tag) {
                return tagToName(tag, this.language)
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            }
        }
    };

    function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
        if (typeof shadowMode !== 'boolean') {
            createInjectorSSR = createInjector;
            createInjector = shadowMode;
            shadowMode = false;
        }
        // Vue.extend constructor export interop.
        const options = typeof script === 'function' ? script.options : script;
        // render functions
        if (template && template.render) {
            options.render = template.render;
            options.staticRenderFns = template.staticRenderFns;
            options._compiled = true;
            // functional template
            if (isFunctionalTemplate) {
                options.functional = true;
            }
        }
        // scopedId
        if (scopeId) {
            options._scopeId = scopeId;
        }
        let hook;
        if (moduleIdentifier) {
            // server build
            hook = function (context) {
                // 2.3 injection
                context =
                    context || // cached call
                        (this.$vnode && this.$vnode.ssrContext) || // stateful
                        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
                // 2.2 with runInNewContext: true
                if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                    context = __VUE_SSR_CONTEXT__;
                }
                // inject component styles
                if (style) {
                    style.call(this, createInjectorSSR(context));
                }
                // register component module identifier for async chunk inference
                if (context && context._registeredComponents) {
                    context._registeredComponents.add(moduleIdentifier);
                }
            };
            // used by ssr in case component is cached and beforeCreate
            // never gets called
            options._ssrRegister = hook;
        }
        else if (style) {
            hook = shadowMode
                ? function (context) {
                    style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
                }
                : function (context) {
                    style.call(this, createInjector(context));
                };
        }
        if (hook) {
            if (options.functional) {
                // register for functional component in vue file
                const originalRender = options.render;
                options.render = function renderWithStyleInjection(h, context) {
                    hook.call(context);
                    return originalRender(h, context);
                };
            }
            else {
                // inject component registration as beforeCreate hook
                const existing = options.beforeCreate;
                options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
            }
        }
        return script;
    }

    /* script */
    const __vue_script__ = script;

    /* template */
    var __vue_render__ = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        _vm._l(_vm.cells, function(ref, index) {
          var prefix = ref[0];
          var ref_1 = ref[1];
          var rowspan = ref_1[0];
          var rowindex = ref_1[1];
          var forms = ref_1[2];
          var gender = ref[2];
          return _c(
            "td",
            {
              key: index,
              staticClass: "infl",
              class: gender ? "sub" : "",
              attrs: { rowspan: rowspan, index: rowindex },
              on: {
                mouseover: function($event) {
                  $event.stopPropagation();
                  return _vm.hiliteRow(rowindex)
                }
              }
            },
            _vm._l(forms, function(form, i) {
              return _c(
                "span",
                { key: i, staticClass: "comma" },
                [
                  _c("nobr", [
                    prefix
                      ? _c("span", { staticClass: "context" }, [
                          _vm._v(_vm._s(prefix))
                        ])
                      : _vm._e(),
                    _vm._v(
                      "\n        " + _vm._s(gender ? _vm.tagToName(form) : form)
                    )
                  ])
                ],
                1
              )
            }),
            0
          )
        }),
        0
      )
    };
    var __vue_staticRenderFns__ = [];
    __vue_render__._withStripped = true;

      /* style */
      const __vue_inject_styles__ = undefined;
      /* scoped */
      const __vue_scope_id__ = undefined;
      /* module identifier */
      const __vue_module_identifier__ = undefined;
      /* functional template */
      const __vue_is_functional_template__ = false;
      /* style inject */
      
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__ = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
        __vue_inject_styles__,
        __vue_script__,
        __vue_scope_id__,
        __vue_is_functional_template__,
        __vue_module_identifier__,
        false,
        undefined,
        undefined,
        undefined
      );

    //

    var script$1 = {
        name: 'inflectionRowAdj',
        props: ['paradigm','hasFem'],
        data: function () {
            return {
                rows: [ this.inflForm(['Pos',['Masc/Fem','Masc']]),
                        this.hasFem ? this.inflForm(['Pos','Fem']) : null,
                        this.inflForm(['Pos','Neuter']),
                        this.inflForm(['Pos','Def','Sing']),
                        this.inflForm(['Pos','Plur'])
                      ].filter(r => r)
            }
        },
        methods: {
            inflForm: function (tagList,exclTagList) {
                return inflectedForm(this.paradigm, tagList, exclTagList)
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            }
        }
    };

    /* script */
    const __vue_script__$1 = script$1;

    /* template */
    var __vue_render__$1 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        _vm._l(_vm.rows, function(ref, index) {
          var rowspan = ref[0];
          var rowindex = ref[1];
          var forms = ref[2];
          return _c(
            "td",
            {
              key: index,
              staticClass: "infl",
              class: _vm.$mq,
              attrs: { rowspan: rowspan, index: rowindex },
              on: {
                mouseover: function($event) {
                  $event.stopPropagation();
                  return _vm.hiliteRow(rowindex)
                }
              }
            },
            _vm._l(forms, function(form) {
              return _c("span", { key: form, staticClass: "comma" }, [
                _vm._v("\n      " + _vm._s(form))
              ])
            }),
            0
          )
        }),
        0
      )
    };
    var __vue_staticRenderFns__$1 = [];
    __vue_render__$1._withStripped = true;

      /* style */
      const __vue_inject_styles__$1 = undefined;
      /* scoped */
      const __vue_scope_id__$1 = undefined;
      /* module identifier */
      const __vue_module_identifier__$1 = undefined;
      /* functional template */
      const __vue_is_functional_template__$1 = false;
      /* style inject */
      
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
        __vue_inject_styles__$1,
        __vue_script__$1,
        __vue_scope_id__$1,
        __vue_is_functional_template__$1,
        __vue_module_identifier__$1,
        false,
        undefined,
        undefined,
        undefined
      );

    //

    var script$2 = {
        name: 'inflectionRowAdjDeg',
        props: ['paradigm'],
        data: function () {
            return {
                rows: [ this.inflForm(['Cmp']),
                        this.inflForm(['Sup','Ind']),
                        this.inflForm(['Sup','Def'])
                      ].filter(r => r)
                   }
        },
        methods: {
            inflForm: function (tagList,exclTagList) {
                return inflectedForm(this.paradigm, tagList, exclTagList)
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            }
        }
    };

    /* script */
    const __vue_script__$2 = script$2;

    /* template */
    var __vue_render__$2 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        _vm._l(_vm.rows, function(ref, index) {
          var rowspan = ref[0];
          var rowindex = ref[1];
          var forms = ref[2];
          return _c(
            "td",
            {
              key: index,
              staticClass: "infl",
              attrs: { rowspan: rowspan, index: rowindex },
              on: {
                mouseover: function($event) {
                  $event.stopPropagation();
                  return _vm.hiliteRow(rowindex)
                }
              }
            },
            _vm._l(forms, function(form) {
              return _c("span", { key: form, staticClass: "comma" }, [
                _vm._v("\n      " + _vm._s(form))
              ])
            }),
            0
          )
        }),
        0
      )
    };
    var __vue_staticRenderFns__$2 = [];
    __vue_render__$2._withStripped = true;

      /* style */
      const __vue_inject_styles__$2 = undefined;
      /* scoped */
      const __vue_scope_id__$2 = undefined;
      /* module identifier */
      const __vue_module_identifier__$2 = undefined;
      /* functional template */
      const __vue_is_functional_template__$2 = false;
      /* style inject */
      
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
        __vue_inject_styles__$2,
        __vue_script__$2,
        __vue_scope_id__$2,
        __vue_is_functional_template__$2,
        __vue_module_identifier__$2,
        false,
        undefined,
        undefined,
        undefined
      );

    //

    var script$3 = {
        name: 'inflectionRowVerb',
        props: ['paradigm','part'],
        data: function () {
            return {
                rows: [ !this.part || this.part==1 ? this.inflForm(['Inf'],['Pass'],'å') : null,
                        !this.part || this.part==1 ? this.inflForm(['Pres'],['Pass']) : null,
                        !this.part || this.part==1 ? this.inflForm(['Past']) : null,
                        !this.part || this.part==2 ? this.inflForm(['<PerfPart>'],['Adj'],'har') : null,
                        !this.part || this.part==2 ? this.inflForm(['Imp'],null,null,'!') : null
                      ].filter(r => r)
            }
        },
        methods: {
            inflForm: function (tagList,exclTagList,prefix,suffix) {
                let forms = inflectedForm(this.paradigm, tagList, exclTagList);
                if (forms) {
                    return [prefix, forms, suffix]
                } else {
                    return null
                }
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            }
        }
    };

    /* script */
    const __vue_script__$3 = script$3;

    /* template */
    var __vue_render__$3 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        _vm._l(_vm.rows, function(ref, index) {
          var prefix = ref[0];
          var ref_1 = ref[1];
          var rowspan = ref_1[0];
          var rowindex = ref_1[1];
          var forms = ref_1[2];
          var suffix = ref[2];
          return _c(
            "td",
            {
              key: index,
              staticClass: "infl",
              class: _vm.mq,
              attrs: { rowspan: rowspan, index: rowindex },
              on: {
                mouseover: function($event) {
                  $event.stopPropagation();
                  return _vm.hiliteRow(rowindex)
                }
              }
            },
            _vm._l(forms, function(form, index) {
              return _c(
                "span",
                { key: index, staticClass: "comma" },
                [
                  _c("nobr", [
                    prefix
                      ? _c("span", { staticClass: "context" }, [
                          _vm._v(_vm._s(prefix))
                        ])
                      : _vm._e(),
                    _vm._v("\n        " + _vm._s(form)),
                    suffix
                      ? _c("span", { staticClass: "context" }, [
                          _vm._v(_vm._s(suffix))
                        ])
                      : _vm._e()
                  ])
                ],
                1
              )
            }),
            0
          )
        }),
        0
      )
    };
    var __vue_staticRenderFns__$3 = [];
    __vue_render__$3._withStripped = true;

      /* style */
      const __vue_inject_styles__$3 = undefined;
      /* scoped */
      const __vue_scope_id__$3 = undefined;
      /* module identifier */
      const __vue_module_identifier__$3 = undefined;
      /* functional template */
      const __vue_is_functional_template__$3 = false;
      /* style inject */
      
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
        __vue_inject_styles__$3,
        __vue_script__$3,
        __vue_scope_id__$3,
        __vue_is_functional_template__$3,
        __vue_module_identifier__$3,
        false,
        undefined,
        undefined,
        undefined
      );

    //

    var script$4 = {
        name: 'inflectionRowParticiple',
        props: ['paradigm','hasPerfPart','language','part', 'mq'],
        data: function () {
            return { rows: [
                this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Masc/Fem'],
                                                 this.language == 'nob' ? 'en/ei' : 'ein/ei',
                                                 '+ substantiv') : null,
                this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Neuter'],
                                                 this.language == 'nob' ? 'et' : 'eit',
                                                 '+ substantiv') : null,
                this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Def'],'den/det', '+ substantiv') : null,
                this.hasPerfPart && this.part!=3 ? this.inflForm(['Adj','Plur'],null,'+ substantiv') : null,
                this.part!=3 ? this.inflForm(['Adj','<PresPart>']) : null
            ].filter(r => r) }
        },
        methods: {
            inflForm: function (tagList,prefix,suffix) {
                let forms = inflectedForm(this.paradigm, tagList);
                if (forms) {
                    return [prefix, forms, suffix]
                } else {
                    return null
                }
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            }
        }
    };

    const isOldIE = typeof navigator !== 'undefined' &&
        /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
    function createInjector(context) {
        return (id, style) => addStyle(id, style);
    }
    let HEAD;
    const styles = {};
    function addStyle(id, css) {
        const group = isOldIE ? css.media || 'default' : id;
        const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
        if (!style.ids.has(id)) {
            style.ids.add(id);
            let code = css.source;
            if (css.map) {
                // https://developer.chrome.com/devtools/docs/javascript-debugging
                // this makes source maps inside style tags work properly in Chrome
                code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
                // http://stackoverflow.com/a/26603875
                code +=
                    '\n/*# sourceMappingURL=data:application/json;base64,' +
                        btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                        ' */';
            }
            if (!style.element) {
                style.element = document.createElement('style');
                style.element.type = 'text/css';
                if (css.media)
                    style.element.setAttribute('media', css.media);
                if (HEAD === undefined) {
                    HEAD = document.head || document.getElementsByTagName('head')[0];
                }
                HEAD.appendChild(style.element);
            }
            if ('styleSheet' in style.element) {
                style.styles.push(code);
                style.element.styleSheet.cssText = style.styles
                    .filter(Boolean)
                    .join('\n');
            }
            else {
                const index = style.ids.size - 1;
                const textNode = document.createTextNode(code);
                const nodes = style.element.childNodes;
                if (nodes[index])
                    style.element.removeChild(nodes[index]);
                if (nodes.length)
                    style.element.insertBefore(textNode, nodes[index]);
                else
                    style.element.appendChild(textNode);
            }
        }
    }

    /* script */
    const __vue_script__$4 = script$4;

    /* template */
    var __vue_render__$4 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        _vm._l(_vm.rows, function(ref, index) {
          var prefix = ref[0];
          var ref_1 = ref[1];
          var rowspan = ref_1[0];
          var rowindex = ref_1[1];
          var forms = ref_1[2];
          var suffix = ref[2];
          return _c(
            "td",
            {
              key: index,
              staticClass: "infl",
              class: _vm.mq,
              attrs: { rowspan: rowspan, index: rowindex },
              on: {
                mouseover: function($event) {
                  $event.stopPropagation();
                  return _vm.hiliteRow(rowindex)
                }
              }
            },
            _vm._l(forms, function(form, index) {
              return _c(
                "span",
                { key: index, staticClass: "comma" },
                [
                  prefix
                    ? _c("span", { staticClass: "context" }, [
                        _vm._v(_vm._s(prefix))
                      ])
                    : _vm._e(),
                  _vm._v("\n      " + _vm._s(form) + "\n      "),
                  _c("nobr", [
                    suffix
                      ? _c("span", { staticClass: "context" }, [
                          _vm._v(_vm._s(suffix))
                        ])
                      : _vm._e()
                  ])
                ],
                1
              )
            }),
            0
          )
        }),
        0
      )
    };
    var __vue_staticRenderFns__$4 = [];
    __vue_render__$4._withStripped = true;

      /* style */
      const __vue_inject_styles__$4 = function (inject) {
        if (!inject) return
        inject("data-v-01b2922a_0", { source: "\nspan.context {\n    color: gray;\n}\n\n", map: {"version":3,"sources":["/home/fnsov/prosjekter/vue-inflection/src/components/inflectionRowParticiple.vue"],"names":[],"mappings":";AAkEA;IACA,WAAA;AACA","file":"inflectionRowParticiple.vue","sourcesContent":["<template>\n<tr>\n  <td class=\"infl\" :class=\"mq\"\n      v-for=\"([prefix, [rowspan,rowindex,forms], suffix], index) in rows\"\n      :key=\"index\"\n      :rowspan=\"rowspan\"\n      :index=\"rowindex\"\n      @mouseover.stop=\"hiliteRow(rowindex)\">\n    <span class='comma'\n          v-for=\"(form, index) in forms\"\n          :key=\"index\">\n      <span v-if=\"prefix\" class=\"context\">{{prefix}}</span>\n      {{form}}\n      <nobr>\n        <span v-if=\"suffix\" class=\"context\">{{suffix}}</span>\n      </nobr>\n    </span>\n  </td>\n\n</tr>\n</template>\n\n<script>\n\n// needed for hiliting\nimport $ from 'jquery'\n\nimport { inflectedForm\n       } from './mixins/ordbankUtils.js'\n\nexport default {\n    name: 'inflectionRowParticiple',\n    props: ['paradigm','hasPerfPart','language','part', 'mq'],\n    data: function () {\n        return { rows: [\n            this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Masc/Fem'],\n                                             this.language == 'nob' ? 'en/ei' : 'ein/ei',\n                                             '+ substantiv') : null,\n            this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Neuter'],\n                                             this.language == 'nob' ? 'et' : 'eit',\n                                             '+ substantiv') : null,\n            this.hasPerfPart && this.part!=4 ? this.inflForm(['Adj','Def'],'den/det', '+ substantiv') : null,\n            this.hasPerfPart && this.part!=3 ? this.inflForm(['Adj','Plur'],null,'+ substantiv') : null,\n            this.part!=3 ? this.inflForm(['Adj','<PresPart>']) : null\n        ].filter(r => r) }\n    },\n    methods: {\n        inflForm: function (tagList,prefix,suffix) {\n            let forms = inflectedForm(this.paradigm, tagList)\n            if (forms) {\n                return [prefix, forms, suffix]\n            } else {\n                return null\n            }\n        },\n        hiliteRow: function (rowindex) {\n            $('td[index]').removeClass('hilite')\n            rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'))\n        }\n    }\n}\n\n</script>\n\n<style>\n\nspan.context {\n    color: gray;\n}\n\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$4 = undefined;
      /* module identifier */
      const __vue_module_identifier__$4 = undefined;
      /* functional template */
      const __vue_is_functional_template__$4 = false;
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$4 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
        __vue_inject_styles__$4,
        __vue_script__$4,
        __vue_scope_id__$4,
        __vue_is_functional_template__$4,
        __vue_module_identifier__$4,
        false,
        createInjector,
        undefined,
        undefined
      );

    //

    var script$5 = {
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
                let forms = inflectedForm(paradigm, tagList, []);
                if (forms) {
                    return [prefix, forms]
                } else {
                    return null
                }
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            },
            tagToName: function (tag) {
                return tagToName(tag, this.language)
            }
        }
    };

    /* script */
    const __vue_script__$5 = script$5;

    /* template */
    var __vue_render__$5 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        [
          _vm.tags.tags
            ? [
                _c("td", { staticClass: "infl sub xs" }, [
                  _vm._v(
                    "\n      " + _vm._s(_vm.tagToName(_vm.tags.label)) + "\n    "
                  )
                ]),
                _vm._v(" "),
                _vm._l(_vm.cells, function(ref, index) {
                  var prefix = ref[0];
                  var ref_1 = ref[1];
                  var rowspan = ref_1[0];
                  var rowindex = ref_1[1];
                  var forms = ref_1[2];
                  return _c(
                    "td",
                    {
                      key: index,
                      staticClass: "infl xs",
                      class: _vm.tags.tags[0] == "_gender" ? "sub" : "",
                      attrs: { colspan: rowspan, index: rowindex },
                      on: {
                        mouseover: function($event) {
                          $event.stopPropagation();
                          return _vm.hiliteRow(rowindex)
                        }
                      }
                    },
                    _vm._l(forms, function(form, index) {
                      return _c("span", { key: index, staticClass: "comma" }, [
                        prefix
                          ? _c("span", { staticClass: "context" }, [
                              _vm._v(_vm._s(prefix))
                            ])
                          : _vm._e(),
                        _vm._v(
                          "\n        " +
                            _vm._s(
                              _vm.tags.tags[0] == "_gender"
                                ? _vm.tagToName(form)
                                : form
                            )
                        )
                      ])
                    }),
                    0
                  )
                })
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.tags.title
            ? [
                _c(
                  "td",
                  {
                    staticClass: "infl group",
                    attrs: { colspan: _vm.paradigms.length + 1 }
                  },
                  [
                    _vm._v(
                      "\n      " + _vm._s(_vm.tagToName(_vm.tags.title)) + "\n    "
                    )
                  ]
                )
              ]
            : _vm._e()
        ],
        2
      )
    };
    var __vue_staticRenderFns__$5 = [];
    __vue_render__$5._withStripped = true;

      /* style */
      const __vue_inject_styles__$5 = undefined;
      /* scoped */
      const __vue_scope_id__$5 = undefined;
      /* module identifier */
      const __vue_module_identifier__$5 = undefined;
      /* functional template */
      const __vue_is_functional_template__$5 = false;
      /* style inject */
      
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$5 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
        __vue_inject_styles__$5,
        __vue_script__$5,
        __vue_scope_id__$5,
        __vue_is_functional_template__$5,
        __vue_module_identifier__$5,
        false,
        undefined,
        undefined,
        undefined
      );

    //

    var script$6 = {
        name: 'inflectionRowsVerb',
        props: ['paradigms','tags','language'],
        data: function () {
            return {
                cells: !this.tags.title ?
                    this.paradigms.map(
                        p => this.inflForm(p,
                                           this.tags.tags,
                                           this.tags.excl,
                                           this.tags.prefix,
                                           this.tags.suffix))
                    .filter(r => r) :
                []
            }
        },
        computed: {
        },
        methods: {
            inflForm: function (paradigm, tagList, exclTagList, prefix, suffix) {
                let forms = inflectedForm(paradigm, tagList, exclTagList);
                if (forms) {
                    return [prefix, forms, suffix]
                } else {
                    return null
                }
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            },
            tagToName: function (tag) {
                return tagToName(tag, this.language) || tag
            }
        }
    };

    /* script */
    const __vue_script__$6 = script$6;

    /* template */
    var __vue_render__$6 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        [
          _vm.tags.tags
            ? [
                _c("td", { staticClass: "infl sub xs" }, [
                  _vm._v(
                    "\n      " + _vm._s(_vm.tagToName(_vm.tags.label)) + "\n    "
                  )
                ]),
                _vm._v(" "),
                _vm._l(_vm.cells, function(ref, index) {
                  var prefix = ref[0];
                  var ref_1 = ref[1];
                  var rowspan = ref_1[0];
                  var rowindex = ref_1[1];
                  var forms = ref_1[2];
                  var suffix = ref[2];
                  return _c(
                    "td",
                    {
                      key: index,
                      staticClass: "infl xs",
                      attrs: { colspan: rowspan, index: rowindex },
                      on: {
                        mouseover: function($event) {
                          $event.stopPropagation();
                          return _vm.hiliteRow(rowindex)
                        }
                      }
                    },
                    _vm._l(forms, function(form, index) {
                      return _c("span", { key: index, staticClass: "comma" }, [
                        prefix
                          ? _c("span", { staticClass: "context" }, [
                              _vm._v(_vm._s(prefix))
                            ])
                          : _vm._e(),
                        _vm._v("\n        " + _vm._s(form)),
                        suffix != "!" ? _c("span") : _vm._e(),
                        _vm._v(" "),
                        suffix
                          ? _c("span", { staticClass: "context nobr" }, [
                              _vm._v(_vm._s(suffix))
                            ])
                          : _vm._e()
                      ])
                    }),
                    0
                  )
                })
              ]
            : [
                _c(
                  "td",
                  {
                    staticClass: "infl group",
                    attrs: { colspan: _vm.paradigms.length + 1 }
                  },
                  [
                    _vm._v(
                      "\n      " + _vm._s(_vm.tagToName(_vm.tags.title)) + "\n    "
                    )
                  ]
                )
              ]
        ],
        2
      )
    };
    var __vue_staticRenderFns__$6 = [];
    __vue_render__$6._withStripped = true;

      /* style */
      const __vue_inject_styles__$6 = undefined;
      /* scoped */
      const __vue_scope_id__$6 = undefined;
      /* module identifier */
      const __vue_module_identifier__$6 = undefined;
      /* functional template */
      const __vue_is_functional_template__$6 = false;
      /* style inject */
      
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$6 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
        __vue_inject_styles__$6,
        __vue_script__$6,
        __vue_scope_id__$6,
        __vue_is_functional_template__$6,
        __vue_module_identifier__$6,
        false,
        undefined,
        undefined,
        undefined
      );

    //

    var script$7 = {
        name: 'inflectionRowsAdj',
        props: ['paradigms','tags','language'],
        data: function () {
            return {
                cells: !this.tags.title ?
                    this.paradigms.map(
                        p => this.inflForm(p,
                                           this.tags.tags,
                                           this.tags.excl))
                    .filter(r => r) :
                    []
            }
        },
        methods: {
            inflForm: function (paradigm, tagList, exclTagList) {
                return inflectedForm(paradigm, tagList, exclTagList)
            },
            hiliteRow: function (rowindex) {
                $('td[index]').removeClass('hilite');
                rowindex.forEach(i => $('td[index*='+ i + ']').addClass('hilite'));
            },
            tagToName: function (tag) {
                return tagToName(tag, this.language) || tag
            }
        }
    };

    /* script */
    const __vue_script__$7 = script$7;

    /* template */
    var __vue_render__$7 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "tr",
        [
          _vm.tags.tags && _vm.cells.length
            ? [
                _c("td", { staticClass: "infl sub xs" }, [
                  _vm._v(
                    "\n      " + _vm._s(_vm.tagToName(_vm.tags.label)) + "\n    "
                  )
                ]),
                _vm._v(" "),
                _vm._l(_vm.cells, function(ref, index) {
                  var rowspan = ref[0];
                  var rowindex = ref[1];
                  var forms = ref[2];
                  return _c(
                    "td",
                    {
                      key: index,
                      staticClass: "infl xs",
                      attrs: { colspan: rowspan, index: rowindex },
                      on: {
                        mouseover: function($event) {
                          $event.stopPropagation();
                          return _vm.hiliteRow(rowindex)
                        }
                      }
                    },
                    _vm._l(forms, function(form, index) {
                      return _c("span", { key: index, staticClass: "comma" }, [
                        _vm._v(_vm._s(form))
                      ])
                    }),
                    0
                  )
                })
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.tags.title
            ? [
                _c(
                  "td",
                  {
                    staticClass: "infl group",
                    attrs: { colspan: _vm.paradigms.length + 1 }
                  },
                  [
                    _vm._v(
                      "\n      " + _vm._s(_vm.tagToName(_vm.tags.title)) + "\n    "
                    )
                  ]
                )
              ]
            : _vm._e()
        ],
        2
      )
    };
    var __vue_staticRenderFns__$7 = [];
    __vue_render__$7._withStripped = true;

      /* style */
      const __vue_inject_styles__$7 = undefined;
      /* scoped */
      const __vue_scope_id__$7 = undefined;
      /* module identifier */
      const __vue_module_identifier__$7 = undefined;
      /* functional template */
      const __vue_is_functional_template__$7 = false;
      /* style inject */
      
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$7 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
        __vue_inject_styles__$7,
        __vue_script__$7,
        __vue_scope_id__$7,
        __vue_is_functional_template__$7,
        __vue_module_identifier__$7,
        false,
        undefined,
        undefined,
        undefined
      );

    //

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
                     };

    var script$8 = {
        name: 'inflectionTable',
        components: { inflectionRowNoun: __vue_component__,
                      inflectionRowAdj: __vue_component__$1,
                      inflectionRowAdjDeg: __vue_component__$2,
                      inflectionRowVerb: __vue_component__$3,
                      inflectionRowParticiple: __vue_component__$4,
                      // inflectionHead,
                      inflectionRowsNoun: __vue_component__$5,
                      inflectionRowsVerb: __vue_component__$6,
                      inflectionRowsAdj: __vue_component__$7
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
                this.getGender();
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
                                     infl => { let found = infl.word_form; // there are empty cells!
                                               tagList.forEach(tag =>
                                                               { if (!infl.tags.find(t => t == tag)) {
                                                                   found = false; }
                                                               });
                                               return found })));
                return !!info
            },
            // the paradigms that should be shown in the table
            // sort Masc < Fem < Neuter, then sort alphabetically by word_form (first elt if it is a list)
            getStandardParadigms: function () {
                if (this.paradigms) {
                    return this.paradigms
                }
                let paradigms = [];
                this.lemmaList && this.lemmaList.forEach(lemma =>
                                        paradigms = paradigms.concat(calculateStandardParadigms(lemma, this.edit)));
                if (!paradigms.length) {
                    return []
                }
                let isNoun = null;
                paradigms = paradigms.sort((p1,p2) => {
                    isNoun = p1.tags.find(t => t == 'NOUN');
                    let r1 = isNoun ? p1.inflection[1].word_form : p1.inflection[0].word_form;
                    let r2 = isNoun ? p2.inflection[1].word_form : p2.inflection[0].word_form;
                    let tags1 = p1.tags;
                    let tags2 = p2.tags;
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
                });
                let currentTags = paradigms[0].tags;
                let currentInfl = paradigms[0].inflection.map(infl => {
                    infl.rowspan = 0;
                    infl.index = [];
                    return infl });
                // merge equal cells by setting rowspan
                paradigms.forEach((p,index) => {
                    if (isNoun) {
                        let gender = p.tags[1];
                        if (!this.gender) {
                            this.gender = gender;
                        } else if (this.gender != gender) {
                            this.gender = '+';
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
                            currentInfl[i].index.push(index+1); // remember paradigm row, for hiliting
                            currentInfl[i].rowspan++;
                            p.inflection[i].rowspan = 0;
                        } else {
                            // let ind = currentInfl[i].index
                            currentInfl[i] = p.inflection[i];
                            currentInfl[i].index = [];
                            currentInfl[i].index.push(index+1); // remember paradigm row, for hiliting
                            currentInfl[i].rowspan = 1;
                        }
                    }
                });
                this.paradigms = paradigms;
                return paradigms
            },
            // OBSOLETE because of merging of equal cells
            // remove duplicate rows
            // if used: have to adjust rowspans
            removeDuplicates: function (paradigms, tagLists) {
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
                let paradigms = this.getStandardParadigms();
                let isNoun = paradigms[0].tags.find(t => t == 'NOUN');
                paradigms.forEach(p => {
                    if (isNoun) {
                        let gender = p.tags[1];
                        if (!this.gender) {
                            this.gender = gender;
                        } else if (this.gender != gender) {
                            this.gender = '+'; // more than one gender
                        }
                    }
                });
                return this.gender
            },
            unhiliteRows: function () {
                $('td[index]').removeClass('hilite');
            }
        }
    };

    /* script */
    const __vue_script__$8 = script$8;

    /* template */
    var __vue_render__$8 = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "div",
        {
          on: {
            mouseover: function($event) {
              return _vm.unhiliteRows()
            }
          }
        },
        [
          _c(
            "div",
            { staticStyle: { "overflow-y": "hidden" } },
            [
              _vm.lemma && _vm.lemma.word_class == "NOUN"
                ? [
                    _vm.mq != "xs"
                      ? _c(
                          "table",
                          {
                            directives: [
                              {
                                name: "show",
                                rawName: "v-show",
                                value: _vm.show || _vm.showTable,
                                expression: "show || showTable"
                              }
                            ],
                            staticClass: "infl rounded top",
                            class: _vm.mq
                          },
                          [
                            _c("tr", [
                              _c("th", { staticClass: "lemma xborder-lemma" }, [
                                _c("span", { staticClass: "infl-lemma" }, [
                                  _vm._v(_vm._s(_vm.lemma.lemma) + " ")
                                ]),
                                _vm._v(" "),
                                _c("span", { staticClass: "sub" }, [
                                  _vm._v(_vm._s(_vm.wordClass))
                                ]),
                                _vm._v(" "),
                                _vm.nounGender
                                  ? _c("span", { staticClass: "sub" }, [
                                      _vm._v(" " + _vm._s(_vm.nounGender))
                                    ])
                                  : _vm._e()
                              ])
                            ]),
                            _vm._v(" "),
                            _c("tr", [
                              _c("td", [
                                _c(
                                  "table",
                                  { staticClass: "infl rounded", class: _vm.mq },
                                  [
                                    _c("tr", [
                                      !_vm.nounGender
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-top-left",
                                              class: _vm.mq,
                                              attrs: { rowspan: "2" }
                                            },
                                            [_vm._v("kjønn")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nob"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder-top",
                                              class: _vm.mq,
                                              attrs: { colspan: "2" }
                                            },
                                            [_vm._v("entall")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nob"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder-top-right",
                                              class: _vm.mq,
                                              attrs: { colspan: "2" }
                                            },
                                            [_vm._v("flertall")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nno"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder-top",
                                              class: _vm.mq,
                                              attrs: { colspan: "2" }
                                            },
                                            [_vm._v("eintal")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nno"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder-top-right",
                                              class: _vm.mq,
                                              attrs: { colspan: "2" }
                                            },
                                            [_vm._v("fleirtal")]
                                          )
                                        : _vm._e()
                                    ]),
                                    _vm._v(" "),
                                    _c("tr", [
                                      _c(
                                        "th",
                                        {
                                          staticClass: "infl sub xborder-bottom",
                                          class: _vm.mq
                                        },
                                        [
                                          _vm._v("\n                ubestemt "),
                                          _vm.mq != "xs"
                                            ? _c("span", [_vm._v("form")])
                                            : _vm._e()
                                        ]
                                      ),
                                      _vm._v(" "),
                                      _c(
                                        "th",
                                        {
                                          staticClass: "infl sub xborder-bottom",
                                          class: _vm.mq
                                        },
                                        [
                                          _vm._v("\n                bestemt "),
                                          _vm.mq != "xs"
                                            ? _c("span", [_vm._v("form")])
                                            : _vm._e()
                                        ]
                                      ),
                                      _vm._v(" "),
                                      _c(
                                        "th",
                                        {
                                          staticClass: "infl sub xborder-bottom",
                                          class: _vm.mq
                                        },
                                        [
                                          _vm._v("\n                ubestemt "),
                                          _vm.mq != "xs"
                                            ? _c("span", [_vm._v("form")])
                                            : _vm._e()
                                        ]
                                      ),
                                      _vm._v(" "),
                                      _c(
                                        "th",
                                        {
                                          staticClass: "infl sub xborder-bottom",
                                          class: _vm.mq
                                        },
                                        [
                                          _vm._v("\n                bestemt "),
                                          _vm.mq != "xs"
                                            ? _c("span", [_vm._v("form")])
                                            : _vm._e()
                                        ]
                                      )
                                    ]),
                                    _vm._v(" "),
                                    _vm._l(_vm.standardParadigms, function(
                                      paradigm,
                                      index
                                    ) {
                                      return _c("inflectionRowNoun", {
                                        key: index,
                                        attrs: {
                                          showGender: !_vm.nounGender,
                                          language: _vm.language,
                                          paradigm: paradigm
                                        }
                                      })
                                    })
                                  ],
                                  2
                                )
                              ])
                            ])
                          ]
                        )
                      : _c(
                          "table",
                          {
                            directives: [
                              {
                                name: "show",
                                rawName: "v-show",
                                value: _vm.show || _vm.showTable,
                                expression: "show || showTable"
                              }
                            ],
                            staticClass: "infl rounded top",
                            class: _vm.mq,
                            staticStyle: { margin: "1em auto" }
                          },
                          [
                            _c("tr", [
                              _c("th", { staticClass: "lemma" }, [
                                _c("span", { staticClass: "infl-lemma" }, [
                                  _vm._v(_vm._s(_vm.lemma.lemma) + " ")
                                ]),
                                _vm._v(" "),
                                _c("span", { staticClass: "sub" }, [
                                  _vm._v(_vm._s(_vm.wordClass))
                                ]),
                                _vm._v(" "),
                                _vm.nounGender
                                  ? _c("span", { staticClass: "sub" }, [
                                      _vm._v(" " + _vm._s(_vm.nounGender))
                                    ])
                                  : _vm._e()
                              ])
                            ]),
                            _vm._v(" "),
                            _c("tr", [
                              _c("td", [
                                _c(
                                  "table",
                                  { staticClass: "infl", class: _vm.mq },
                                  _vm._l(_vm.inflTagsNoun, function(tags, index) {
                                    return _c("inflectionRowsNoun", {
                                      key: index,
                                      attrs: {
                                        tags: tags,
                                        language: _vm.language,
                                        paradigms: _vm.standardParadigms
                                      }
                                    })
                                  }),
                                  1
                                )
                              ])
                            ])
                          ]
                        )
                  ]
                : _vm._e(),
              _vm._v(" "),
              _vm.lemma && _vm.lemma.word_class == "VERB"
                ? [
                    _vm.mq != "xs"
                      ? _c(
                          "table",
                          {
                            directives: [
                              {
                                name: "show",
                                rawName: "v-show",
                                value: _vm.show || _vm.showTable,
                                expression: "show || showTable"
                              }
                            ],
                            staticClass: "infl rounded top",
                            class: _vm.mq
                          },
                          [
                            _c("tr", [
                              _c("th", { staticClass: "lemma xborder-lemma" }, [
                                _c("span", { staticClass: "infl-lemma" }, [
                                  _vm._v(_vm._s(_vm.lemma.lemma) + " ")
                                ]),
                                _vm._v(" "),
                                _c("span", { staticClass: "sub" }, [
                                  _vm._v(_vm._s(_vm.wordClass))
                                ])
                              ])
                            ]),
                            _vm._v(" "),
                            _vm._l(_vm.mq == "xs" ? [1, 2] : [0], function(i) {
                              return _c("tr", { key: i }, [
                                _c("td", [
                                  _c(
                                    "table",
                                    { staticClass: "infl rounded", class: _vm.mq },
                                    [
                                      _c("tr", [
                                        !i || i == 1
                                          ? _c(
                                              "th",
                                              {
                                                staticClass:
                                                  "infl xborder-top-left",
                                                class: _vm.mq
                                              },
                                              [_vm._v("infinitiv")]
                                            )
                                          : _vm._e(),
                                        _vm._v(" "),
                                        !i || i == 1
                                          ? _c(
                                              "th",
                                              {
                                                staticClass: "infl xborder-top",
                                                class: _vm.mq
                                              },
                                              [_vm._v("presens")]
                                            )
                                          : _vm._e(),
                                        _vm._v(" "),
                                        !i || i == 1
                                          ? _c(
                                              "th",
                                              {
                                                staticClass: "infl xborder-top",
                                                class: _vm.mq
                                              },
                                              [_vm._v("preteritum")]
                                            )
                                          : _vm._e(),
                                        _vm._v(" "),
                                        !i || i == 2
                                          ? _c(
                                              "th",
                                              {
                                                staticClass: "infl xborder-top",
                                                class: _vm.mq
                                              },
                                              [_vm._v("presens perfektum")]
                                            )
                                          : _vm._e(),
                                        _vm._v(" "),
                                        (!i || i == 2) && _vm.hasImp
                                          ? _c(
                                              "th",
                                              {
                                                staticClass:
                                                  "infl xborder-top-right",
                                                class: _vm.mq
                                              },
                                              [_vm._v("imperativ")]
                                            )
                                          : _vm._e()
                                      ]),
                                      _vm._v(" "),
                                      _vm._l(_vm.standardParadigmsVerb, function(
                                        paradigm,
                                        index
                                      ) {
                                        return _c("inflectionRowVerb", {
                                          key: index,
                                          attrs: {
                                            part: i,
                                            paradigm: paradigm,
                                            mq: _vm.mq
                                          }
                                        })
                                      })
                                    ],
                                    2
                                  )
                                ])
                              ])
                            }),
                            _vm._v(" "),
                            _vm._l(_vm.mq == "xs" ? [3, 4] : [-1], function(j) {
                              return _c("tr", { key: j }, [
                                _c("td", [
                                  _c(
                                    "table",
                                    { staticClass: "infl rounded", class: _vm.mq },
                                    [
                                      _vm.hasPerfPart
                                        ? [
                                            _c("tr", [
                                              _c(
                                                "th",
                                                {
                                                  staticClass:
                                                    "infl xborder-top-left",
                                                  class: _vm.mq,
                                                  attrs: {
                                                    colspan: _vm.hasPerfPartDef
                                                      ? j < 0
                                                        ? 4
                                                        : j == 3
                                                        ? 3
                                                        : 1
                                                      : 1
                                                  }
                                                },
                                                [_vm._v("perfektum partisipp")]
                                              ),
                                              _vm._v(" "),
                                              j < 0 || j == 4
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl xborder-top-right",
                                                      class: _vm.mq,
                                                      attrs: { rowspan: "2" }
                                                    },
                                                    [_vm._v("presens partisipp")]
                                                  )
                                                : _vm._e()
                                            ]),
                                            _vm._v(" "),
                                            _c("tr", [
                                              (j < 0 || j == 3) &&
                                              _vm.hasPerfPartDef &&
                                              _vm.language == "nob"
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl sub xborder-bottom",
                                                      class: _vm.mq
                                                    },
                                                    [_vm._v("han-/hunkjønn")]
                                                  )
                                                : _vm._e(),
                                              _vm._v(" "),
                                              (j < 0 || j == 3) &&
                                              _vm.hasPerfPartDef &&
                                              _vm.language == "nno"
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl sub xborder-bottom",
                                                      class: _vm.mq
                                                    },
                                                    [
                                                      _vm._v("hankjønn /"),
                                                      _c("br"),
                                                      _vm._v("hokjønn")
                                                    ]
                                                  )
                                                : _vm._e(),
                                              _vm._v(" "),
                                              (j < 0 || j == 3) &&
                                              _vm.language == "nob"
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl sub xborder-bottom",
                                                      class: _vm.mq
                                                    },
                                                    [_vm._v("intetkjønn")]
                                                  )
                                                : _vm._e(),
                                              _vm._v(" "),
                                              (j < 0 || j == 3) &&
                                              _vm.language == "nno"
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl sub xborder-bottom",
                                                      class: _vm.mq
                                                    },
                                                    [_vm._v("inkjekjønn")]
                                                  )
                                                : _vm._e(),
                                              _vm._v(" "),
                                              (j < 0 || j == 3) &&
                                              _vm.hasPerfPartDef
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl sub xborder-bottom",
                                                      class: _vm.mq
                                                    },
                                                    [_vm._v("bestemt form")]
                                                  )
                                                : _vm._e(),
                                              _vm._v(" "),
                                              (j < 0 || j == 4) &&
                                              _vm.hasPerfPartDef
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl sub xborder-bottom",
                                                      class: _vm.mq
                                                    },
                                                    [_vm._v("flertall")]
                                                  )
                                                : _vm._e()
                                            ])
                                          ]
                                        : [
                                            _c("tr", [
                                              j < 0 || j == 4
                                                ? _c(
                                                    "th",
                                                    {
                                                      staticClass:
                                                        "infl xborder-top",
                                                      class: _vm.mq
                                                    },
                                                    [_vm._v("presens partisipp")]
                                                  )
                                                : _vm._e()
                                            ])
                                          ],
                                      _vm._v(" "),
                                      _vm._l(_vm.standardParadigms, function(
                                        paradigm,
                                        index
                                      ) {
                                        return _c("inflectionRowParticiple", {
                                          key: index,
                                          attrs: {
                                            part: j,
                                            language: _vm.language,
                                            hasPerfPart: _vm.hasPerfPart,
                                            paradigm: paradigm,
                                            mq: _vm.mq
                                          }
                                        })
                                      })
                                    ],
                                    2
                                  )
                                ])
                              ])
                            })
                          ],
                          2
                        )
                      : _c(
                          "table",
                          {
                            directives: [
                              {
                                name: "show",
                                rawName: "v-show",
                                value: _vm.show || _vm.showTable,
                                expression: "show || showTable"
                              }
                            ],
                            staticClass: "infl rounded top",
                            class: _vm.mq,
                            staticStyle: { margin: "1em auto" }
                          },
                          [
                            _c("tr", [
                              _c("th", { staticClass: "lemma" }, [
                                _c("span", { staticClass: "infl-lemma" }, [
                                  _vm._v(_vm._s(_vm.lemma.lemma) + " ")
                                ]),
                                _vm._v(" "),
                                _c("span", { staticClass: "sub" }, [
                                  _vm._v(_vm._s(_vm.wordClass))
                                ])
                              ])
                            ]),
                            _vm._v(" "),
                            _c("tr", [
                              _c("td", [
                                _c(
                                  "table",
                                  { staticClass: "infl", class: _vm.mq },
                                  _vm._l(_vm.inflTagsVerb, function(tags, index) {
                                    return _c("inflectionRowsVerb", {
                                      key: index,
                                      attrs: {
                                        tags: tags,
                                        language: _vm.language,
                                        paradigms: _vm.standardParadigms
                                      }
                                    })
                                  }),
                                  1
                                )
                              ])
                            ])
                          ]
                        )
                  ]
                : _vm._e(),
              _vm._v(" "),
              _vm.lemma && _vm.lemma.word_class == "ADJ"
                ? [
                    _vm.mq != "xs"
                      ? _c(
                          "table",
                          {
                            directives: [
                              {
                                name: "show",
                                rawName: "v-show",
                                value: _vm.show || _vm.showTable,
                                expression: "show || showTable"
                              }
                            ],
                            staticClass: "infl rounded top",
                            class: _vm.mq
                          },
                          [
                            _c("tr", [
                              _c("th", { staticClass: "lemma xborder-lemma" }, [
                                _c("span", { staticClass: "infl-lemma" }, [
                                  _vm._v(_vm._s(_vm.lemma.lemma) + " ")
                                ]),
                                _vm._v(" "),
                                _c("span", { staticClass: "sub" }, [
                                  _vm._v(_vm._s(_vm.wordClass))
                                ])
                              ])
                            ]),
                            _vm._v(" "),
                            _c("tr", [
                              _c("td", [
                                _c(
                                  "table",
                                  { staticClass: "infl rounded", class: _vm.mq },
                                  [
                                    _c("tr", [
                                      _vm.language == "nob"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder-top-left",
                                              class: _vm.mq,
                                              attrs: { colspan: _vm.hasFem ? 4 : 3 }
                                            },
                                            [_vm._v("entall")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nob"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder-top-right",
                                              class: _vm.mq,
                                              attrs: { rowspan: "2" }
                                            },
                                            [_vm._v("flertall")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nno"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder-top",
                                              class: _vm.mq,
                                              attrs: { colspan: _vm.hasFem ? 4 : 3 }
                                            },
                                            [_vm._v("eintal")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nno"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass: "infl xborder",
                                              class: _vm.mq,
                                              attrs: { rowspan: "2" }
                                            },
                                            [_vm._v("fleirtal")]
                                          )
                                        : _vm._e()
                                    ]),
                                    _vm._v(" "),
                                    _c("tr", [
                                      _vm.hasFem
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-bottom",
                                              class: _vm.mq
                                            },
                                            [_vm._v("hankjønn")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      !_vm.hasFem && _vm.language == "nob"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-bottom",
                                              class: _vm.mq
                                            },
                                            [
                                              _c("nobr", [_vm._v("hankjønn /")]),
                                              _c("br"),
                                              _vm._v("hunkjønn")
                                            ],
                                            1
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      !_vm.hasFem && _vm.language == "nno"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-bottom",
                                              class: _vm.mq
                                            },
                                            [
                                              _c("nobr", [_vm._v("hankjønn /")]),
                                              _c("br"),
                                              _vm._v("hokjønn")
                                            ],
                                            1
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.hasFem && _vm.language == "nob"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-bottom",
                                              class: _vm.mq
                                            },
                                            [_vm._v("hunkjønn")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.hasFem && _vm.language == "nno"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-bottom",
                                              class: _vm.mq
                                            },
                                            [_vm._v("hokjønn")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nob"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-bottom",
                                              class: _vm.mq
                                            },
                                            [_vm._v("intetkjønn")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _vm.language == "nno"
                                        ? _c(
                                            "th",
                                            {
                                              staticClass:
                                                "infl sub xborder-bottom",
                                              class: _vm.mq
                                            },
                                            [_vm._v("inkjekjønn")]
                                          )
                                        : _vm._e(),
                                      _vm._v(" "),
                                      _c(
                                        "th",
                                        {
                                          staticClass: "infl sub xborder-bottom",
                                          class: _vm.mq
                                        },
                                        [_vm._v("bestemt form")]
                                      )
                                    ]),
                                    _vm._v(" "),
                                    _vm._l(_vm.standardParadigms, function(
                                      paradigm,
                                      index
                                    ) {
                                      return _c("inflectionRowAdj", {
                                        key: index,
                                        attrs: {
                                          hasDeg: _vm.hasDeg,
                                          hasFem: _vm.hasFem,
                                          paradigm: paradigm
                                        }
                                      })
                                    })
                                  ],
                                  2
                                )
                              ])
                            ]),
                            _vm._v(" "),
                            _vm.hasDeg
                              ? _c("tr", [
                                  _c("td", [
                                    _c(
                                      "table",
                                      {
                                        staticClass: "infl rounded",
                                        class: _vm.mq
                                      },
                                      [
                                        _c("tr", [
                                          _vm.hasDeg
                                            ? _c(
                                                "th",
                                                {
                                                  staticClass:
                                                    "infl xborder-top-left-right",
                                                  attrs: { colspan: "3" }
                                                },
                                                [_vm._v("gradbøying")]
                                              )
                                            : _vm._e()
                                        ]),
                                        _vm._v(" "),
                                        _vm._m(0),
                                        _vm._v(" "),
                                        _vm._l(
                                          _vm.standardParadigmsAdjDeg,
                                          function(paradigm, index) {
                                            return _c("inflectionRowAdjDeg", {
                                              key: index,
                                              attrs: { paradigm: paradigm }
                                            })
                                          }
                                        )
                                      ],
                                      2
                                    )
                                  ])
                                ])
                              : _vm._e()
                          ]
                        )
                      : _c(
                          "table",
                          {
                            directives: [
                              {
                                name: "show",
                                rawName: "v-show",
                                value: _vm.show || _vm.showTable,
                                expression: "show || showTable"
                              }
                            ],
                            staticClass: "infl rounded top",
                            class: _vm.mq,
                            staticStyle: { margin: "1em auto" }
                          },
                          [
                            _c("tr", [
                              _c("th", { staticClass: "lemma" }, [
                                _c("span", { staticClass: "infl-lemma" }, [
                                  _vm._v(_vm._s(_vm.lemma.lemma) + " ")
                                ]),
                                _vm._v(" "),
                                _c("span", { staticClass: "sub" }, [
                                  _vm._v(_vm._s(_vm.wordClass))
                                ])
                              ])
                            ]),
                            _vm._v(" "),
                            _c("tr", [
                              _c("td", [
                                _c(
                                  "table",
                                  { staticClass: "infl", class: _vm.mq },
                                  _vm._l(_vm.inflTagsAdj, function(tags, index) {
                                    return _c("inflectionRowsAdj", {
                                      key: index,
                                      attrs: {
                                        tags: tags,
                                        language: _vm.language,
                                        paradigms: _vm.standardParadigms
                                      }
                                    })
                                  }),
                                  1
                                )
                              ])
                            ])
                          ]
                        )
                  ]
                : _vm._e(),
              _vm._v(" "),
              _vm.lemma && _vm.isUninflected
                ? [
                    _c(
                      "table",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.show || _vm.showTable,
                            expression: "show || showTable"
                          }
                        ],
                        staticClass: "infl",
                        class: _vm.mq
                      },
                      [
                        _c("tr", [
                          _c("th", { staticClass: "lemma xborder-top" }, [
                            _c("span", { staticClass: "lemma" }, [
                              _vm._v(_vm._s(_vm.lemma.lemma) + " ")
                            ]),
                            _vm._v(" "),
                            _c("span", { staticClass: "sub" }, [
                              _vm._v(_vm._s(_vm.wordClass))
                            ])
                          ])
                        ]),
                        _vm._v(" "),
                        _c("tr", [
                          _c("td", [
                            _c("table", { staticClass: "infl", class: _vm.mq }, [
                              _vm._m(1),
                              _vm._v(" "),
                              _c("tr", [
                                _c("td", { staticClass: "infl xborder" }, [
                                  _vm._v(_vm._s(_vm.lemma.lemma))
                                ])
                              ])
                            ])
                          ])
                        ])
                      ]
                    )
                  ]
                : _vm._e()
            ],
            2
          )
        ]
      )
    };
    var __vue_staticRenderFns__$8 = [
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("tr", [
          _c("th", { staticClass: "infl xborder-bottom" }, [_vm._v("komparativ")]),
          _vm._v(" "),
          _c("th", { staticClass: "infl xborder-bottom" }, [
            _vm._v("superlativ"),
            _c("br"),
            _c("span", { staticClass: "sub" }, [_vm._v("ubestemt form")])
          ]),
          _vm._v(" "),
          _c("th", { staticClass: "infl xborder-bottom" }, [
            _vm._v("superlativ"),
            _c("br"),
            _c("span", { staticClass: "sub" }, [_vm._v("bestemt form")])
          ])
        ])
      },
      function() {
        var _vm = this;
        var _h = _vm.$createElement;
        var _c = _vm._self._c || _h;
        return _c("tr", [
          _c("th", { staticClass: "infl xborder" }, [_vm._v("ubøyelig")])
        ])
      }
    ];
    __vue_render__$8._withStripped = true;

      /* style */
      const __vue_inject_styles__$8 = function (inject) {
        if (!inject) return
        inject("data-v-35f32515_0", { source: "\ntable.infl {\n    /* border: 2px solid gray; */\n    margin: 1em;\n}\ntable.infl.rounded {\n    border-collapse: separate;\n    border-radius: 10px !important;\n    border-spacing: 0;\n    -moz-border-radius:6px !important;\n}\ntable.infl.rounded.top {\n    border: 2px solid gray;\n}\ntable.infl.xs {\n    margin: 0em;\n}\nth.infl {\n    border: 1px solid lightgray;\n    padding: .3em;\n    padding-left: .5em;\n    padding-right: .5em;\n    text-align: center;\n    vertical-align: top;\n    font-weight: normal;\n    font-style: italic;\n}\nth.infl.xs {\n    border: 1px solid lightgray;\n    padding: 0.2em;\n}\ntd.infl {\n    border: 1px solid lightgray;\n    padding: .3em;\n    padding-left: .5em;\n    padding-right: .5em;\n    font-weight: normal;\n    cursor: arrow\n}\ntd.infl.xs {\n    border-bottom: 1px solid lightgray;\n    border-left: 1px solid lightgray;\n    border-top: 0;\n    border-right: 0;\n    /* font-style: italic;  !! */\n    /* font-weight: normal; !! */\n    text-align: center;\n    padding: .3em;\n}\ntd.infl.sub.xs {\n    border-bottom: 0 /* 1px solid lightgray*/;\n    border-left: 0;\n    /* font-style: normal; !! */\n    text-align: center;\n    padding: .3em;\n    /* font-size: smaller */\n}\ntd.hilite {\n    background: lightgray\n}\ntd.group {\n    border-top: 1px solid lightgray;\n    border-bottom: 0;\n    border-right: 0;\n    border-left: 0;\n    background-color:  #faf1f0; /* #f7e1ea; */\n    text-align: center;\n    padding-left: 1em;\n    /* font-weight: bold; */\n    font-style: italic; /* !! */\n}\nth.lemma {\n    padding: .5em;\n    padding-bottom: 0.5em;\n    text-align: center\n}\nspan.infl-lemma {\n    font-weight: bold;\n    color: #560027;\n    font-size: larger\n}\nspan.word_class {\n    font-size: smaller\n}\nspan.word_form {\n    font-weight: bold\n}\n.sub {\n    font-style: italic;\n    font-weight: normal\n}\n.xborder {\n    border: 1px solid gray\n}\n.xborder-top {\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n.xborder-top-right {\n    border-top-right-radius: 10px !important;\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n.xborder-top-left {\n    border-top-left-radius: 10px !important;\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n.xborder-top-left-right {\n    border-top-left-radius: 10px !important;\n    border-top-right-radius: 10px !important;\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n.xborder-lemma {\n    border-top-left-radius: 10px !important;\n    border-top-right-radius: 10px !important;\n    border-spacing: 0;\n}\n.xborder-bottom {\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-bottom: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\nspan.comma:empty {\n    display: none;\n}\nspan.comma:not(:first-child):before {\n    content: \", \";\n}\ndiv.comma:not(:last-child):after {\n    content: \", \";\n}\n", map: {"version":3,"sources":["/home/fnsov/prosjekter/vue-inflection/src/components/inflectionTable.vue"],"names":[],"mappings":";AA6iBA;IACA,4BAAA;IACA,WAAA;AACA;AAEA;IACA,yBAAA;IACA,8BAAA;IACA,iBAAA;IACA,iCAAA;AACA;AAEA;IACA,sBAAA;AACA;AAEA;IACA,WAAA;AACA;AAEA;IACA,2BAAA;IACA,aAAA;IACA,kBAAA;IACA,mBAAA;IACA,kBAAA;IACA,mBAAA;IACA,mBAAA;IACA,kBAAA;AACA;AAEA;IACA,2BAAA;IACA,cAAA;AACA;AAEA;IACA,2BAAA;IACA,aAAA;IACA,kBAAA;IACA,mBAAA;IACA,mBAAA;IACA;AACA;AAEA;IACA,kCAAA;IACA,gCAAA;IACA,aAAA;IACA,eAAA;IACA,4BAAA;IACA,4BAAA;IACA,kBAAA;IACA,aAAA;AACA;AAEA;IACA,yCAAA;IACA,cAAA;IACA,2BAAA;IACA,kBAAA;IACA,aAAA;IACA,uBAAA;AACA;AAEA;IACA;AACA;AAEA;IACA,+BAAA;IACA,gBAAA;IACA,eAAA;IACA,cAAA;IACA,0BAAA,EAAA,aAAA;IACA,kBAAA;IACA,iBAAA;IACA,uBAAA;IACA,kBAAA,EAAA,OAAA;AACA;AAEA;IACA,aAAA;IACA,qBAAA;IACA;AACA;AACA;IACA,iBAAA;IACA,cAAA;IACA;AACA;AACA;IACA;AACA;AACA;IACA;AACA;AAEA;IACA,kBAAA;IACA;AACA;AAEA;IACA;AACA;AACA;IACA,iBAAA;IACA,yBAAA;IACA,+BAAA;IACA;;kCAEA;AACA;AACA;IACA,wCAAA;IACA,iBAAA;IACA,yBAAA;IACA,+BAAA;IACA;;kCAEA;AACA;AACA;IACA,uCAAA;IACA,iBAAA;IACA,yBAAA;IACA,+BAAA;IACA;;kCAEA;AACA;AACA;IACA,uCAAA;IACA,wCAAA;IACA,iBAAA;IACA,yBAAA;IACA,+BAAA;IACA;;kCAEA;AACA;AAEA;IACA,uCAAA;IACA,wCAAA;IACA,iBAAA;AACA;AAEA;IACA,yBAAA;IACA,+BAAA;IACA;;kCAEA;AACA;AAEA;IACA,aAAA;AACA;AAEA;IACA,aAAA;AACA;AAEA;IACA,aAAA;AACA","file":"inflectionTable.vue","sourcesContent":["<template>\n<div @mouseover=\"unhiliteRows()\">\n  <div style=\"overflow-y: hidden\">\n  <template v-if=\"lemma && lemma.word_class=='NOUN'\">\n    <table v-if=\"mq!='xs'\"\n           class=\"infl rounded top\"\n           :class=\"mq\"\n           v-show=\"show || showTable\">\n      <tr>\n        <th class=\"lemma xborder-lemma\">\n          <span class=\"infl-lemma\">{{lemma.lemma}} </span>\n          <span class=\"sub\">{{wordClass}}</span>\n          <span class=\"sub\" v-if=\"nounGender\"> {{nounGender}}</span>\n        </th>\n      </tr>\n      <tr>\n        <td>\n          <table class=\"infl rounded\" :class=\"mq\">\n            <tr>\n              <th class=\"infl sub xborder-top-left\" :class=\"mq\"\n                  v-if=\"!nounGender\"\n                  rowspan='2'>kjønn</th>\n              <th class=\"infl xborder-top\" :class=\"mq\" v-if=\"language=='nob'\" colspan='2'>entall</th>\n              <th class=\"infl xborder-top-right\" :class=\"mq\" v-if=\"language=='nob'\" colspan='2'>flertall</th>\n              <th class=\"infl xborder-top\" :class=\"mq\" v-if=\"language=='nno'\" colspan='2'>eintal</th>\n              <th class=\"infl xborder-top-right\" :class=\"mq\" v-if=\"language=='nno'\" colspan='2'>fleirtal</th>\n            </tr>\n            <tr>\n              <th class=\"infl sub xborder-bottom\" :class=\"mq\">\n                ubestemt <span v-if=\"mq!='xs'\">form</span>\n              </th>\n              <th class=\"infl sub xborder-bottom\" :class=\"mq\">\n                bestemt <span v-if=\"mq!='xs'\">form</span>\n              </th>\n              <th class=\"infl sub xborder-bottom\" :class=\"mq\">\n                ubestemt <span v-if=\"mq!='xs'\">form</span>\n              </th>\n              <th class=\"infl sub xborder-bottom\" :class=\"mq\">\n                bestemt <span v-if=\"mq!='xs'\">form</span>\n              </th>\n            </tr>\n            <inflectionRowNoun v-for=\"(paradigm, index) in standardParadigms\"\n                               :key=\"index\"\n                               :showGender=\"!nounGender\"\n                               :language=\"language\"\n                               :paradigm=\"paradigm\"/>\n          </table>\n        </td>\n      </tr>\n    </table>\n    <table v-else style=\"margin: 1em auto\"\n      class=\"infl rounded top\" :class=\"mq\" v-show=\"show || showTable\">\n      <tr>\n        <th class=\"lemma\">\n          <span class=\"infl-lemma\">{{lemma.lemma}} </span>\n          <span class=\"sub\">{{wordClass}}</span>\n          <span class=\"sub\" v-if=\"nounGender\"> {{nounGender}}</span>\n        </th>\n      </tr>\n      <tr>\n        <td>\n          <table class=\"infl\" :class=\"mq\">\n            <inflectionRowsNoun v-for=\"(tags, index) in inflTagsNoun\"\n                                :key=\"index\"\n                                :tags=\"tags\"\n                                :language=\"language\"\n                                :paradigms=\"standardParadigms\"/>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </template>\n  <template v-if=\"lemma && lemma.word_class=='VERB'\">\n    <table v-if=\"mq!='xs'\"\n           class=\"infl rounded top\" :class=\"mq\" v-show=\"show || showTable\">\n      <tr>\n        <th class=\"lemma xborder-lemma\">\n          <span class=\"infl-lemma\">{{lemma.lemma}} </span>\n          <span class=\"sub\">{{wordClass}}</span>\n        </th>\n      </tr>\n      <tr v-for=\"i in mq=='xs' ? [1,2] : [0]\" :key=\"i\">\n        <td>\n          <table class=\"infl rounded\" :class=\"mq\">\n            <tr>\n              <th v-if=\"!i || i==1\" class=\"infl xborder-top-left\" :class=\"mq\">infinitiv</th>\n              <th v-if=\"!i || i==1\" class=\"infl xborder-top\" :class=\"mq\">presens</th>\n              <th v-if=\"!i || i==1\" class=\"infl xborder-top\" :class=\"mq\">preteritum</th>\n              <th v-if=\"!i || i==2\" class=\"infl xborder-top\" :class=\"mq\">presens perfektum</th>\n              <th v-if=\"(!i || i==2) && hasImp\" class=\"infl xborder-top-right\" :class=\"mq\">imperativ</th>\n            </tr>\n            <inflectionRowVerb v-for=\"(paradigm, index) in standardParadigmsVerb\"\n                               :key=\"index\"\n                               :part=\"i\"\n                               :paradigm=\"paradigm\"\n                               :mq=\"mq\"/>\n          </table>\n        </td>\n      </tr>\n      <tr v-for=\"j in mq=='xs' ? [3,4] : [-1]\" :key=\"j\">\n        <td>\n          <table class=\"infl rounded\" :class=\"mq\">\n            <template v-if=\"hasPerfPart\">\n              <tr>\n                <th class=\"infl xborder-top-left\" :class=\"mq\"\n                    :colspan=\"hasPerfPartDef ? (j<0?4:(j==3?3:1)) : 1\">perfektum partisipp</th>\n                <th v-if=\"j<0 || j==4\"\n                    class=\"infl xborder-top-right\" :class=\"mq\"\n                    rowspan=\"2\">presens partisipp</th>\n              </tr>\n              <tr>\n                <th v-if=\"(j<0 || j==3) && hasPerfPartDef && language=='nob'\"\n                    class=\"infl sub xborder-bottom\" :class=\"mq\">han-/hunkjønn</th>\n                <th v-if=\"(j<0 || j==3) && hasPerfPartDef && language=='nno'\"\n                    class=\"infl sub xborder-bottom\" :class=\"mq\">hankjønn /<br/>hokjønn</th>\n                <th class=\"infl sub xborder-bottom\" :class=\"mq\"\n                    v-if=\"(j<0 || j==3) && language=='nob'\">intetkjønn</th>\n                <th class=\"infl sub xborder-bottom\" :class=\"mq\"\n                    v-if=\"(j<0 || j==3) && language=='nno'\">inkjekjønn</th>\n                <th v-if=\"(j<0 || j==3) && hasPerfPartDef\"\n                    class=\"infl sub xborder-bottom\" :class=\"mq\">bestemt form</th>\n                <th v-if=\"(j<0 || j==4) && hasPerfPartDef\"\n                    class=\"infl sub xborder-bottom\" :class=\"mq\">flertall</th>\n              </tr>\n            </template>\n            <template v-else>\n              <tr>\n                <th v-if=\"j<0 || j==4\"\n                    class=\"infl xborder-top\" :class=\"mq\">presens partisipp</th>\n              </tr>\n            </template>\n            <inflectionRowParticiple v-for=\"(paradigm, index) in standardParadigms\"\n                                     :key=\"index\"\n                                     :part=\"j\"\n                                     :language=\"language\"\n                                     :hasPerfPart=\"hasPerfPart\"\n                                     :paradigm=\"paradigm\"\n                                     :mq=\"mq\"/>\n          </table>\n        </td>\n      </tr>\n    </table>\n    <table v-else style=\"margin: 1em auto\"\n      class=\"infl rounded top\" :class=\"mq\" v-show=\"show || showTable\">\n      <tr>\n        <th class=\"lemma\">\n          <span class=\"infl-lemma\">{{lemma.lemma}} </span>\n          <span class=\"sub\">{{wordClass}}</span>\n        </th>\n      </tr>\n      <tr>\n        <td>\n          <table class=\"infl\" :class=\"mq\" >\n            <inflectionRowsVerb v-for=\"(tags, index) in inflTagsVerb\"\n                                :key=\"index\"\n                                :tags=\"tags\"\n                                :language=\"language\"\n                                :paradigms=\"standardParadigms\"/>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </template>\n  <template v-if=\"lemma && lemma.word_class=='ADJ'\">\n    <table v-if=\"mq!='xs'\"\n           class=\"infl rounded top\"\n           :class=\"mq\"\n           v-show=\"show || showTable\">\n      <tr>\n        <th class=\"lemma xborder-lemma\">\n          <span class=\"infl-lemma\">{{lemma.lemma}} </span>\n          <span class=\"sub\">{{wordClass}}</span>\n        </th>\n      </tr>\n      <tr>\n        <td>\n          <table class=\"infl rounded\" :class=\"mq\">\n            <tr>\n              <th class=\"infl xborder-top-left\" :class=\"mq\"\n                  v-if=\"language=='nob'\" :colspan=\"hasFem ? 4 : 3\">entall</th>\n              <th class=\"infl xborder-top-right\" :class=\"mq\"\n                  v-if=\"language=='nob'\" rowspan=\"2\">flertall</th>\n              <th class=\"infl xborder-top\" :class=\"mq\"\n                  v-if=\"language=='nno'\" :colspan=\"hasFem ? 4 : 3\">eintal</th>\n              <th class=\"infl xborder\" :class=\"mq\"\n                  v-if=\"language=='nno'\" rowspan=\"2\">fleirtal</th>\n            </tr>\n            <tr>\n              <th v-if=\"hasFem\" class=\"infl sub xborder-bottom\" :class=\"mq\">hankjønn</th>\n              <th v-if=\"!hasFem && language=='nob'\"\n                  class=\"infl sub xborder-bottom\" :class=\"mq\"><nobr>hankjønn /</nobr><br/>hunkjønn</th>\n              <th v-if=\"!hasFem && language=='nno'\"\n                  class=\"infl sub xborder-bottom\" :class=\"mq\"><nobr>hankjønn /</nobr><br/>hokjønn</th>\n              <th v-if=\"hasFem && language=='nob'\"\n                  class=\"infl sub xborder-bottom\" :class=\"mq\">hunkjønn</th>\n              <th v-if=\"hasFem && language=='nno'\"\n                  class=\"infl sub xborder-bottom\" :class=\"mq\">hokjønn</th>\n              <th class=\"infl sub xborder-bottom\" :class=\"mq\" v-if=\"language=='nob'\">intetkjønn</th>\n              <th class=\"infl sub xborder-bottom\" :class=\"mq\" v-if=\"language=='nno'\">inkjekjønn</th>\n              <th class=\"infl sub xborder-bottom\" :class=\"mq\">bestemt form</th>\n            </tr>\n            <inflectionRowAdj v-for=\"(paradigm, index) in standardParadigms\"\n                              :key=\"index\"\n                              :hasDeg=\"hasDeg\"\n                              :hasFem=\"hasFem\"\n                              :paradigm=\"paradigm\"/>\n          </table>\n        </td>\n      </tr>\n      <tr v-if=\"hasDeg\">\n        <td>\n          <table class=\"infl rounded\" :class=\"mq\">\n            <tr>\n              <th class=\"infl xborder-top-left-right\" v-if=\"hasDeg\" colspan=\"3\">gradbøying</th>\n            </tr>\n            <tr>\n              <th class=\"infl xborder-bottom\">komparativ</th>\n              <th class=\"infl xborder-bottom\">superlativ<br/><span class=\"sub\">ubestemt form</span></th>\n              <th class=\"infl xborder-bottom\">superlativ<br/><span class=\"sub\">bestemt form</span></th>\n            </tr>\n            <inflectionRowAdjDeg v-for=\"(paradigm, index) in standardParadigmsAdjDeg\"\n                                 :key=\"index\"\n                                 :paradigm=\"paradigm\"/>\n          </table>\n        </td>\n      </tr>\n    </table>\n    <table v-else style=\"margin: 1em auto\"\n      class=\"infl rounded top\" :class=\"mq\" v-show=\"show || showTable\">\n      <tr>\n        <th class=\"lemma\">\n          <span class=\"infl-lemma\">{{lemma.lemma}} </span>\n          <span class=\"sub\">{{wordClass}}</span>\n        </th>\n      </tr>\n      <tr>\n        <td>\n          <table class=\"infl\" :class=\"mq\" >\n            <inflectionRowsAdj v-for=\"(tags, index) in inflTagsAdj\"\n                               :key=\"index\"\n                               :tags=\"tags\"\n                               :language=\"language\"\n                               :paradigms=\"standardParadigms\" />\n          </table>\n        </td>\n      </tr>\n    </table>\n  </template>\n  <template v-if=\"lemma && isUninflected\">\n    <table class=\"infl\" :class=\"mq\" v-show=\"show || showTable\">\n      <tr>\n        <th class=\"lemma xborder-top\">\n          <span class=\"lemma\">{{lemma.lemma}} </span>\n          <span class=\"sub\">{{wordClass}}</span></th>\n      </tr>\n      <tr>\n        <td>\n          <table class=\"infl\" :class=\"mq\">\n            <tr>\n              <th class=\"infl xborder\">ubøyelig</th>\n            </tr>\n            <tr>\n              <td class=\"infl xborder\">{{lemma.lemma}}</td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </template>\n  </div>\n</div>\n</template>\n\n<script>\n\nimport $ from 'jquery'\n\nimport inflectionRowNoun from './inflectionRowNoun.vue'\nimport inflectionRowAdj from './inflectionRowAdj.vue'\nimport inflectionRowAdjDeg from './inflectionRowAdjDeg.vue'\nimport inflectionRowVerb from './inflectionRowVerb.vue'\nimport inflectionRowParticiple from './inflectionRowParticiple.vue'\n\n// import inflectionHead from './inflectionHead.vue'\nimport inflectionRowsNoun from './inflectionRowsNoun.vue'\nimport inflectionRowsVerb from './inflectionRowsVerb.vue'\nimport inflectionRowsAdj from './inflectionRowsAdj.vue'\n\n\nimport { calculateStandardParadigms, // compareParadigms,\n         word_formsEqual, hasTags, tagToName\n       } from './mixins/ordbankUtils.js'\n\nconst posNames = { NOUN: \"substantiv\",\n                   VERB: \"verb\",\n                   ADJ: \"adjektiv\",\n                   ADV: \"adverb\",\n                   ADP: \"preposisjon\",\n                   INTJ: \"interjeksjon\",\n                   DET: \"determinativ\",\n                   PRON: \"pronomen\",\n                   CCONJ: \"konjunksjon\",\n                   SCONJ: \"subjunksjon\",\n                   SYM: \"symbol\",\n                   INFM: \"infinitivsmerke\"\n                 }\n\nexport default {\n    name: 'inflectionTable',\n    components: { inflectionRowNoun,\n                  inflectionRowAdj,\n                  inflectionRowAdjDeg,\n                  inflectionRowVerb,\n                  inflectionRowParticiple,\n                  // inflectionHead,\n                  inflectionRowsNoun,\n                  inflectionRowsVerb,\n                  inflectionRowsAdj\n                },\n    props: ['lemmaList','showTable','inline', 'mq'],\n    data: function () {\n        return { wordClass: posNames[this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .word_class] || this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .word_class,\n                 language: this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .language,\n                 hasFem: this.hasInflForm(['Pos','Fem']),\n                 hasDeg: this.hasInflForm(['Cmp']),\n                 hasPerfPart: this.hasInflForm(['Adj','<PerfPart>']),\n                 hasPerfPartDef: this.hasInflForm(['Adj','<PerfPart>','Def']),\n                 hasImp: this.hasInflForm(['Imp']),\n                 isUninflected: !['NOUN','ADJ','VERB'].find(wc=>wc==this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .word_class),\n                 // genderList:\n                 show: true,\n                 lemma: this.lemmaList && this.lemmaList[0] ,\n                 paradigms: null,\n                 gender: null, // gender if NOUN and only one gender\n                 inflTagsNounG: [ { tags: ['_gender'] }, // fixme: aspekt\n                                  { title: 'Sing' },\n                                  { label: 'Ind', tags: ['Sing','Ind'], indefArt: true },\n                                  { label: 'Def', tags: ['Sing','Def']},\n                                  { title: 'Plur'},\n                                  { label: 'Ind', tags: ['Plur','Ind']},\n                                  { label: 'Def', tags: ['Plur','Def']}],\n                 inflTagsNounNG: [{ title: 'Sing' },\n                                  { label: 'Ind', tags: ['Sing','Ind'], indefArt: true },\n                                  { label: 'Def', tags: ['Sing','Def']},\n                                  { title: 'Plur'},\n                                  { label: 'Ind', tags: ['Plur','Ind']},\n                                  { label: 'Def', tags: ['Plur','Def']}],\n                 inflTagsAdj: [ { title: 'Sing' },\n                                { label: 'MascFem', tags: ['Pos',['Masc/Fem','Masc']] },\n                                { label: 'Fem', tags: ['Pos','Fem'] },\n                                { label: 'Neuter', tags: ['Pos','Neuter']},\n                                { label: 'Def', tags: ['Pos','Def','Sing']},\n                                { title: 'Plur'},\n                                { tags: ['Pos','Plur']},\n                                { title: 'Deg'},\n                                { label: 'Cmp', tags: ['Cmp']},\n                                { label: 'SupInd', tags: ['Sup','Ind']},\n                                { label: 'SupDef', tags: ['Sup','Def']}\n                              ],\n                 inflTagsVerbOld: [{ label: 'Inf', tags: ['Inf'], excl: ['Pass'], prefix: 'å' },\n                                { label: 'Pres', tags: ['Pres'], excl: ['Pass'] },\n                                { label: 'Past', tags: ['Past'] },\n                                { label: 'PresPerf', tags: ['<PerfPart>'], excl: ['Adj'], prefix: 'har' },\n                                { label: 'Imp', tags: ['Imp'], suffix: '!' },\n                                { title: 'PerfPart' },\n                                { label: 'MascFem', tags: ['Adj','Masc/Fem'],\n                                  prefix: this.language == 'nob' ? 'en/ei' : 'ein/ei',\n                                  suffix: ' + subst.'},\n                                { label: 'Neuter', tags: ['Adj','Neuter'],\n                                  prefix: this.language == 'nob' ? 'et' : 'eit',\n                                  suffix: ' + subst.'},\n                                { label: 'Def', tags: ['Adj','Def'],\n                                  prefix: 'den/det',\n                                  suffix: ' + subst.'},\n                                { label: 'Plur', tags: ['Adj','Plur'],\n                                  suffix: ' + subst.'},\n                                { title: 'PresPart' },\n                                { tags: ['Adj','<PresPart>'] },\n\n                               ],\n                 inflTagsVerb: [{ label: 'Inf', tags: ['Inf'], excl: ['Pass'], prefix: 'å' },\n                                { label: 'Pres', tags: ['Pres'], excl: ['Pass'] },\n                                { label: 'Past', tags: ['Past'] },\n                                { label: 'PresPerf', tags: ['<PerfPart>'], excl: ['Adj'], prefix: 'har' },\n                                { label: 'Imp', tags: ['Imp'], suffix: '!' },\n                                { title: 'PerfPart' },\n                                { label: 'MascFem', tags: ['Adj','Masc/Fem']},\n                                { label: 'Def', tags: ['Adj','Def']},\n                                { label: 'Plur', tags: ['Adj','Plur']},\n                                { title: 'PresPart' },\n                                { tags: ['Adj','<PresPart>'] },\n\n                               ]\n               }\n    },\n    computed: {\n        // the paradigms that should be shown in the table\n        standardParadigms: function () {\n            return this.getStandardParadigms()\n        },\n        standardParadigmsVerb: function () {\n            return this.removeDuplicates(this.getStandardParadigms(),\n                                         [['Inf'],['Pres'],['Past'],['<PerfPart>'],['Imp']])\n        },\n        standardParadigmsAdjDeg: function () {\n            return this.removeDuplicates(this.getStandardParadigms(),\n                                         [['Cmp'],['Sup']])\n        },\n        inflTagsNoun: function () {\n            return this.getGender() == '+' ? this.inflTagsNounG : this.inflTagsNounNG\n        },\n        nounGender: function () {\n            this.getGender()\n            return !this.gender || this.gender=='+' ? null : tagToName(this.gender,this.language)\n        },\n        edit: function () {\n            return this.lemma.mode == 'edit' || this.lemma.mode == 'new'\n        }\n    },\n    methods: {\n        hasInflForm: function (tagList) {\n            let info = this.lemmaList && this.lemmaList[0] && this.lemmaList[0] .paradigm_info && this.lemmaList[0] .paradigm_info.find(\n                paradigm => (paradigm.standardisation == 'STANDARD' &&\n                             !paradigm.to &&\n                             paradigm.inflection.find(\n                                 infl => { let found = infl.word_form // there are empty cells!\n                                           tagList.forEach(tag =>\n                                                           { if (!infl.tags.find(t => t == tag)) {\n                                                               found = false }\n                                                           })\n                                           return found })))\n            return !!info\n        },\n        // the paradigms that should be shown in the table\n        // sort Masc < Fem < Neuter, then sort alphabetically by word_form (first elt if it is a list)\n        getStandardParadigms: function () {\n            if (this.paradigms) {\n                return this.paradigms\n            }\n            let paradigms = []\n            this.lemmaList && this.lemmaList.forEach(lemma =>\n                                    paradigms = paradigms.concat(calculateStandardParadigms(lemma, this.edit)))\n            if (!paradigms.length) {\n                return []\n            }\n            let isNoun = null\n            paradigms = paradigms.sort((p1,p2) => {\n                isNoun = p1.tags.find(t => t == 'NOUN')\n                let r1 = isNoun ? p1.inflection[1].word_form : p1.inflection[0].word_form\n                let r2 = isNoun ? p2.inflection[1].word_form : p2.inflection[0].word_form\n                let tags1 = p1.tags\n                let tags2 = p2.tags\n                if ((tags1.find(t => t == 'Masc') &&\n                     !tags2.find(t => t == 'Masc')) ||\n                    (tags1.find(t => t == 'Fem') &&\n                     !tags2.find(t => t == 'Masc') &&\n                     !tags2.find(t => t == 'Fem'))) {\n                    return -1\n                } else if ((tags2.find(t => t == 'Masc') &&\n                            !tags1.find(t => t == 'Masc')) ||\n                           (tags2.find(t => t == 'Fem') &&\n                            !tags1.find(t => t == 'Masc') &&\n                            !tags1.find(t => t == 'Fem'))) {\n                    return 1\n                } else if (typeof r1 == 'string' && typeof r2 == 'string') {\n                    return r2.localeCompare(r1)\n                } else if (typeof r1 == 'string') {\n                    return r2[0].localeCompare(r1)\n                } else if (typeof r2 == 'string') {\n                    return r2.localeCompare(r1[0])\n                } else {\n                    return r2[0].localeCompare(r1[0])\n                }\n            })\n            let currentTags = paradigms[0].tags\n            let currentInfl = paradigms[0].inflection.map(infl => {\n                infl.rowspan = 0\n                infl.index = []\n                return infl })\n            // merge equal cells by setting rowspan\n            paradigms.forEach((p,index) => {\n                if (isNoun) {\n                    let gender = p.tags[1]\n                    if (!this.gender) {\n                        this.gender = gender\n                    } else if (this.gender != gender) {\n                        this.gender = '+'\n                    }\n                }\n                for (let i = 0; i < p.inflection.length; i++) {\n                    if (currentInfl[i].rowspan > 0 &&\n                        word_formsEqual(currentInfl[i].word_form,\n                                        p.inflection[i].word_form,\n                                        currentTags,\n                                        p.tags,\n                                        hasTags(currentInfl[i], ['Sing','Ind']))\n                       ) {\n                        currentInfl[i].index.push(index+1) // remember paradigm row, for hiliting\n                        currentInfl[i].rowspan++\n                        p.inflection[i].rowspan = 0\n                    } else {\n                        // let ind = currentInfl[i].index\n                        currentInfl[i] = p.inflection[i]\n                        currentInfl[i].index = []\n                        currentInfl[i].index.push(index+1) // remember paradigm row, for hiliting\n                        currentInfl[i].rowspan = 1\n                    }\n                }\n            })\n            this.paradigms = paradigms\n            return paradigms\n        },\n        // OBSOLETE because of merging of equal cells\n        // remove duplicate rows\n        // if used: have to adjust rowspans\n        removeDuplicates: function (paradigms, tagLists) {\n            tagLists\n            return paradigms\n            /* let res = []\n            paradigms.forEach(p => {\n                let found = false\n                res.forEach(r => {\n                    if (compareParadigms(p, r, tagLists)) {\n\n                        found = false // true\n                    }\n                })\n                if (!found) {\n                    res.push(p)\n                }\n            })\n            return res */\n        },\n        getGender: function () {\n            let paradigms = this.getStandardParadigms()\n            let isNoun = paradigms[0].tags.find(t => t == 'NOUN')\n            paradigms.forEach(p => {\n                if (isNoun) {\n                    let gender = p.tags[1]\n                    if (!this.gender) {\n                        this.gender = gender\n                    } else if (this.gender != gender) {\n                        this.gender = '+' // more than one gender\n                    }\n                }\n            })\n            return this.gender\n        },\n        unhiliteRows: function () {\n            $('td[index]').removeClass('hilite')\n        }\n    }\n}\n</script>\n\n<style>\n\ntable.infl {\n    /* border: 2px solid gray; */\n    margin: 1em;\n}\n\ntable.infl.rounded {\n    border-collapse: separate;\n    border-radius: 10px !important;\n    border-spacing: 0;\n    -moz-border-radius:6px !important;\n}\n\ntable.infl.rounded.top {\n    border: 2px solid gray;\n}\n\ntable.infl.xs {\n    margin: 0em;\n}\n\nth.infl {\n    border: 1px solid lightgray;\n    padding: .3em;\n    padding-left: .5em;\n    padding-right: .5em;\n    text-align: center;\n    vertical-align: top;\n    font-weight: normal;\n    font-style: italic;\n}\n\nth.infl.xs {\n    border: 1px solid lightgray;\n    padding: 0.2em;\n}\n\ntd.infl {\n    border: 1px solid lightgray;\n    padding: .3em;\n    padding-left: .5em;\n    padding-right: .5em;\n    font-weight: normal;\n    cursor: arrow\n    }\n\ntd.infl.xs {\n    border-bottom: 1px solid lightgray;\n    border-left: 1px solid lightgray;\n    border-top: 0;\n    border-right: 0;\n    /* font-style: italic;  !! */\n    /* font-weight: normal; !! */\n    text-align: center;\n    padding: .3em;\n}\n\ntd.infl.sub.xs {\n    border-bottom: 0 /* 1px solid lightgray*/;\n    border-left: 0;\n    /* font-style: normal; !! */\n    text-align: center;\n    padding: .3em;\n    /* font-size: smaller */\n}\n\ntd.hilite {\n    background: lightgray\n}\n\ntd.group {\n    border-top: 1px solid lightgray;\n    border-bottom: 0;\n    border-right: 0;\n    border-left: 0;\n    background-color:  #faf1f0; /* #f7e1ea; */\n    text-align: center;\n    padding-left: 1em;\n    /* font-weight: bold; */\n    font-style: italic; /* !! */\n}\n\nth.lemma {\n    padding: .5em;\n    padding-bottom: 0.5em;\n    text-align: center\n    }\nspan.infl-lemma {\n    font-weight: bold;\n    color: #560027;\n    font-size: larger\n}\nspan.word_class {\n    font-size: smaller\n}\nspan.word_form {\n    font-weight: bold\n}\n\n.sub {\n    font-style: italic;\n    font-weight: normal\n}\n\n.xborder {\n    border: 1px solid gray\n}\n.xborder-top {\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n.xborder-top-right {\n    border-top-right-radius: 10px !important;\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n.xborder-top-left {\n    border-top-left-radius: 10px !important;\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n.xborder-top-left-right {\n    border-top-left-radius: 10px !important;\n    border-top-right-radius: 10px !important;\n    border-spacing: 0;\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-top: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n\n.xborder-lemma {\n    border-top-left-radius: 10px !important;\n    border-top-right-radius: 10px !important;\n    border-spacing: 0;\n}\n\n.xborder-bottom {\n    background-color: #faf1f0;\n    /* background-color: #f7e1ea; */\n    /* border-bottom: 1px solid gray;\n    border-left: 1px solid gray;\n    border-right: 1px solid gray */\n}\n\nspan.comma:empty {\n    display: none;\n}\n\nspan.comma:not(:first-child):before {\n    content: \", \";\n}\n\ndiv.comma:not(:last-child):after {\n    content: \", \";\n}\n</style>\n"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__$8 = undefined;
      /* module identifier */
      const __vue_module_identifier__$8 = undefined;
      /* functional template */
      const __vue_is_functional_template__$8 = false;
      /* style inject SSR */
      
      /* style inject shadow dom */
      

      
      const __vue_component__$8 = /*#__PURE__*/normalizeComponent(
        { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
        __vue_inject_styles__$8,
        __vue_script__$8,
        __vue_scope_id__$8,
        __vue_is_functional_template__$8,
        __vue_module_identifier__$8,
        false,
        createInjector,
        undefined,
        undefined
      );

    // Import vue component

    // Declare install function executed by Vue.use()
    function install(Vue) {
    	if (install.installed) return;
    	install.installed = true;
    	Vue.component('inflectionTable', __vue_component__$8);
    }

    // Create module definition for Vue.use()
    const plugin = {
    	install,
    };

    // Auto-install when vue is found (eg. in browser via <script> tag)
    let GlobalVue = null;
    if (typeof window !== 'undefined') {
    	GlobalVue = window.Vue;
    } else if (typeof global !== 'undefined') {
    	GlobalVue = global.Vue;
    }
    if (GlobalVue) {
    	GlobalVue.use(plugin);
    }

    exports.default = __vue_component__$8;
    exports.install = install;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
