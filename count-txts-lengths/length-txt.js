// Given a folder of Calvino's works in txt, calculate the length in characters for all of them.
// Save the output in a JSON file

const fs = require('fs');

const directory_of_txt = 'txt';
const output_file = 'texts_length.json';

let files = [];
let output = [];

fs.readdirSync(directory_of_txt).forEach(file => {
  let parts = file.split('.');
  let extension = parts[parts.length-1]
  if (extension == 'txt') {
    files.push(file);
  }
})

files.forEach(file => {
  let length = fs.readFileSync(`${directory_of_txt}/${file}`).toString().length;
  // console.log(file, length);
  let obj = {
    'file': file,
    'length': length
  }
  output.push(obj)
})

fs.writeFileSync(output_file, JSON.stringify(output,null,2));
