/*
Author: FKrauss

example spreadsheet can be found here: https://docs.google.com/spreadsheets/d/1DOjJ1VZYQ2huoOLw1oUr3quTPez15P6H8p6SueVjcH8/edit#gid=1664534065&vpid=A1
make a copy, get the spreadsheet URL and have fun ;)
*/

function main() {
  var yourEMAIL = '';
  var spreadsheet = SpreadsheetApp.openById('1DOjJ1VZYQ2huoOLw1oUr3quTPez15P6H8p6SueVjcH8');
  var spreadsheetlink = spreadsheet.getUrl();
  var report = AdWordsApp.report(
    // for field and schema reference, check https://developers.google.com/adwords/api/docs/appendix/reports#campaign
    // Table Schema: https://developers.google.com/adwords/api/docs/appendix/reports/CAMPAIGN_PERFORMANCE_REPORT.csv 
    'SELECT CampaignName, Date, DayOfWeek, Week, MonthOfYear, Year, '+
    'Slot, ClickType, ' +
    'Device, Impressions, Clicks, ' +
    'Cost, Amount, ConvertedClicks, Conversions, ConversionValue '+
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
