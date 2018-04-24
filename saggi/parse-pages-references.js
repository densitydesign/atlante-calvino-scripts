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
            console.log(d.name);


            d.references = d.references.split(',');

            // console.log(d.references)


            d.references.forEach(function(r) {

                let obj;

                // // if the reference is a page number, return it as it is
                if (!isNaN(r)) {
                    console.log(`${r} is a number`)
                    obj = {
                        'page': parseInt(r),
                        'intoNote': false,
                        'noteNumber': null
                    }

                } else if (r.indexOf('-') > -1 && r.indexOf('n') < 0) {
                		console.log(`${r} are multiple pages`)

                		r = r.split('-');

                		console.log(r, r[1].toString().length, r[0].toString().length);

                		let lastDigits = r[0].toString().substr(r[0].toString().length - r[1].toString().length);

                		console.log(r, r[1], lastDigits)


                    obj = {
                        'page': 'nan',
                        'intoNote': false,
                        'noteNumber': null
                    }
                } else {
                	console.log(`${r} ???????????`)
                }

                person.references.push(obj);

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

            console.log('')
        });
        // console.log(data);
        fs.writeFile("data/references-names.json", JSON.stringify(data, null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }
});