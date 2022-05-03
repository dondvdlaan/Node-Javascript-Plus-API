'use strict';
import dom, { $, createNewElement } from './dom.js';
import trending from './trending.js';
import methoden, { setDate } from './methoden.js';


// ----------------- Konstaten und Variabelen -----------------
// Uebrschrift Table
const STOCK_NAME = 'Aktien';
const STOCK_TICKER = 'Symbol';
const STOCK_VALUE = 'Marktwert';
const STOCK_BUYING_VALUE = 'Kaufwert';
const STOCK_BUYING_DATE = 'Kaufdatum';
const STOCK_YIELD_SYMBOL = '  %  ';
const STOCK_TOTAL = 'Gesamtwert';
const STOCK_SELLING = 'Verkaufen';
const STOCK_SELLING_SYMBOL = 'V';
const CURRENCY = 'USD'

const STOCK_VALUE_DATE = 'Datum';

// ROUTEN
const paths = {
    getStocks: '/get_stocks',
    storePortfolio: '/store_Portfolio',
    getPortfolio: '/get_Portfolio'
}

// Variabelen
const domElements = [];
let stockList = [];
let portfolio = [];

// ----------------- Funktionen -----------------
// Berechnen Portfolio Total und Rendite
const calculateTotals = () => {
    let totalValue = 0;
    let totalMarketValue = 0;

    for (const stockP of portfolio) {
        totalValue += stockP.buyingValue * stockP.quantity;

        console.log('stockP.buyingValue ', stockP.buyingValue);

        for (const stockS of stockList) {
            if (stockS.ticker == stockP.ticker) {
                totalMarketValue += stockS.trend[0] * stockP.quantity;;
            }
        }
    }

    domElements.lblTotalPortfolio.innerHTML = financial(totalValue);
    domElements.lblYield.innerHTML = financial(((totalMarketValue - totalValue) / totalValue) * 100);
    domElements.lblCurrency.innerHTML = CURRENCY;
}
const sellStock = (evt) => {
    let stockSelected = evt.currentTarget;

    // Entfernen gewaelte Aktie
    portfolio = portfolio.filter(el => !(el.id == stockSelected.id))

    storePortfolioInToDB(portfolio);

    displayPortfolio();
}

const displayPortfolio = () => {

    // Table erst leeren
    let currentList = dom.$$('tr.trowPortfolio');

    for (let row of currentList) {
        row.remove();
    }

    // Aktualisieren Totalen
    calculateTotals();

    // Erzeugen Kopf Table, erst ueberpruefen ob schon ausgegeben ist
    if (!domElements.domTRHeaderPortfolio) {
        domElements.domTRHeaderPortfolio = createNewElement({ type: 'tr', parent: domElements.domTableDisplayPortfolio });
        createNewElement({ type: 'th', content: STOCK_NAME, parent: domElements.domTRHeaderPortfolio });
        createNewElement({ type: 'th', content: STOCK_TICKER, parent: domElements.domTRHeaderPortfolio });
        createNewElement({ type: 'th', content: STOCK_BUYING_VALUE, parent: domElements.domTRHeaderPortfolio });
        createNewElement({ type: 'th', content: STOCK_BUYING_DATE, parent: domElements.domTRHeaderPortfolio });
        createNewElement({ type: 'th', content: STOCK_VALUE, parent: domElements.domTRHeaderPortfolio });
        createNewElement({ type: 'th', content: STOCK_YIELD_SYMBOL, parent: domElements.domTRHeaderPortfolio });
        createNewElement({ type: 'th', content: STOCK_TOTAL, parent: domElements.domTRHeaderPortfolio });
        createNewElement({ type: 'th', content: STOCK_SELLING, parent: domElements.domTRHeaderPortfolio });
    }
    // Fuellen Liste

    for (let stock of portfolio) {

        let domTRPortfolio = createNewElement({ id: stock.id, type: 'tr', parent: domElements.domTableDisplayPortfolio, classes: ['trowPortfolio'] });
        createNewElement({ type: 'td', content: stock.name, parent: domTRPortfolio, classes: ['trowPortfolio'] });
        createNewElement({ type: 'td', content: stock.ticker, parent: domTRPortfolio, classes: ['trowPortfolio'] });
        createNewElement({ type: 'td', content: stock.buyingValue, parent: domTRPortfolio, classes: ['trowPortfolio'] });
        createNewElement({ type: 'td', content: stock.buyingDate, parent: domTRPortfolio, classes: ['trowPortfolio'] });

        // Suchen und zufügen actuelen Wert
        let currentTicker = stock.ticker;
        let stockValue;

        for (let stock of stockList) {
            if (stock.ticker == currentTicker) {
                stockValue = stock.trend[0];
            }
        }
        createNewElement({ type: 'td', content: stockValue, parent: domTRPortfolio, classes: ['trowPortfolio'] });

        // Rendite berechnen
        let stockYield = financial(((stockValue - stock.buyingValue) / stock.buyingValue) * 100);
        createNewElement({ type: 'td', content: `${stockYield}`, parent: domTRPortfolio, classes: ['trowPortfolio'] });

        // Total gekaufte Wert
        let stockTotal = financial((stock.buyingValue * stock.quantity));
        createNewElement({ type: 'td', content: stockTotal, parent: domTRPortfolio, classes: ['trowPortfolio'] });

        // Verkaufknopf zufügen
        domElements.sellStock = createNewElement({ id: stock.id, type: 'td', content: STOCK_SELLING_SYMBOL, parent: domTRPortfolio, classes: ['trowPortfolio', 'sellColor'] });
        domElements.sellStock.addEventListener('click', sellStock);

    }
}
const addToPortfolio = () => {

    let currentStock = {};

    // Eingabefelden aus DOM auslesen und speichern
    currentStock.name = domElements.lblStock.innerHTML,
        currentStock.ticker = domElements.lblTicker.innerHTML;
    currentStock.buyingValue = Number(domElements.lblValue.innerHTML);
    currentStock.buyingDate = setDate(0, 0);
    currentStock.quantity = Number(domElements.inputQuantity.value);
    currentStock.id = portfolio.length + 1;

    // Speichern in Portfolio array und nach DB/HD schreiben
    portfolio.push(currentStock);

    storePortfolioInToDB(portfolio);


    displayPortfolio();

    // Zurücksetzen Eingabefeld
    domElements.inputQuantity.value = 0;
}

