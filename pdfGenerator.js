const express = require('express');
var fs = require('fs')
var conversion = require("phantom-html-to-pdf")();
const app = express()
const port = 3000;
const host = '0.0.0.0';
let pdf = (link, name, res) => {
    conversion({ url: link }, function(err, pdf) {
        if(err){
            console.log('error in pdf', err);
            throw err;
        }else{
            name = name + '.pdf'
            var output = fs.createWriteStream(__dirname + '/uploads/' + name);
            pdf.stream.pipe(res);
            return true;
        }        
    });
}
app.get('/generatePDF', (req, res) => {
    if (req.headers.auth_token == 'EAI-PDF-Generate') {
	let url = decodeURIComponent(req.query.link);
	console.log(url,"url");     
    let response = pdf(url, req.query.name, res);
	console.log(response,"pdf error");     

    } else {
        console.log("access denied");
        res.status(401).send("Access Denied");
    }
})


app.listen(port,host, () => console.log(`Example app listening on port ${port}!`))
