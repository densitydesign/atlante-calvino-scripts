// Node script for parsing the pages references.
const fs = require('fs');
const node_xj = require("xls-to-json");

let fileName = "indice generale 005 (ID giusti e info WikiData).xlsx"
let sheetName = 'Nomi e pagine';

node_xj({
    input: `data/${fileName}`, // input xls
    output: null, // output json
    sheet: sheetName // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        // console.log(result);

        let data = [];

        result.forEach(function(d) {
            let person = {
                'name': d.nomeCorretto ? d.nomeCorretto : d.nomeScansione,
                'Qid': d['Qid'],
                'references': [],
                'occurrences': 0
            }

            if (d.toSkip == '') {
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
                
                person.countReferences = person.references.length;

                data.push(person);

                // // console.log('\x1b[30m', '')
            } else {
                console.log('Person to skip', d.nomeCorretto ? d.nomeCorretto : d.nomeScansione, '('+d.reference+')')
            }

        });
        
        // Name output similarly to the input excel
        let outputName = fileName.replace('.xlsx','').replace('.xls','')
        let jsonOutputName = `data/${outputName}.json`
        let csvOutputName = `data/${outputName}.csv`

        fs.writeFile(jsonOutputName, JSON.stringify(data, null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log('-------------------\nJSON file saved!\n-------------------');
        });

        // save CSV for creating network in table2net
        let tabularData = '';
        data.forEach(function(d) {
            let pages = '';
            d.references.forEach(function(r) {
                pages += `${r.page};`;
            })
            if (tabularData == '') {
                tabularData += `name,occurrences,pages\n`;
            }
            tabularData += `"${d.name.replace(',','-')}","${d.occurrences}","${pages}"\n`;
        })

        fs.writeFile(csvOutputName, tabularData, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log('-------------------\nCSV file saved!\n-------------------');
        });

    }
});