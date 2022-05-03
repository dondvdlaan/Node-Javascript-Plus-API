'use strict';
import dom, { $, createNewElement } from './dom.js';
import stockListTestData from './testdata.js';
import tickers from './tickers.js';
import methoden, { setDate } from './methoden.js';

// ----------------- Konstanten und Variabelen -----------------
// POLYGON IO
const path_PIO =
    'https://api.polygon.io/v2/aggs/ticker/F/range/1/day/2020-07-22/2021-07-22?adjusted=true&sort=asc&limit=120&apiKey=O9kATVs3lDQndKLjOAij59qAl5zgKzID';

const path = 'https://api.polygon.io/v2/aggs/ticker/';

const timeRangeRaw =
    '/range/1/day/2022-01-10/2022-02-10?adjusted=true&sort=desc&limit=4999&apiKey=';

const range1day = '/range/1/day/';
const rangeRemainder = '?adjusted=true&sort=desc&limit=4999&apiKey='
const separator = '/'
const startTrendDate = setDate(0, 1);
const endTrendDate = setDate(1, 0);
const timeRange = range1day + startTrendDate + separator + endTrendDate + rangeRemainder;

const key = 'O9kATVs3lDQndKLjOAij59qAl5zgKzID'

// To Server
const pathToServer = {
    storeStock: '/store_stock',
    exportDB: '/export_db',
    backUpPortfolio: '/backUpPortfolio',
    getPortfolio: '/get_Portfolio',
}

// Algemein
const domElements = {};
let stockList = [];
let portfolio = [];

// ----------------- FUNKTIONEN -----------------

// Anfragezeile an Broker zusammenbauen; Nur Tageswerten stehen verfügbar umsonst
const getPath = (ticker) => {
    console.log(ticker.ticker);
    return path + ticker.ticker + timeRange + key;
}

// Vorebereiten jeder individuele Aktie
const prepareData = (rawStock, ticker) => {

    const stock = {
        name: ticker.name,
        ticker: rawStock.ticker,

        // Nur Aktiewert am Ende des Tages brauchen wir (closing)
        trend: rawStock.results.map(el => el.c)
    };

    return stock;
}
/**
 * Funktion um Aktien abzufragen bei Broker
 * @returns 
 */
const getStockData = (counter) => {

    fetch(getPath(tickers[counter]))
        .then(response => response.json()
        )
        .then(rawStock => {

            // Aktie aufbereiten
            let stock = prepareData(rawStock, tickers[counter]);

            // Aktie an Aktienlist zufügen
            stockList.push(stock);
        })
        .catch(err => console.log(err));

}
/* 
Nach Angabe des Brokers, können maximal 5 Anrufen / min ackzeptiert werden,
also diese Funktion ruft die getStockData Funktion jede 15 s auf
*/
function stockDownLoadSequence(nrOfStockToDownload, DownloadDuration) {

    let counter = nrOfStockToDownload;

    return new Promise((resolve, reject) => {

        const countDownloads = () => {

            counter--;
            console.log('counter: ', counter);

            getStockData(counter);

            if (counter == 0) {
                resolve('done');
                clearInterval(intervalDownloads);
            }
        }

        const intervalDownloads = setInterval(countDownloads, DownloadDuration * 1000)
    })

}

// Abfragen und speichern Aktienliste
const loadStocks = () => {

    const DownloadDuration = 15;
    let nrOfStockToDownload = tickers.length;

    stockDownLoadSequence(nrOfStockToDownload, DownloadDuration)
        .then(() => storeInDB(stockList))

        
    // .then(resolve=> console.log('resolve: ',resolve))

    // setTimeout(
    //     () => storeInDB(stockList),
    //     (nrOfStockToDownload + 1) * DownloadDuration * 1000)

}
// ----------------- Schnittstelle DB / HD ----------------- 
/**
 * Funktion om Aktien in DB zu speichern
 * @param {*} stockList 
 */
const storeInDB = stockList => {

    console.log('Now storing');

    // Struktur Objekt / Datei
    let stockListToStore = {
        date: setDate(1, 0),
        stockList: stockList
    };
    console.log(stockListToStore);

    let init = {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(stockListToStore)
    }

    fetch(pathToServer.storeStock, init)
        .then(response => console.log('Store DB server says: ', response))
        .catch(err => console.log(err));
}
/**
 * Funktion um DB zu exportieren
 */
const exportDB = () => {

    // GET Anfrage
    fetch(pathToServer.exportDB)
        .then(response => console.log('Export DB server says: ', response))
        .catch(err => console.log(err));
}

/**
 * Diese Funktionen um Portfolio zu sichern, ACHTUNG 18 FEB 2022
 * FUNKTIONIEREN NOCH NICHT
 */
const backUpPortfolioToDB = (portfolio) => {

    let init = {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(portfolio)
    }
    // POST Anfrage
    fetch(pathToServer.backUpPortfolio)
        .then(response => console.log('Backup Portfolio server says: ', response))
        .catch(err => console.log(err));
}

const backUpPortfolio = () => {

    // Auslesen Datei von HD
    let init = {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
    }
    fetch(pathToServer.getPortfolio, init)
        .then(response => response.json())
        .then(response => portfolio = response.portfolio)
        // .then(response=> console.log('van db: :', response))
        .then(() => backUpPortfolioToDB(portfolio))
}

// ----------------- DOMElememten ablegen ----------------- 
const getDomElemenst = () => {
    domElements.getStocksBTN = $('#requestStock');
    domElements.getStocksBTN.addEventListener('click', loadStocks);

    domElements.storeStocksBTN = $('#storeStock');
    domElements.storeStocksBTN.addEventListener('click', () => storeInDB(stockList));

    domElements.exportDBBTN = $('#exportDB');
    domElements.exportDBBTN.addEventListener('click', () => exportDB());

    domElements.backUpPortfolioBTN = $('#backUpPortfolio');
    domElements.backUpPortfolioBTN.addEventListener('click', () => backUpPortfolio());
}
// ----------------- Initialisieren ----------------- 
// Anstossen Anwendung
const init = () => {

    getDomElemenst();

    // Automatisch Anstossen Anwendung
    loadStocks();

}

init();