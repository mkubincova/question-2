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

    const query = req.body.countryName;
    const url = "https://restcountries.com/v2/name/" + query;

    https.get(url, function(response){
    
        //take data from api
        response.on("data", function(data){

            
            //make data readable
            const countryData = JSON.parse(data);

            res.write("<html><head><link rel='stylesheet' href='css/style.css'></head>");
            res.write("<a href='/'>&larr; Go back</a><br>");

            if (countryData.status == 404) {
                res.write("<p>No country with this name, try again</p>");
                res.send();
            } else{
                const name = countryData[0].name;
                const capital = countryData[0].capital;
                const population = countryData[0].population;
                const currency = countryData[0].currencies[0].name;
                const flag = countryData[0].flags.svg;

                //show result to user
                res.write("<h1><img src=" + flag + " alt=" + name + "-flag /> " + name + "</h1>");
                res.write("<p>Capital: <span>" + capital + "</span></p>");
                res.write("<p>Population: <span>" + population + "</span></p>");
                res.write("<p>Currency: <span>" + currency + "</span></p>");
                res.write("</html>")

                res.send();
            }

        });
    })
})


app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running on http://localhost:3000/");
})