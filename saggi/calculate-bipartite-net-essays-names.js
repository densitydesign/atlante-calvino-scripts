// Node script for parsing the pages references.
const fs = require('fs');
const node_xj = require("xls-to-json");
const colors = require('colors');
const _ = require('lodash');
const d3 = require('d3');

let namesIndex = 'indice nomi (pages)';
let essaysIndex = 'indice dei saggi';

let data = fs.readFileSync('data/indice nomi (pages) essays.json', 'utf-8');
data = JSON.parse(data);

node_xj({
    input: "data/indice generale.xlsx", // input xls
    output: null, // output json
    sheet: namesIndex // specific sheetname
}, function(err, names) {
    if (err) {
        console.error(err);
    } else {
        node_xj({
            input: "data/indice generale.xlsx", // input xls
            output: null, // output json
            sheet: 'indice dei saggi' // specific sheetname
        }, function(err, essaysIndex) {
            if (err) {
                console.error(err);
            } else {

                let nodes = [];
                let edges = [];
                data.forEach(function(person, i) {
                    person.id = `person-${i+1}`;
                    person.type = 'person';

                    let personTimeSpan = [];

                    person.essays.forEach(function(essay) {
                        // console.log(essay)

                        let essaySpecification = essaysIndex.filter(function(d) {
                            return d.id == essay.id
                        })[0];

                        personTimeSpan.push(essaySpecification.year);

                        essayObj = {
                            'label': essay.title,
                            'id': 'essay-' + essay.id,
                            'type': 'essay',
                            'yearStart': essaySpecification.year,
                            'yearEnd': essaySpecification.year,
                            'part': essaySpecification.part,
                            'collection': essaySpecification.collection,
                            'section': essaySpecification.section,
                            'subSection': essaySpecification.subSection
                        }
                        nodes.push(essayObj);
                        // console.log(essayObj);

                        edgeObj = {
                            'source': 'essay-' + essay.id,
                            'target': person.id,
                            'weight': essay.onHowManyPagesAppears
                        }
                        edges.push(edgeObj);
                    })

                    personTimeSpan = _.remove(personTimeSpan, function(n) {
                        return n != '';
                    });

                    let personTimeSpanCount = _.countBy(personTimeSpan, function(d) { return d; });

                    personTimeSpan = personTimeSpan.map(function(d){
                        return {
                            year: parseInt(d),
                            count: parseInt(personTimeSpanCount[d])
                        };
                    })

                    personTimeSpan = _.sortBy(personTimeSpan, ['year']);

                    let personObj = {
                        'label': person.name,
                        'id': person.id,
                        'type': person.type,
                        'yearStart': d3.min(personTimeSpan, function(d){return d.year}),
                        'yearEnd': d3.max(personTimeSpan, function(d){return d.year}),
                        'part': '',
                        'collection': '',
                        'section': '',
                        'subSection': ''
                    }
                    nodes.push(personObj);

                })

                // console.log(nodes);
                // console.log(edges);

                // save TSV for creating network
                let tabularNodes = '';
                nodes.forEach(function(node) {

                    if (tabularNodes == '') {
                        tabularNodes += `id\tlabel\ttype\tyearStart\tyearEnd\tpart\tcollection\tsection\tsubSection\n`;
                    }

                    let line = `"${node.id}"\t"${node.label}"\t"${node.type}"\t"${node.yearStart}"\t"${node.yearEnd}"\t"${node.part}"\t"${node.collection}"\t"${node.section}"\t"${node.subSection}"\n`;

                    tabularNodes += line;

                })

                fs.writeFile(`data/bipartite-network-nodes.tsv`, tabularNodes, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(`The file “bipartite-network-nodes.tsv” was saved!`.green);
                });

                let tabularEdges = '';
                edges.forEach(function(edge) {
                    if (tabularEdges == '') {
                        tabularEdges += `source\ttarget\tweight\n`;
                    }

                    let line = `"${edge.source}"\t"${edge.target}"\t"${edge.weight}"\n`;

                    tabularEdges += line;
                });

                fs.writeFile(`data/bipartite-network-edges.tsv`, tabularEdges, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(`The file “bipartite-network-edges.tsv” was saved!`.green);
                });

            }
        });
    }
});