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
  let text = fs.readFileSync(`${directory_of_txt}/${file}`).toString();
  let length = text.length;
  let words = text.split(' ').length;
  let words2 = text.match(/[\w\d\’\'-]+/gi).length; // things such as "l’Università" count as 1 word"
  let obj = {
    'file': file,
    'length': length,
    'words-split-spaces': words,
    'words-split-regexp-words': words2
  }
  console.log(obj);
  output.push(obj);
})

fs.writeFileSync(output_file, JSON.stringify(output,null,2));
