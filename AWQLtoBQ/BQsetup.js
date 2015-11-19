/*
author: FKrauss
note: you can comment and uncomment the lines depending on when you run the script

This script was designed to make sure ALL the accounts are uploaded to BigQuery.
Put it to run hourly and you shouldn't have problems

*/

var projectidnum = "YOUR_PROJECT_NUMBER"; //found on the cloud.google.com console for the project
var projectid = "String_PROJECT_ID"; //also in the cloud.google.com console
var datasetid = "CAMPAIGN_PERFORMANCE_REPORT";
var tablehandle = "Adwords_All_Accounts_"
var daterange = daystamp(1);
//var daterange = "20151111";
var tablename = tablehandle + daterange;
var sandboxsheetURL = "SPREADSHEET_WITH_SCHEMA"; //it is used to create the daily table. this is how it looks like: 
// https://docs.google.com/spreadsheets/d/1LHsZkozg3Sg35hgoH2W4kk9VcK-eHu7gAA9CifZlIGo/edit#gid=0


function main(){

  try{createTable(tablename);}
  catch(e){Logger.log(e.message)}

  try{var accounts = getprocessedAccounts();}
  catch(e){ // if the table doesn't exist, it will throw an error, thus you need to create an empty array to be evaluated against
    var accounts = [];
    Logger.log(e.message)}

var accountSelector = MccApp.accounts()
                      .forDateRange(daterange,daterange) //use this one for specific dates
                      .withCondition("Impressions > 0")
                      .orderBy("Cost DESC");

 var accountIterator = accountSelector.get();
   while (accountIterator.hasNext()) {
    var account = accountIterator.next();
     MccApp.select(account);
     if (accounts.indexOf(AdWordsApp.currentAccount().getCustomerId()) <= -1){
       importData(tablename); }
   }
  
}


function daystamp(tim) {
    var today = new Date();
   today.setDate(today.getDate()-tim);
   
var dd = today.getDate(); //so it gives you the day
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {dd='0'+dd} if(mm<10) {mm='0'+mm}

return today = String(yyyy)+String(mm)+String(dd);
}

function importData(tablename_) {
  
  var date_range =  daterange +','+ daterange;
  var columns = ['Date',
                 'DayOfWeek',
                 'AccountDescriptiveName',
                 'CampaignName',
                 'CampaignId',
                 'Slot',
                 'ClickType',
                 'Device',
                 'Impressions',
                 'Clicks',
                 'Cost',
                 'AveragePosition',
                 'ConvertedClicks',
                 'Conversions',
                 'ConversionValue'];
  var columns_str = "Date,accountid,DayOfWeek,AccountDescriptiveName,CampaignName,CampaignId,Slot,ClickType,Device,Impressions,Clicks,Cost,AveragePosition,ConvertedClicks,ConversionsManyPerClick,ConversionValue"
  var accountid = AdWordsApp.currentAccount().getCustomerId();
  var report = AdWordsApp.report(
    'SELECT ' + columns.join(",") + " " +
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'DURING ' +date_range);
    var csv = columns_str;
    var rows = report.rows();
     while (rows.hasNext()) {
      var row = rows.next();
      var Date = row[columns[0]] + " 00:00";
      var DayOfWeek = row[columns[1]];
      var AccountDescriptiveName = row[columns[2]].replace(/,/g);
      var CampaignName = row[columns[3]].replace(/,/g);
      var CampaignId = row[columns[4]];
      var Slot = row[columns[5]];
      var ClickType = row[columns[6]];
      var Device = row[columns[7]];
      var Impressions = row[columns[8]].replace(",","");
      var Clicks = row[columns[9]].replace(",","");
      var Cost = row[columns[10]].replace(",","");
      var AveragePosition = row[columns[11]].replace(",","");
      var ConvertedClicks = row[columns[12]].replace(",","");
      var ConversionsManyPerClick = row[columns[13]].replace(",","");
      var ConversionValue = row[columns[14]].replace(",",""); 
    csv += '\n' + Date + ',' + accountid + ',' + DayOfWeek + ','
    + AccountDescriptiveName + ',' + CampaignName + ',' + CampaignId + ','
    + Slot + ',' + ClickType + ',' + Device + ',' + Impressions + ',' + Clicks
    + ',' + Cost + ',' + AveragePosition + ',' + ConvertedClicks
    + ',' + ConversionsManyPerClick + ',' + ConversionValue;
  }; //while close
  
    // Load CSV and convert to the correct format for upload.
var fileid = DriveApp.createFile(AccountDescriptiveName ,csv, MimeType.CSV).getId();
var file = DriveApp.getFileById(fileid);
var data = file.getBlob().setContentType('application/octet-stream');

  // Create the data upload job.
  var job = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectid,
          datasetId: datasetid,
          tableId: tablename_
        },
        skipLeadingRows: 1
      }
    }
  };
  job = BigQuery.Jobs.insert(job, projectid, data);
  var jobid = job.id;
  Logger.log(jobid +" from account "+ AdWordsApp.currentAccount().getName());


  file.setTrashed(true); 
}

function getprocessedAccounts(){
  
var fullTableName = projectidnum + ':' + datasetid + '.' + tablename;
  var queryRequest = BigQuery.newQueryRequest();
  queryRequest.query = 'select accountid from ' + fullTableName + ' group by 1';
  var query = BigQuery.Jobs.query(queryRequest, projectidnum);

  if (query.jobComplete) {
    var values = [];
    for (var i = 0; i < query.rows.length; i++) {
      var row = query.rows[i];
      
      for (var j = 0; j < row.f.length; j++) {
        values.push(row.f[j].v);
      }
      
    }
  }
return values

}

function createTable(INSERT_TABLE_NAME_HERE) { 
var sheet = SpreadsheetApp.openByUrl(sandboxsheetURL).getSheetByName("schema");
var sheetLastCol = sheet.getLastColumn();
var table = BigQuery.newTable();
var schema = BigQuery.newTableSchema();
var allfields = [];
 for (var i = 2; i <= sheetLastCol; i++){
    /* starts at 2 because "i" selects the columns and they start at 1, while 1 is the name*/
    var values = sheet.getRange(1,i,3,1).getValues();
    var field = {description: values[2],
                name: values[0],
                type: values[1]};
   allfields.push(field);
  }
  schema.fields = allfields;
  table.schema = schema;
  table.id = INSERT_TABLE_NAME_HERE;
  table.friendlyName = "Adwords Campaign Performance Data";
  table.tableReference = BigQuery.newTableReference();
  table.tableReference.datasetId = datasetid;
  table.tableReference.projectId = projectid;
  table.tableReference.tableId = INSERT_TABLE_NAME_HERE;
  table = BigQuery.Tables.insert(table, projectid, datasetid);
}


