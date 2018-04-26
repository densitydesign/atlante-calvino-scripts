// Node script for parsing the pages references.
const fs = require('fs');
const node_xj = require("xls-to-json");

node_xj({
    input: "data/indice generale.xlsx", // input xls
    output: null, // output json
    sheet: "indice nomi sample" // specific sheetname
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        // console.log(result);

        let data = [];

        result.forEach(function(d) {
            let person = {
                'name': d.name,
                'references': []
            }
            console.log('\x1b[30m', d.name);


            d.references = d.references.split(',');

            // console.log(d.references)


            d.references.forEach(function(r) {

                let obj;

                // // if the reference is a page number, return it as it is
                if (!isNaN(r)) {
                    console.log('\x1b[30m', `${r} is a number`)
                    obj = {
                        'page': parseInt(r),
                        'intoNote': false,
                        'noteNumber': null
                    }
                    person.references.push(obj);
                } else if (r.indexOf('-') > -1 && r.indexOf('n') < 0) {
                    console.log('\x1b[30m', `${r} are consequential pages`)

                    // E.g. "1352-64" > grab 64 and 52, and generate all numbers from 1352 to 1364
                    r = r.split('-');
                    let lastDigits = r[0].toString().substr(r[0].toString().length - r[1].toString().length);
                    let difference = r[1] - lastDigits;

                    // Push to array first number, then calculate the rest of the sequence
                    obj = {
                        'page': parseInt(r[0]),
                        'intoNote': false,
                        'noteNumber': null
                    }
                    person.references.push(obj);

                    // The rest of the sequence
                    for (var i = 1; i <= difference; i++) {
                        r[0]++;
                        console.log(r[0])
                        obj = {
                            'page': r[0],
                            'intoNote': false,
                            'noteNumber': null
                        }
                        person.references.push(obj);
                    }
                } else if (r.indexOf('n') > -1 && r.indexOf('-') < 0) {
                    console.log('\x1b[30m', `${r} is in note`);
                    obj = {
                        'page': parseInt(r.split(' n')[0]),
                        'intoNote': true,
                        'noteNumber': null
                    }
                    person.references.push(obj);
                } else if (r.indexOf('n') > -1 && r.indexOf('-') > -1) {
                    if (r.indexOf('n') > r.indexOf('-')) {
                        console.log('\x1b[31m', `COMPLEX: ${r} is on multiple pages, may be singular note`);
                        console.log('\x1b[30m', r.split(' n')[0])

                        // E.g. "1352-64" > grab 64 and 52, and generate all numbers from 1352 to 1364
                        r = r.split(' n')[0];
                        r = r.split('-');
                        let lastDigits = r[0].toString().substr(r[0].toString().length - r[1].toString().length);
                        let difference = r[1] - lastDigits;

                        // Push to array first number, then calculate the rest of the sequence
                        obj = {
                            'page': parseInt(r[0]),
                            'intoNote': false,
                            'noteNumber': null
                        }
                        person.references.push(obj);

                        // The rest of the sequence
                        for (var i = 1; i <= difference; i++) {
                            r[0]++;
                            console.log(r[0])
                            obj = {
                                'page': r[0],
                                'intoNote': true,
                                'noteNumber': null
                            }
                            person.references.push(obj);
                        }

                    } else {
                        console.log('\x1b[31m', `COMPLEX: ${r} is on singular page, may be more notes`);

                        r = r.split(' n')[0];
                        console.log(r)
                        obj = {
                            'page': parseInt(r),
                            'intoNote': true,
                            'noteNumber': null
                        }
                        person.references.push(obj);
                    }



                } else {
                    console.log('\x1b[30m', `${r} ???????????`)
                }


                // if (r.indexOf('-') > -1) {
                // 	r = r.split('-');
                // 	if(r[0]==r[1]-1){
                // 		console.log(r[0])
                // 		console.log(r[1])
                // 		console.log('\n')
                // 	}
                // }
            })

            data.push(person);

            console.log('\x1b[30m', '')
        });
        // console.log(data);
        fs.writeFile("data/references-names.json", JSON.stringify(data, null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log('\x1b[32m', "The file was saved!");
            console.log('\x1b[30m')
        });
    }
});