// First run "parse-pages-references"
// then import the generated table in the "indice generale.xlsx" with the name "indice nomi (pages)".
// Run this script on the updated Excel file

const fs = require('fs');
const node_xj = require("xls-to-json");
const colors = require('colors');
const _ = require('lodash');

let fileName = "indice generale 005 (ID giusti e info WikiData).xlsx"
let sheetNames = 'Nomi e pagine';
let sheetEssays = 'Indice Meridiani';

node_xj({
    input: `data/${fileName}`, // input xls
    output: null, // output json
    sheet: sheetNames // specific sheetname
}, function(err, names) {
    if (err) {
        console.error(err);
    } else {
        console.log(names)
        node_xj({
            input: `data/${fileName}`, // input xls
            output: null, // output json
            sheet: sheetEssays // specific sheetname
        }, function(err, essays) {
            if (err) {
                console.error(err);
            } else {
                console.log(essays)
                names.forEach(function(name) {
                    // console.log(name.name.toString().green)
                    name.essays = [];
                    let pages = name.pages.split(';')
                        .slice(0, -1);
                    // console.log(pages)
                    pages.forEach(function(p) {
                        essays.forEach(function(essay) {
                            if (p >= +essay["page-start"] && p <= +essay["page-end"]) {
                                console.log('aaa',p, essay.title);
                                let obj = {
                                    'id': essay.id,
                                    'title': essay.title
                                }
                                name.essays.push(obj);
                            }
                        })
                        // console.log('bbb',p, name.essays);
                    })
                    // console.log('ccc',name.essays)
                    let countEssays = _.countBy(name.essays, 'id');
                    name.essays = _.uniqBy(name.essays, 'id');
                    name.essays.forEach(function(essay,i){
                        essay.onHowManyPagesAppears = countEssays[name.essays[i].id]
                    })
                    // console.log('ccc',name.essays)
                });

                // fs.writeFile(`data/${namesIndex} essays.json`, JSON.stringify(names, null, 2), function(err) {
                //     if (err) {
                //         return console.log(err);
                //     }
                //     console.log(`The file “${namesIndex} essays.json” was saved!`.green);
                // });

                // // save CSV for creating network in table2net
                // let tabularData = '';
                // names.forEach(function(d) {
                //     let essays = '';
                //     d.essays.forEach(function(r) {
                //         essays += `${r.title};`;
                //     })
                //     if (tabularData == '') {
                //         tabularData += `name,occurrences,essays\n`;
                //     }
                //     tabularData += `"${d.name.replace(',','-')}","${d.occurrences}","${essays}"\n`;
                // })

                // fs.writeFile(`data/${namesIndex} essays.csv`, tabularData, function(err) {
                //     if (err) {
                //         return console.log(err);
                //     }
                //     console.log(`The file “${namesIndex} essays.csv” was saved!`.green);
                // });

            }
        });
    }
});