// Abrundung Nummern
function financial(x) {
    return Number.parseFloat(x).toFixed(2);
}

// Totalwert gekaufte Aktie
const multiplyTotal = () => {

    domElements.lblTotal.innerHTML =
        financial(Number(domElements.lblValue.innerHTML)
            * Number(domElements.inputQuantity.value));
}

// Daten aus algemeine Aktienlist in Detailanzeige verschieben
const buyStock = (evt) => {
    let stockSelected = evt.currentTarget;
    console.log('evt',evt.currentTarget);

    for (let stock of stockList) {

        if (stock.ticker == stockSelected.id) {

            domElements.lblStock.innerHTML = stock.name;
            domElements.lblTicker.innerHTML = stock.ticker;
            domElements.lblValue.innerHTML = stock.trend[0];
            trending(stock.trend);
        }
    }
}

// Darstellen Aktienliste
const displayStock = (res) => {

    // Table erst leeren
    let currentList = dom.$$('tr.trow');

    for (let row of currentList) {
        row.remove();
    }

    // Erzeugen Kopf Table, erst ueberpruefen ob schon ausgegeben ist
    if (!domElements.domTRHeader) {
        domElements.domTRHeader = createNewElement({ type: 'tr', parent: domElements.domTableDisplay });
        createNewElement({ type: 'th', content: STOCK_NAME, parent: domElements.domTRHeader });
        createNewElement({ type: 'th', content: STOCK_TICKER, parent: domElements.domTRHeader });
        createNewElement({ type: 'th', content: STOCK_VALUE, parent: domElements.domTRHeader });
    }
    // Fuellen Liste

    // Kontakt ID initialisiern
    for (let stock of stockList) {

        let domTR = createNewElement({ id: stock.ticker, type: 'tr', parent: domElements.domTableDisplay, classes: ['trow'] });
        createNewElement({ type: 'td', content: stock.name, parent: domTR, classes: ['trow'] });
        createNewElement({ type: 'td', content: stock.ticker, parent: domTR, classes: ['trow'] });
        createNewElement({ type: 'td', content: stock.trend[0], parent: domTR, classes: ['trow'] });

        // Details ausgeben werden dürfen 
        domTR.addEventListener('mousemove', buyStock);
    }
}

// ----------------- Schnittstelle DB / HD ----------------- 
// Auslesen Portfolio aus DB / HD

const getPortfolioFromDB = () => {

    let init = {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
    }
    fetch(paths.getPortfolio, init)
        .then(response => response.json())
        .then(response => portfolio = response.portfolio)
        // .then(response=> console.log('van db: :', response))
        .then(displayPortfolio)
}

// Ablegen Portfolio in DB / HD

const storePortfolioInToDB = (portfolio) => {

    let init = {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ portfolio })
    }
    fetch(paths.storePortfolio, init)
        .then(response => response.json())
    // .then(res=> console.log('van db: :', res))
}

// Auslesen Aktienliste aUs DB

const getStocksFromDB = () => {

    let init = {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
    }
    fetch(paths.getStocks, init)
        .then(response => response.json())
        .then(response => stockList = response[0].stockList)
        // .then(res => console.log('van db: :', res))
        .then(displayStock)
}
// ----------------- AUSLESEN DOM ELEMENTEN -----------------

const getDomElements = () => {
    // Portfolio anzeigen
    domElements.domTableDisplayPortfolio = $('#tblDisplayPortfolio');
    domElements.domTRHeaderPortfolio = '';

    // Totalen Portfolio anzeigen
    domElements.lblTotalPortfolio = $('#totalPortfolio');
    domElements.lblYield = $('#yield');
    domElements.lblCurrency = $('#currency');


    // Aktien anzeigen
    domElements.domTableDisplay = $('#tblDisplay');
    domElements.domTRHeader = '';

    // Aktie kaufen
    domElements.lblStock = $('#stock');
    domElements.lblTicker = $('#ticker');
    domElements.lblValue = $('#value');
    domElements.inputQuantity = $('#quantity');
    domElements.lblTotal = $('#total');
    domElements.btnConfirmation = $('#confirmation');


    // Eventlistners
    domElements.inputQuantity.addEventListener('click', multiplyTotal);
    domElements.btnConfirmation.addEventListener('click', addToPortfolio);

    // Testing
    // domElements.retrieveStocksFromDBBTN = $('#retrieveDB');
    // domElements.retrieveStocksFromDBBTN.addEventListener('click', getStocksFromDB);

}
const init = () => {
    getDomElements();
    getStocksFromDB();

    // Verzoegerung weil Aktienliste soll bevor Portfolio erscheinen
    setTimeout(() => {
        getPortfolioFromDB();
    }, 500);
}

init();