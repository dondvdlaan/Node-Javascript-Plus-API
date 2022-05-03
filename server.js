'use strict';

// ----------------- Kosntanten und Variabelen -----------------
const port = 2000;
let portfolioRev = '';
let portfolioToHD = '';
let portfolioFromHD = '';

const DB_STOCKS = 'stocks';
const DB_PORTFOLIO = 'portfolio';

const paths = {
    beStoreStockReq: '/store_stock',
    feGetStocks: '/get_stocks',
    feStorePortfolio: '/store_Portfolio',
    feGetPortfolio: '/get_Portfolio',
    portfolioToFile: './datafiles/portfolio.log',
    beExportDB: '/export_db',
    DBToFile: './datafiles/stocks_export.log',
    beBackUpPortfolio: '/backUpPortfolio',
    get accessLog() {
        return `logs/access_${new Date().toLocaleDateString()}_${new Date().getHours()}.log`
    }
}

// Modulen einbinden
const colors = require('colors');
const fs = require('fs');
const express = require('express');
const res = require('express/lib/response');
const { resolve } = require('path');
const server = express();

// DATENBANK
const db = require('nano')('http://admin:Patoduck2804@localhost:5984').db;

// ----------------- Server hochfahren -----------------
server.use(express.static('public', { extensions: ['html'] }));


// ----------------- Middleware -----------------
server.use(express.json());

// ----------------- Routen -----------------

// Anfrage FE um Portfolio auszulesen aus DB / HD

server.post(paths.feGetPortfolio, (request, response) => {

    return new Promise((resolve, reject) => {
        fs.readFile(
            paths.portfolioToFile,
            (err, loadedContent) => {
                if (err) portfolioFromHD = '';
                else {
                    portfolioFromHD = JSON.parse(loadedContent.toString());
                    response.send(JSON.stringify(portfolioFromHD))

                }
            }
        )
    })
})

// Anfrage FE um Portfolio in DB / HD zu speichern

server.post(paths.feStorePortfolio, (request, response) => {

    let portfolio = request.body;
    portfolioToHD = portfolio

    saveToHD(portfolioToHD, portfolioToHD);

    response.send(JSON.stringify('Portfolio to HD done'))

})

// Anfrage FE um Aktien auszulesen aus DB

server.post(paths.feGetStocks, (request, response) => {

    db.use(DB_STOCKS)
        .find({
            selector: {
                date: setDate(1, 0)
            }
        }).then(res => res.docs)
        .then(stockList => response.send(JSON.stringify(stockList)))
        .catch(err => console.log('err', err))
})

// Anfrage BE um Aktien zu speichern in DB

server.post(paths.beStoreStockReq, (request, response) => {

    let stockList = request.body;

    db.use(DB_STOCKS)
        .insert(stockList)
        .then(response => console.log('in de DB: ', response))
        // .then(response => response.send(JSON.stringify('StokList in DB OK'))))
        .catch(
            err => {
                console.log(err);
                response.send('{"status": "unOK"}');
            }
        )
})

// Anfrage BE um DB zu exportieren nach HD

server.get(paths.beExportDB, (request, response) => {

    console.log('here');
    db.use(DB_STOCKS).list({
        include_docs: true
    }).then(
        antwort => antwort.rows.map(row => row.doc)
    ).then(
        antwort => saveToHD(dBToHD, antwort)
    )
})
/**
 * Anfrage BE um Portfolio zu sichern in DB
 * ACHTUNG 18 FEB 2022 FUNKTIONIERT NOCH NICHT
 */

server.post(paths.beBackUpPortfolio, (request, response) => {

    let portfolio = request.body;
     console.log('portfolio', portfolio);
     
    db.use(DB_PORTFOLIO) // Auf bestehende DB zugreifen
        .then(
            portfolio => {
                console.log('writing');

                return Promise.all(DB_PORTFOLIO.map((el, index) => {
                    delete el._rev;
                    return portfolio.insert(el)
                }))
            } // Daten in DB sichern
        ).then(
            () => res.send(JSON.stringify({
                status: 'ok',
                msg: 'DB imported'
            }))

        ).catch(
            console.log
        )

            }
)
  

// ----------------- Funktionen -----------------

/* Ich konnte nicht so einfach diese Funktion aus methoden.js einbinden,
deswegen hier wiederholt
*/
const setDate = (daysBack, monthsBack) => {
    const date = new Date;

    let month = (date.getMonth() + 1 - monthsBack).toString();
    if (month.length < 2) month = '0' + month;

    let day = (date.getDate() - daysBack).toString();
    if (day.length < 2) day = '0' + day;

    return `${date.getFullYear()}-${month}-${day}`;
}

// Datei nach HD exportieren
const saveToHD = (url, file) => {
    console.log('now hwre');
    fs.writeFile(
        url,
        JSON.stringify(file),
        err => {
            if (err) console.log(err);
        }
    )
}

// Pruefen ob gewuenshgte DB existiert

const connectToDB = (DB_NAME) => {
    db.list().then(res => {
        if (!res.includes(DB_NAME)) console.log(`${DB_NAME} not existing`)
        // if (!res.includes(DB_NAME)) return db.create(dbName);
    }).catch(
        console.log
    )
}

// Front-End hochfahren
const startServerListner = () => {

    server.listen(port, err => console.log(err || `Server OK:  ${port}`.green));
}

// ----------------- Initialisieren -----------------

const init = () => {

    // Front-End hochfahren
    startServerListner();

    // Datenbank initialisieren
    connectToDB(DB_STOCKS);
    connectToDB(DB_PORTFOLIO);
}

init();