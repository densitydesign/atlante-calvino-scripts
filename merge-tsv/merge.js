// Given a folder of Calvino's works in txt, calculate the length in characters for all of them.
// Save the output in a JSON file

const fs = require('fs');
const d3 = require('d3');
const Json2csvParser = require('json2csv').Parser;


const directory_of_txt = 'dati';
const output_file = 'merged';

var files = [];
var output = [];

fs.readdirSync(directory_of_txt).forEach(file => {
  var parts = file.split('.');
  var extension = parts[parts.length-1]
  if (extension == 'tsv') {
    files.push(file);
  }
})

files.forEach(file => {

  var data = fs.readFileSync(`${directory_of_txt}/${file}`, 'utf-8').toString();

  data = d3.tsvParse(data);
  // console.log(file.split('-')[0]);
  // console.log(data);
  var source = file.split('-')[0];
  data.forEach(function(d){
      d.source = source;
  })
  output = output.concat(data);
})

console.log(output[0]);


var fields = Object.keys(output[0]);

fields = [
  'source',
  // 'occorrenza',
  'starts_at',
  'ends_at',
  'tipologia',
  'nota'
]

console.log(fields)
var opts = { fields, delimiter: '\t' };

try {
  const parser = new Json2csvParser(opts);
  const tsv = parser.parse(output);
  // console.log(tsv);
  fs.writeFileSync(output_file+'.tsv', tsv)
  fs.writeFileSync(output_file+'.json', JSON.stringify(output,null,2));
} catch (err) {
  console.error(err);
}
