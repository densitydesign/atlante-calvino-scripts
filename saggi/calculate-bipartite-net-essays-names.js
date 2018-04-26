// Node script for parsing the pages references.
const fs = require('fs');
const node_xj = require("xls-to-json");
const colors = require('colors');
const _ = require('lodash');

let namesIndex = 'indice nomi (pages)';
let essaysIndex = 'indice dei saggi';

let data = fs.readFileSync('data/indice nomi (pages) essays.json', 'utf-8');
data = JSON.parse(data);

// console.log(data);

let nodes = [];
let edges = [];
data.forEach(function(person, i) {
    person.id = `person-${i+1}`;
    person.type = 'person';
    let personObj = {
        'label': person.name,
        'id': person.id,
        'type': person.type
    }
    nodes.push(personObj);

    person.essays.forEach(function(essay) {
        essayObj = {
            'label': essay.title,
            'id': 'essay-'+essay.id,
            'type': 'essay'
        }
        nodes.push(essayObj);

        edgeObj = {
            'source': 'essay-'+essay.id,
            'target': person.id,
            'weight': essay.onHowManyPagesAppears
        }
        edges.push(edgeObj);
    })
})

console.log(nodes);
console.log(edges);

// save TSV for creating network
let tabularNodes = '';
nodes.forEach(function(node) {
    
    if (tabularNodes == '') {
        tabularNodes += `id\tlabel\ttype\n`;
    }

    let line = `"${node.id}"\t"${node.label}"\t"${node.type}"\n`;

    tabularNodes += line;

})

fs.writeFile(`data/bipartite-network-nodes.tsv`, tabularNodes, function(err) {
    if (err) {
        return console.log(err);
    }
    console.log(`The file “bipartite-network-nodes.tsv” was saved!`.green);
});

let tabularEdges = '';
edges.forEach(function(edge){
    if(tabularEdges == ''){
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


