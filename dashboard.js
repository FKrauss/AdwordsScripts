/*
Author: FKrauss
*/

function main() {
  var yourEMAIL = '';
  var spreadsheet = SpreadsheetApp.openById('1UDAqxFGqMlanTeQnD4W01xnDp4mcLmaDLnKEfJdXWRg');
  var spreadsheetlink = spreadsheet.getUrl();
  var report = AdWordsApp.report(
    // for field and schema reference, check https://developers.google.com/adwords/api/docs/appendix/reports#campaign
    // Table Schema: https://developers.google.com/adwords/api/docs/appendix/reports/CAMPAIGN_PERFORMANCE_REPORT.csv 
    'SELECT CampaignName, Date, DayOfWeek, Week, MonthOfYear, Year, '+
    'Slot, ClickType, ' +
    'Device, Impressions, Clicks, ' +
    'Cost, Amount, ConvertedClicks, ConversionsManyPerClick, ConversionValue '+
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE Cost > 0 ' + // this filter is here just to prevent zeroes from showing and eating up the 10k row limit
    'DURING LAST_30_DAYS');
  
  report.exportToSheet(spreadsheet.getSheetByName('data'));
  Logger.log('find your report here: ');
  Logger.log(spreadsheetlink);
  Logger.log('check your mail');
  var today = new Date();
  MailApp.sendEmail(yourEMAIL,today + ': Dashboard Updated with 30 days data','check it out!\n'+spreadsheetlink);
}
