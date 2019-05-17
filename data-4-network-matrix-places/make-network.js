const fs = require('fs');
const https = require('https');
const d3 = require('d3');
const { Parser } = require('json2csv');

// generate the data for building the matrix/network of places
// get data from the google spreadsheet

let file = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX2tzNx23fjGUGAYpnhB-DPhlVAzuTXl3s2D57a4W1phB4Rzy1NOffn0nNtCJOfh30z5W9mPrD1rFU/pub?gid=0&single=true&output=tsv';
https.get(file, (resp) => {

  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Handle the result.
  resp.on('end', () => {

    data = d3.tsvParse(data)

    // Since V. is still working on the dataset, keep only rows that have been completed
    // Remove this filter once the dataset is completed
    data = data.filter(function(d){
      return d.id
    })

    // Get a dictionary of categories of places
    let placesCategories = d3.nest()
      .key(function(d){ return d['Categoria']})
      .entries(data);

    placesCategories = placesCategories.map(function(d){
        let obj;
        switch(d.key) {
          case 'generico_non_terrestre':
            obj = {
              'name': d.key,
              'position': 1
            }
            break;
          case 'nominato_non_terrestre':
            obj = {
              'name': d.key,
              'position': 2
            }
            break;
          case 'nominato_terrestre':
            obj = {
              'name': d.key,
              'position': 3
            }
            break;
          case 'generico_terrestre':
            obj = {
              'name': d.key,
              'position': 4
            }
            break;
          case 'inventato':
            obj = {
              'name': d.key,
              'position': 5
            }
            break;
          case 'no_ambientazione':
            obj = {
              'name': d.key,
              'position': 6
            }
            break;
          default:
            // There shouldn't be this case, but handle it anyway in case of inconsistencies
            obj = {
              'name': 'non identificato',
              'position': 0
            }
            break;
        }
        return obj;
      })
    placesCategories = placesCategories.sort((a, b) => (a.position > b.position) ? 1 : -1)
    placesCategoriesDictionary = {}
    placesCategories.forEach(function(d){
      placesCategoriesDictionary[d.name] = d.position
    })

    // print a sample of the data
    // console.log(data.slice(0,1))

    // create the array of nodes
    let nodes = data.map(function(d){
      let obj = {
        'gravity_x': +d.year - 1942,
        'gravity_y': placesCategoriesDictionary[d['Categoria']],
        'id': d.id,
        'label': d['Occorrenza'],
        'part_of': d['Parte di ID'],
        'source': d['Fonte'],
        'year': +d.year,
        'category': d['Categoria']
      }
      return obj
    })

    // print a sample of the nodes
    // console.log('nodes:', nodes.slice(0,1));

    // create the array of edges
    let edges = []
    // base edges on works co-occurrences of places
    let sources = d3.nest()
      .key(function(d){ return d.source })
      .entries(nodes)
      .forEach((d) => {


        // Controllare che il codice sia giusto

        // Da qui

        d.values.filter(function(e){
          return e.part_of == '';
        }).forEach((n,i) => {
          if (i < d.values.length-1) {
            for (var k=i+1; k<=d.values.length-1; k++) {
              let obj = {}
              obj = {
                'source': n.id,
                'target': d.values[k].id,
                'volume': d.key,
                'year': n.year,
                'source_part_of': n.part_of,
                'kind': 'same_text'
              }
              edges.push(obj);
            }
          }
        })

        d.values.filter(function(e){
          return e.part_of != '';
        }).forEach((n,i) => {
          let obj = {}
          obj = {
            'source': n.id,
            'target': n.part_of,
            'volume': d.key,
            'year': n.year,
            'source_part_of': n.part_of,
            'kind': 'part_of'
          }
          edges.push(obj);
        })

        // fino a qui




      })
    // Check the edges
    // console.log('edges:', JSON.stringify(edges.slice(100,200), null, 2));

    // Export the nodes and the edges to separate files delimiter-separated

    // Nodes
    let nodesFields = []
    for(var key in nodes[0]) {
      nodesFields.push(key)
    }
    let nodesOpts = { nodesFields };
    try {
      let parser = new Parser(nodesOpts);
      let csv = parser.parse(nodes);
      // console.log(csv);
      fs.writeFileSync('nodes.csv', csv);
    } catch (err) {
      console.error(err);
    }

    // edges
    let edgesFields = []
    for(var key in edges[0]) {
      edgesFields.push(key)
    }
    let edgesOpts = { edgesFields };
    try {
      let parser = new Parser(edgesOpts);
      let csv = parser.parse(edges);
      // console.log(csv);
      fs.writeFileSync('edges.csv', csv);
    } catch (err) {
      console.error(err);
    }

  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
