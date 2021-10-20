const express = require('express');
const https = require('https');
const bodyParser = require("body-parser");
const { runInNewContext } = require('vm');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

//get html page with form
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

//handle form submit
app.post("/", function(req, res) {

    const query = req.body.countryName.toLowerCase();
    const queryCap = query.charAt(0).toUpperCase() + query.slice(1);
    
    const url = "https://restcountries.com/v2/all?fields=name,capital,currencies,flags,population";

    https.get(url, function(response){

        let finalData = '';
        response.on("data", function (data) {
            finalData += data.toString();
        });
        response.on("end", function() {
            const countryData = JSON.parse(finalData);
            
            res.write("<html><head><link rel='stylesheet' href='css/style.css'></head>");
            res.write("<a href='/'>&larr; Go back</a><br>");

            const matchingData = countryData.filter(country => {
                const res = country.name.includes(query) || country.name.includes(queryCap);
                return res;
            });
            
            if (matchingData.length < 1){
                res.write("<p>No countries match your search</p>");
                res.send();
            } else {
                res.write("<div class='countries-list'>");

                for (let i = 0; i < matchingData.length; i++) {
                    const name = matchingData[i].name;
                    const capital = matchingData[i].capital;
                    const population = matchingData[i].population;
                    const currency = matchingData[i].currencies[0].name;
                    const flag = matchingData[i].flags.svg;

                    res.write("<div class='countries-item'>");
                    res.write("<h1><img src=" + flag + " alt=" + name + "-flag /> " + name + "</h1>");
                    res.write("<p>Capital: <span>" + capital + "</span></p>");
                    res.write("<p>Population: <span>" + population + "</span></p>");
                    res.write("<p>Currency: <span>" + currency + "</span></p>");
                    res.write("</div>");
                }
                    
                
                res.write("</div>");
                res.write("</html>");
                
                //show result to user
                res.send();
            }
        });   
    })
})


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running on http://localhost:3000/");
})