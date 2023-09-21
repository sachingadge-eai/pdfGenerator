const express = require('express');
var fs = require('fs')
var conversion = require("phantom-html-to-pdf")();
const app = express()
const port = 3001;
const host = '0.0.0.0';

let finalPdf = (link, name, res) => {
    //Replace {html: ...} to {url : link}
    conversion({ url : link }, function (err, pdfStream) {
        if (err) {
            throw err;
        } else {
            var chunks = [];

            pdfStream.stream.on('data', (chunk) => {
                // Collect PDF data in chunks
                chunks.push(chunk);
            });


            pdfStream.stream.on('end', () => {
                var pdfBuffer = Buffer.concat(chunks);
                var pdfBase64 = pdfBuffer.toString('base64');
                console.log("PDF Base64:", pdfBase64);
                var decodedData = Buffer.from(pdfBase64, 'base64');

                var outputFilePath = `${__dirname}/to/${name}.pdf`;

                fs.writeFile(outputFilePath, decodedData, 'binary', (err) => {
                    if (err) {
                        console.error('Error writing PDF file:', err);
                    } else {
                        console.log('PDF file saved:', outputFilePath);
                    }
                });

                res.send(pdfBase64);
            });
        }
    });
}


app.get('/', (req, res) => {
    res.status(200).send("Welcome to PDF Generator");
});


app.get('/generatePDF', (req, res) => {
    const auth_token = req.headers.auth_token;
    const link = req.query.link;
    const name = req.query.name;

    // Check if the auth_token is valid
    if (auth_token !== 'EAI-PDF-Generate') {
        console.log("Unauthorized Access");
        return res.status(401).send("Unauthorized Access");
    }

    // Check if link and name are provided
    if (!link || !name) {
        console.log("Link and name are required");
        return res.status(400).send("Link and name are required");
    }

    // Check if the link contains only HTML content
    if (!isValidHTMLLink(link)) {
        console.log("Invalid link format. Only HTML links are allowed.");
        return res.status(400).send("Invalid link format. Only HTML links are allowed.");
    }

    // Check if the name ends with '.pdf'
    if (!isValidPDFName(name)) {
        console.log("Invalid name format. Only PDF names are allowed.");
        return res.status(400).send("Invalid name format. Only PDF names are allowed.");
    }

    // If all validations pass, call the finalPdf function
    console.log(link, "url");
    finalPdf(decodeURIComponent(link), name, res);
});

// Function to check if the link contains only HTML content
function isValidHTMLLink(link) {
    // Implement your validation logic here, e.g., check if it starts with "http://" or "https://"
    return link.startsWith("http://") || link.startsWith("https://");
}

// Function to check if the name ends with '.pdf'
function isValidPDFName(name) {
    return name === 'pdf' ? true : false;
}
 

app.listen(port, host, () => console.log(`Server is running on port ${port}!`));
