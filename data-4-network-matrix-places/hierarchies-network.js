// In this file we build a hierarchy of Calvino's places

const fs = require('fs');
const https = require('https');
const d3 = require('d3');

let file = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX2tzNx23fjGUGAYpnhB-DPhlVAzuTXl3s2D57a4W1phB4Rzy1NOffn0nNtCJOfh30z5W9mPrD1rFU/pub?gid=0&single=true&output=tsv';
https.get(file, (resp) => {
  let data = '';
  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });
  // The whole response has been received. Handle the result.
  resp.on('end', () => {
    data = d3.tsvParse(data);
    // simplify data, to work easier
    // remove once finished
    data.forEach( d => {
      d.parentKey = d['Parte di ID'] +''+ d['Parte di'];
      d.placeKey = d.id +''+ d['Occorrenza']
      // delete d['year'];
      // delete d['Scala'];
      // delete d['I'];
      // delete d['C'];
      // delete d['F'];
      // delete d['nominato/Generico'];
      // delete d['Localizzabile'];
      // delete d['Terrestre'];
      // delete d['Inventato'];
      // delete d['Categoria'];
      // delete d['Start'];
      // delete d['End'];
      // delete d['Nota'];
      // delete d[''];
    });

    data = data.map( d => {return {'placeKey': d.placeKey, 'parentKey':d.parentKey } } );
    // console.log(data.slice(0,100))

    let test_h_data = createHierarchy('parentKey', data);

    function createHierarchy(keyValue, data) {
      let h_data = d3.nest()
        .key( d => d[keyValue])
        .entries(data);

        console.log(h_data);
        console.log('- - - - - - - - - - -');

      h_data = h_data.map( d => {

        console.log('d');
        console.log(d);
        console.log('- - -');

        let parent = data.filter( e => {return e.placeKey==d.key} )[0];

        console.log('p');
        console.log(parent);
        console.log('- - - - - - - - - - -');

      })

      // return h_data;
    }





    // while (data.length > 1) {
    //
    // }





  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
