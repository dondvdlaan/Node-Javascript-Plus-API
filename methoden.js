'use strict';
const methoden = {
    setDate(daysBack, monthsBack) {
        const date = new Date;

        let month = (date.getMonth() + 1 - monthsBack).toString();
        if (month.length < 2) month = '0' + month;

        let day = (date.getDate() - daysBack).toString();
        if (day.length < 2) day = '0' + day;

        return `${date.getFullYear()}-${month}-${day}`;
    },
    
    generateRandomNumber(min, max) {
        return Math.floor((Math.random() * ((max - min) + 1)) + min);
    }
}
