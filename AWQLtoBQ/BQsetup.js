/*
author: FKrauss
note: you can comment and uncomment the lines depending on when you run the script

Schedule it to run Daily in order to have a day to day data dump, and make sure you're not exceeding the limits of daily data pushes to BQ



*/



function main(){

  // BQ credentials
  var projectid = "Put your ID here!!";
  var datasetid = "CAMPAIGN_PERFORMANCE_REPORT";
  var tablename = "Adwords_All_Accounts_"+daystamp();
  var sandboxsheetURL = "https://docs.google.com/spreadsheets/d/1LHsZkozg3Sg35hgoH2W4kk9VcK-eHu7gAA9CifZlIGo/edit#gid=0";
  Logger.log(tablename);
  
   //  createDataSet(projectid,datasetid);
     createTable(projectid,datasetid,sandboxsheetURL,tablename);
 
  
 var accountSelector = MccApp.accounts().forDateRange("YESTERDAY")
                       .withCondition("Clicks > 1");
               //       .withIds(['846-084-5661']); // use this line to query specific accounts if they fail

 var accountIterator = accountSelector.get();
 while (accountIterator.hasNext()) {
   var account = accountIterator.next();
   MccApp.select(account);

   importData(projectid,datasetid,tablename);
   
   Logger.log("finished with " + AdWordsApp.currentAccount().getCustomerId() + " - " + AdWordsApp.currentAccount().getName());
 }


  
}


function createDataSet(INSERT_PROJECT_ID_HERE,INSERT_DATASET_ID_HERE) { // DONE!
  // To get your project ID, open the Advanced APIs dialog, click the
  // "Google Developers Console" and select the project number from the
  // Overview page.

  var projectId = INSERT_PROJECT_ID_HERE; //the ID is not a number! it is the string ID of the project

  var dataSetId = INSERT_DATASET_ID_HERE;

  var dataSet = BigQuery.newDataset();
  dataSet.id = dataSetId;
  dataSet.friendlyName = dataSetId;
  dataSet.datasetReference = BigQuery.newDatasetReference();
  dataSet.datasetReference.projectId = projectId;
  dataSet.datasetReference.datasetId = dataSetId;

  dataSet = BigQuery.Datasets.insert(dataSet, projectId);
  Logger.log('Data set with ID = %s, Name = %s created.', dataSet.id,
      dataSet.friendlyName);
}

function createTable(INSERT_PROJECT_ID_HERE,INSERT_DATASET_NAME_HERE,sandbox,INSERT_TABLE_NAME_HERE) { // DONE!!
  // To get your project ID, open the Advanced APIs dialog, click the
  // "Google Developers Console" and select the project number from the
  // Overview page.
var sheet = SpreadsheetApp.openByUrl(sandbox).getSheetByName("schema");
var sheetLastCol = sheet.getLastColumn();
var projectId = INSERT_PROJECT_ID_HERE;
var dataSetId = INSERT_DATASET_NAME_HERE;
var tableId = INSERT_TABLE_NAME_HERE;
var table = BigQuery.newTable();
var schema = BigQuery.newTableSchema();
var allfields = [];
  
 for (var i = 2; i <= sheetLastCol; i++){
 //for (var i = sheetLastCol; i >= 1; i--){
    /* starts at 2 because "i" selects the columns and they start at 1, while 1 is the name*/
    var values = sheet.getRange(1,i,3,1).getValues();
    var field = {description: values[2],
                name: values[0],
                type: values[1]};
   allfields.push(field);

  }
  Logger.log(allfields);

  schema.fields = allfields;

  table.schema = schema;
  table.id = tableId;
  table.friendlyName = "friendly name of the adwords";

  table.tableReference = BigQuery.newTableReference();
  table.tableReference.datasetId = dataSetId;
  table.tableReference.projectId = projectId;
  table.tableReference.tableId = tableId;
  table = BigQuery.Tables.insert(table, projectId, dataSetId);

  Logger.log('Data table with ID = %s, Name = %s created.',
      table.id, table.friendlyName);
}


function importData(projectid,datasetid,tablename) {
  
//    var date_range = 'LAST_30_DAYS';
    var date_range = 'YESTERDAY';
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
                 'ConversionsManyPerClick',
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
      var row = rows.next()
      
      var Date = row[columns[0]] + " 00:00";
      var DayOfWeek = row[columns[1]];
      var AccountDescriptiveName = row[columns[2]];
      var CampaignName = row[columns[3]];
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
 
    csv += '\n' + Date + ',' + accountid + ',' + DayOfWeek + ','  //add the account id to the schema
    + AccountDescriptiveName + ',' + CampaignName + ',' + CampaignId + ','
    + Slot + ',' + ClickType + ',' + Device + ',' + Impressions + ',' + Clicks
    + ',' + Cost + ',' + AveragePosition + ',' + ConvertedClicks
    + ',' + ConversionsManyPerClick + ',' + ConversionValue;
  };
var fileid = DriveApp.createFile(AccountDescriptiveName ,csv, MimeType.CSV).getId();
  
  // Load CSV and convert to the correct format for upload.
  var file = DriveApp.getFileById(fileid);
var data = file.getBlob().setContentType('application/octet-stream');

  // Create the data upload job.
  var job = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectid,
          datasetId: datasetid,
          tableId: tablename
        },
        skipLeadingRows: 1
      }
    }
  };
  job = BigQuery.Jobs.insert(job, projectid, data);
  var jobid = job.id
  
Logger.log("finished with " + AdWordsApp.currentAccount().getCustomerId() +
  " - " + AdWordsApp.currentAccount().getName() +"with jobid =" +jobid);
     file.setTrashed(true);
  
}


function daystamp() {
    var today = new Date();
var dd = today.getDate()-1; //so it gives you the date corresponding to the data, yesterday
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {dd='0'+dd} if(mm<10) {mm='0'+mm}

return today = yyyy+mm+dd;
}

