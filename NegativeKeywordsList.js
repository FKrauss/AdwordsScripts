/*
Author: FKrauss

Script  created to facilitate the management of our Gentleman's agreement
It requires all accounts and campaigns to have a similar naming structure

The list of Keywords sits in a trix - https://docs.google.com/spreadsheets/d/18BMkkQh2IuzXUauaU9yb-1iCRv7TFO_rIYxrfphVQnM/edit#gid=0

Adwords fetches those keywords and adds them to each campaign in NEGATIVE KeyWords
*/


function main() {
  var SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/18BMkkQh2IuzXUauaU9yb-1iCRv7TFO_rIYxrfphVQnM/edit#gid=0";
  var spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  var excludeCampaignIfcontains = spreadsheet.getSheetByName('config').getRange("B1").getValue();
  var sheet = spreadsheet.getSheetByName('export');
  var lastRow = sheet.getLastRow();
  var data = sheet.getRange(2,1,lastRow-1,1).getValues();
  Logger.log(data);
  var campaignIterator = AdWordsApp.campaigns().withCondition("Status = ENABLED").get();

   // while there is another campaign on the line, it runs the function
while (campaignIterator.hasNext()) {
  var currentcampaign = campaignIterator.next();
  
  // if the campaign name contains what you asked to filter, it does nothing to it
  // and jumps to the next campaign
  
  if (currentcampaign.getName().indexOf(excludeCampaignIfcontains) > -1)
  
  // Logs the reason why it wasn't processed and moves on
  { Logger.log(currentcampaign.getName() + ' was excluded because of the filter: '+excludeCampaignIfcontains);
   continue;}
  
  else {
     Logger.log(currentcampaign.getName() + ' started');
     // this for loop iterates all the Negative Keywords in the list,
     // adding them to the current selected campaign
     for (i = 0 ; i <= lastRow-2; i++){
     var kw = String(data[i]);
     var negkw = kw.substring(0, kw.length);
     // if you want to fork this, keep in mind that you need to cast the data[i] as a string for the method to work
     currentcampaign.createNegativeKeyword(negkw);
     Logger.log(negkw);
     }
  // tells you how many negative keywords were added to the campaign
  Logger.log(currentcampaign.getName() + ' finished, with ' + data.length + ' keywords added');
      
   } //else closing
  } // while closing
} //main closing

