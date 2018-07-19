// Node script for parsing the pages references.
const fs = require('fs');
const node_xj = require("xls-to-json");
const colors = require('colors');
const _ = require('lodash');
const d3 = require('d3');

let file = "indice generale 006.xlsx"
let names = 'Nomi e pagine';
let essays = 'Indice Meridiani';
let wikidata = 'Info Wikidata';

let outputName = file.replace('.xlsx', '').replace('.xls', '');

console.log('Loading spreadsheet', names)
node_xj({
  input: `data/${file}`, // input xls
  output: null, // output json
  sheet: names // specific sheetname
}, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    // console.log(result);

    let data = [];

    // Compute single pages references
    result.forEach(function(d) {
      let person = {
        'name': d.nomeCorretto ? d.nomeCorretto : d.nomeScansione,
        'qid': d['qid'],
        'references': [],
        'referencesLength': 0
      }

      if (d.toSkip == '' && d.toAdd == '') {
        // console.log('\x1b[30m', d.name);
        d.reference = d.reference.substring(5).split(',');

        // console.log('ref: ', d.reference)

        d.reference.forEach(function(r) {

          let obj;

          if (!isNaN(r)) {
            // if the reference is a page number, return it as it is
            // console.log('\x1b[30m', `${r} is a number`)
            obj = {
              'page': parseInt(r),
              'intoNote': false,
            }
            person.references.push(obj);
          } else if (r.indexOf('-') > -1 && r.indexOf('n') < 0) {
            // if the reference is a sequence of numbers and do not have notes, parse and return them as page numbers
            // E.g. "1352-64" > grab 64 and 52, and generate all numbers from 1352 to 1364

            // console.log('\x1b[30m', `${r} are consequential pages`)

            r = r.split('-');
            let lastDigits = r[0].toString()
              .substr(r[0].toString()
                .length - r[1].toString()
                .length);
            let difference = r[1] - lastDigits;

            // Push to array first number, then calculate the rest of the sequence
            obj = {
              'page': parseInt(r[0]),
              'intoNote': false,
            }
            person.references.push(obj);

            // The rest of the sequence
            for (var i = 1; i <= difference; i++) {
              r[0]++;
              // console.log('\x1b[30m', r[0])
              obj = {
                'page': r[0],
                'intoNote': false,
              }
              person.references.push(obj);
            }
          } else if (r.indexOf('n') > -1 && r.indexOf('-') < 0) {
            // if the reference is within a note on a singular page, parse and return the page
            // console.log('\x1b[30m', `${r} is in note`);
            obj = {
              'page': parseInt(r.split(' n')[0]),
              'intoNote': true,
            }
            person.references.push(obj);
          } else if (r.indexOf('n') > -1 && r.indexOf('-') > -1) {
            // if the reference is on multiple pages and it is a note, handle carefully
            if (r.indexOf('n') > r.indexOf('-')) {
              // if the note signifier comes after the multipage

              // console.log('\x1b[31m', `COMPLEX: ${r} is on multiple pages, is in note which may be singular`);
              // console.log('\x1b[30m', r.split(' n')[0])

              // E.g. "1352-64" > grab 64 and 52, and generate all numbers from 1352 to 1364
              r = r.split(' n')[0];
              r = r.split('-');
              let lastDigits = r[0].toString()
                .substr(r[0].toString()
                  .length - r[1].toString()
                  .length);
              let difference = r[1] - lastDigits;

              // Push to array first number, then calculate the rest of the sequence
              obj = {
                'page': parseInt(r[0]),
                'intoNote': true,
              }
              person.references.push(obj);

              // The rest of the sequence
              for (var i = 1; i <= difference; i++) {
                r[0]++;
                // console.log('\x1b[30m', r[0])
                obj = {
                  'page': r[0],
                  'intoNote': true,
                }
                person.references.push(obj);
              }

            } else {
              // if the note signifier comes before the multipage
              // console.log('\x1b[31m', `COMPLEX: ${r} is on singular page, is in note which may be more than one`);

              r = r.split(' n')[0];
              // console.log(r)
              obj = {
                'page': parseInt(r),
                'intoNote': true,
              }
              person.references.push(obj);
            }

          } else {
            // Cases not recognized
            console.log('Reference for', d.nomeCorretto ? d.nomeCorretto : d.nomeScansione, 'not recognized:')
            console.log(`${r}`)
          }
        })

        person.referencesLength = person.references.length;

        data.push(person);

        // console.log('\x1b[30m', '')
      } else {
        // console.log('Person to skip', d.nomeCorretto ? d.nomeCorretto : d.nomeScansione, '(' + d.reference + ')')
      }

    });

    // Based on pages references, get essays references
    console.log('Loading spreadsheet', essays)
    node_xj({
      input: `data/${file}`, // input xls
      output: null, // output json
      sheet: essays // specific sheetname
    }, function(err, essays) {
      if (err) {
        console.error(err);
      } else {
        // console.log(essays);

        data.forEach(function(person) {
          // console.log(person.name)
          person.essays = [];
          // console.log(person.references.map(function(d) { return d.page }))
          pages = person.references.map(function(d) {
            return d.page
          })
          pages.forEach(function(p) {
            essays.forEach(function(essay) {
              if (p >= +essay["page-start"] && p <= +essay["page-end"]) {
                // console.log('aaa', p, essay.title);
                let obj = {
                  'id': essay.id,
                  'title': essay.title,
                  'year': essay.year,
                  'collection': essay.collection
                }
                person.essays.push(obj);
              }
            })
            // console.log('bbb',p, person.essays);
          })

          // console.log('ccc',person.essays)
          let countEssays = _.countBy(person.essays, 'id');
          person.essays = _.uniqBy(person.essays, 'id');
          // person.essays.forEach(function(essay,i){
          //     essay.onHowManyPagesAppears = countEssays[person.essays[i].id]
          // })
        })

        // Merge references from Wikidata
        console.log('Loading spreadsheet', wikidata)
        node_xj({
          input: `data/${file}`, // input xls
          output: null, // output json
          sheet: wikidata // specific sheetname
        }, function(err, wikidataset) {
          // console.log(wikidataset);

          let properties = d3.nest()
            .key(function(d) {
              return d['prop id']
            })
            .entries(wikidataset);

          // console.log(properties[properties.length-1])

          properties = properties.map(function(d) {
            return {
              'key': d.key,
              'value': d.values[0]['prop value']
            }
          })

          wikidataset = d3.nest()
            .key(function(d) {
              return d.idWikidata
            })
            .key(function(d) {
              return d['prop id']
            })
            .entries(wikidataset);

          data.forEach(function(d) {

            let filtered = wikidataset.filter(function(e) {
              return e.key == d.qid
            })
            // console.log(filtered.length)

            properties.forEach(function(p) {

              try {
                // console.log(filtered[0].values)
                let propInfo = filtered[0].values.filter(function(e) {
                  return e.key == p.key
                })

                let thisValues = '';

                d[p.value] = null;

                if (propInfo.length > 0) {
                  propInfo[0].values.forEach(function(e) {
                    thisValues += `${e['value name']};`;
                  })
                  // console.log(propInfo[0].values[0]['prop id'], propInfo[0].values[0]['prop value'])
                  // console.log(thisValues+'\n')
                  d[p.value] = thisValues;
                }
                // else {
                //     console.log(JSON.stringify(d.name, null, 2) + ' - ' + p.value + ' (' + p.key + '): no values!\n')
                // }
              } catch (err) {
                console.log(d.name, p.value)
                console.log(err)
                console.log('---')
              }


            })

            // console.log(d)

          })

          let graph = {
            nodes: data,
            links: []
          }

          console.log('Calculating edges, this will take a while')
          graph.nodes.forEach(function(source) {
            // console.log(source)
            // console.log('source',source.qid, source.name, source.essays.length)

            // remove source node and loop again
            let newNodes = graph.nodes.filter(function(d) {
              return d.qid != source.qid;
            })

            newNodes.forEach(function(target) {
              // console.log('target', graph.nodes.indexOf(target),target.qid, target.name, target.essays.length)

              let commonEssays = _.intersectionWith(source.essays, target.essays, _.isEqual);

              commonEssays.forEach(function(e) {

                let isThere = graph.links.filter(function(d) {
                  return d.id == target.qid + '-' + source.qid + '-' + e.id
                })

                if (isThere.length == 0) {
                  let link = {
                    source: source.qid,
                    target: target.qid,
                    id: source.qid + '-' + target.qid + '-' + e.id,
                    startYear: e.year,
                    endYear: e.year,
                  }
                  graph.links.push(link)
                }
              });

            })

            source.id = source.qid;
            delete source.qid;
            source.collections = source.essays.map(function(d){return d.collection}).join(';')
            source.essays = source.essays.map(function(d){return d.title}).join(';')
            delete source.references;

          })

          console.log('Creating GEXF');

          var builder = require('xmlbuilder');

          var xml = builder.create('gexf', {
            'xmlns': 'http://www.gexf.net/1.2draft',
            'version': '1.2'
          }).ele('graph', {
            'mode': 'dynamic',
            'defaultedgetype': 'undirected',
            // 'timeformat': 'date'
          })

          var xmlNodesAttrs = xml.ele('attributes', {
            'class': 'node'
          })

          xmlNodesAttrs.ele('attribute', {
            'id': 0,
            'title': 'istance of',
            'type': 'string'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 1,
            'title': 'sex or gender',
            'type': 'string'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 2,
            'title': 'date of birth',
            'type': 'integer'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 3,
            'title': 'date of death',
            'type': 'integer'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 4,
            'title': 'country of citizenship',
            'type': 'string'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 5,
            'title': 'occupation',
            'type': 'string'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 6,
            'title': 'place of birth',
            'type': 'string'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 7,
            'title': 'place of death',
            'type': 'string'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 8,
            'title': 'count of references',
            'type': 'integer'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 9,
            'title': 'essays',
            'type': 'string'
          })
          xmlNodesAttrs.ele('attribute', {
            'id': 10,
            'title': 'collections',
            'type': 'string'
          })

          var xmlNodes = xml.ele('nodes')
          var xmlEdges = xml.ele('edges')

          graph.nodes.forEach(n => {

            let node = xmlNodes.ele('node', {
              id: n.id || n.qid,
              label: n.name
            })

            let attributes = node.ele('attvalues')

            attributes.ele('attvalue',{
              'for': 0,
              'value': n['istance of']||''
            })

            attributes.ele('attvalue',{
              'for': 1,
              'value': n['sex or gender']||''
            })

            attributes.ele('attvalue',{
              'for': 2,
              'value': (n['date of birth']?n['date of birth'].split(';')[0]:'')
            })

            attributes.ele('attvalue',{
              'for': 3,
              'value': (n['date of death']?n['date of death'].split(';')[0]:'')
            })

            attributes.ele('attvalue',{
              'for': 4,
              'value': n['country of citizenship']||''
            })

            attributes.ele('attvalue',{
              'for': 5,
              'value': n['occupation']||''
            })

            attributes.ele('attvalue',{
              'for': 6,
              'value': n['place of birth']||''
            })

            attributes.ele('attvalue',{
              'for': 7,
              'value': n['place of death']||''
            })

            attributes.ele('attvalue',{
              'for': 8,
              'value': n['referencesLength']
            })
            attributes.ele('attvalue',{
              'for': 9,
              'value': n['essays']
            })
            attributes.ele('attvalue',{
              'for': 10,
              'value': n['collections']
            })

            // {
            //   'name': 'Abbagnano Nicola',
            //   'qid': 'Q315251',
            //   'references': [{
            //     'page': 1470,
            //     'intoNote': false
            //   }],
            //   'referencesLength': 1,
            //   'essays': [{
            //     'id': '206',
            //     'title': 'Umanesimo e marxismo',
            //     'year': '1946',
            //     'collection': 'ALTRI DISCORSI DI LETTERATURA E SOCIETÀ'
            //   }],
            //   'date of birth': '1901;',
            //   'date of death': '1990;',
            //   'istance of': 'umano;',
            //   'sex or gender': 'maschio;',
            //   'country of citizenship': 'Italia;',
            //   'place of birth': 'Salerno;',
            //   'place of death': 'Milano;',
            //   'occupation': 'filosofo;scrittore;professore universitario;'
            // }

          })

          graph.links.forEach(l => {
            xmlNodes.ele('edge', {
                source: l.source,
                target: l.target,
                id: l.id
              })
              .ele('spells')
              .ele('spell', {
                start: l.startYear,
                end: l.endYear
              })
          })

          xml.end({
            pretty: true
          });

          // console.log(xml);




          // Name output similarly to the input excel
          let jsonOutputName = `data/${outputName}.json`
          let csvOutputName = `data/${outputName}.csv`
          let graphOutputName = `data/${outputName}-graph.json`;
          let gexfOutputName = `data/${outputName}.gexf`;

          fs.writeFile(graphOutputName, JSON.stringify(graph, null, 2), function(err) {
            if (err) {
              return console.log(err);
            }
            console.log(`-------------------\n${graphOutputName} file saved!\n-------------------`);
          });

          fs.writeFile(gexfOutputName, xml, function(err) {
            if (err) {
              return console.log(err);
            }
            console.log(`-------------------\n${gexfOutputName} file saved!\n-------------------`);
          });

          // fs.writeFile(jsonOutputName, JSON.stringify(data, null, 2), function(err) {
          //   if (err) {
          //     return console.log(err);
          //   }
          //   console.log('-------------------\nJSON file saved!\n-------------------');
          // });

          // // save CSV for creating network in table2net
          // let tabularData = '';
          // data.forEach(function(d) {
          //   let pages = '';
          //   d.references.forEach(function(r) {
          //     pages += `${r.page};`;
          //   })
          //   let essays = '';
          //   d.essays.forEach(function(r) {
          //     essays += `${r.title};`;
          //   })
          //   let essaysYears = '';
          //   d.essays.forEach(function(r) {
          //     essaysYears += `${r.year};`;
          //   })
          //   let collections = '';
          //   d.essays.forEach(function(r) {
          //     collections += `${r.collection};`;
          //   })
          //   if (tabularData == '') {
          //     tabularData += `"name","qid","referencesLength","pages","essays","essaysYears","collections"`;
          //     properties.forEach(function(p) {
          //       // console.log(p)
          //       tabularData += ','
          //       tabularData += `"${p.value}"`
          //     })
          //     tabularData += '\n';
          //   }
          //
          //   tabularData += `"${d.name.replace(',','-')}","${d.qid}","${d.referencesLength}","${pages}","${essays}","${essaysYears}","${collections}"`;
          //   properties.forEach(function(p) {
          //     tabularData += ','
          //     tabularData += `"${d[p.value]}"`
          //   })
          //   tabularData += '\n';
          //
          // })
          //
          // // console.log(tabularData)
          //
          // fs.writeFile(csvOutputName, tabularData, function(err) {
          //   if (err) {
          //     return console.log(err);
          //   }
          //   console.log('-------------------\nCSV file saved!\n-------------------');
          // });
        });
      }
    });

  }
});
