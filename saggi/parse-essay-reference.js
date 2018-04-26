// Node script for parsing the pages references.
const fs = require('fs');
const node_xj = require("xls-to-json");
const colors = require('colors');
const _ = require('lodash');

let namesIndex = 'indice nomi (pages)';
let essaysIndex = 'indice dei saggi';

node_xj({
    input: "data/indice generale.xlsx", // input xls
    output: null, // output json
    sheet: namesIndex // specific sheetname
}, function(err, names) {
    if (err) {
        console.error(err);
    } else {
        node_xj({
            input: "data/indice generale.xlsx", // input xls
            output: null, // output json
            sheet: essaysIndex // specific sheetname
        }, function(err, essays) {
            if (err) {
                console.error(err);
            } else {
                
                names.forEach(function(name) {
                    console.log(name.name.toString().green)
                    name.essays = [];
                    let pages = name.pages.split(';')
                        .slice(0, -1);
                    pages.forEach(function(p) {
                        // console.log(p);
                        essays.forEach(function(essay) {
                            if (p >= +essay.pageStart && p <= +essay.pageEnd) {
                                console.log(p, essay.title);
                                let obj = {
                                    'id': essay.id,
                                    'title': essay.title
                                }
                                name.essays.push(obj);

                            }
                        })
                    })
                    let countEssays = _.countBy(name.essays, 'id');
                    name.essays = _.uniqBy(name.essays, 'id');
                    name.essays.forEach(function(essay,i){
                        essay.onHowManyPagesAppears = countEssays[name.essays[i].id]
                    })
                });

                fs.writeFile(`data/${namesIndex} essays.json`, JSON.stringify(names, null, 2), function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(`The file “${namesIndex} essays.json” was saved!`.green);
                });

                // save CSV for creating network in table2net
                let tabularData = '';
                names.forEach(function(d) {
                    let essays = '';
                    d.essays.forEach(function(r) {
                        essays += `${r.title};`;
                    })
                    if (tabularData == '') {
                        tabularData += `name,occurrences,essays\n`;
                    }
                    tabularData += `"${d.name.replace(',','-')}","${d.occurrences}","${essays}"\n`;
                })

                fs.writeFile(`data/${namesIndex} essays.csv`, tabularData, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log(`The file “${namesIndex}.csv” was saved!`.green);
                });

            }
        });
    }
});