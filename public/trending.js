'use strict';
// import dom, { $, createNewElement } from './dom.js';
import dom, { $ } from './dom.js';

/**
 * Balkendarstellung als Aktietrend ist übernommen aus dem JSkurs und
 * angepasst.
 * @param {*} stock : Aktie mit Trendarray wird unterbreitet aus Index.js
 */
const trending = (stock) => {

    // VARIABLEN / KONSTANTEN
    const WIDTH = 345;
    const HEIGTH = 195;

    let domTrending;
    let color =' hsl(179, 85%, 50%)';


    // FUNKTIONEN
    // deklarative Schleife als Alternative zu einer For-Schleife
    const loop = (iterations, myFunction) => {
        for (let i = 0; i < iterations; i++) {
            myFunction(i);
        }
    }

    // Alle notwendigen DOM-Elemente heraussuchen und in jeweils eine Variable schreiben
    const mapDOM = () => {
        domTrending = $('#trending');
    }

    // Diagram zeichnen
    const renderDiagram = (c, data, padding = 2, margin = 10) => {
        const ctx = c.getContext('2d');

        // Canvas leer machen bevor naeste Trenddarstellung
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.fillStyle = color;

        // Breite eines einzelnen Balkens
        const wBar = (c.width + padding - (margin * 2)) / data.length;
        const hBar = c.height - (margin * 2);

        // höchster Datensatz
        let max = -Infinity;
        loop(data.length, index => {
            if (data[index] > max) max = data[index];
        })

        loop(data.length, index => {

            ctx.fillRect(
                wBar * index + margin,
                c.height - margin,
                wBar - padding,
                -(hBar / max * data[index])
            )
        })
    }

    // Initialisierung
    const init = () => {
        mapDOM();

        // Anstossen Trending
        renderDiagram(domTrending, stock);

    }

    // INIT
    init();

}


export default trending;
