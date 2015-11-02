/*
useful little function to keep you dates in order.

BigQuery organizes the tables using the date "stamp" of yyyyMMDD and 
this function lets you operate those values without any trouble

*/


function daystamp(tim) {
    var today = new Date();
   today.setDate(today.getDate()-tim);
   
var dd = today.getDate(); //so it gives you the day
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {dd='0'+dd} if(mm<10) {mm='0'+mm}

return today = String(yyyy)+String(mm)+String(dd);
}
