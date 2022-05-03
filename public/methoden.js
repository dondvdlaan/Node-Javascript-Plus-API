'use strict';
const methoden = {

    // Diese Funktion passt das Format an an Angabe Broker, sprich XXXX-XX-XX
    setDate(daysBack, monthsBack) {
        const date = new Date;

        let month = (date.getMonth() + 1 - monthsBack).toString();
        if (month.length < 2) month = '0' + month;

        let day = (date.getDate() - daysBack).toString();
        if (day.length < 2) day = '0' + day;

        return `${date.getFullYear()}-${month}-${day}`;
    },
    
    // Nicht verwendet
    generateRandomNumber(min, max) {
        return Math.floor((Math.random() * ((max - min) + 1)) + min);
    }
}
export default methoden
export let setDate = methoden.setDate
export let generateRandomNumber = methoden.generateRandomNumber