/*
I still need to tidy this up. It's cluttered and not working in the last stage (the import phase)
*/

function main() {
  
  var projectid = "fluted-current-91116";
  var datasetid = "CAMPAIGN_PERFORMANCE_REPORT";
  var tablename = "Brazil_Flights";
  var sandboxsheetURL = "https://docs.google.com/spreadsheets/d/1LHsZkozg3Sg35hgoH2W4kk9VcK-eHu7gAA9CifZlIGo/edit#gid=0";

   
//  createDataSet("fluted-current-91116","CAMPAIGN_PERFORMANCE_REPORT"); //use this only once!
//  createTable(projectid,datasetid,sandboxsheetURL,tablename);
  importData(projectid,datasetid,tablename,sandboxsheetURL);
  
  
}



function importData(INSERT_PROJECT_ID_HERE,INSERT_DATASET_NAME_HERE,INSERT_TABLE_NAME_HERE,sandbox){ // WORK IN PROGRESS!!!
  // To get your project ID, open the Advanced APIs dialog, click the
  // "Google Developers Console" and select the project number from the
  // Overview page.

  var projectId = INSERT_PROJECT_ID_HERE;
  var dataSetId = INSERT_DATASET_NAME_HERE;
  var tableId = INSERT_TABLE_NAME_HERE;
  var sizeoftable = SpreadsheetApp.openByUrl(sandbox).getSheetByName("data").getLastColumn();
  var numofrows = SpreadsheetApp.openByUrl(sandbox).getSheetByName("data").getLastRow();
  var headers = SpreadsheetApp.openByUrl(sandbox).getSheetByName("data").getRange(1,1,1,sizeoftable).getValues();
  headers = headers[0];
  var insertAllRequest = BigQuery.newTableDataInsertAllRequest();
  insertAllRequest.rows = [];
  
 for (var i = 2; i <= numofrows; i++){
   var newrow = BigQuery.newTableDataInsertAllRequestRows();
   var values = SpreadsheetApp.openByUrl(sandbox).getSheetByName("data").getRange(i,1,2,sizeoftable).getValues();
   values = values[0];
   newrow.insertId = i-1;
   var datapoints = [];
   var myobject = {}
   for (var y = 1; y <= sizeoftable; y++){ 
     var newpair = headers[y-1];
     myobject[newpair] = values[y-1];
   }

   newrow.json = JSON.stringify(myobject);
   insertAllRequest.rows.push(newrow);

  }     
  
  Logger.log(insertAllRequest.rows);
  BigQuery.Tabledata.insertAll(insertAllRequest, projectId, dataSetId, tableId);
  Logger.log(projectId + "."+dataSetId+"."+tableId);
  Logger.log('Data inserted.');
}

function getreport(){ // WORK IN PROGRESS!!!

  /*  var report = AdWordsApp.report(
    'SELECT CampaignName, Date, DayOfWeek, Week, MonthOfYear, Year, '+
    'Slot, ClickType, ' +
    'Device, Impressions, Clicks, ' +
    'Cost, Amount, ConvertedClicks, ConversionsManyPerClick, ConversionValue '+
    'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
    'WHERE Cost > 0 ' + // this filter is here just to prevent zeroes from showing and eating up the 10k row limit
    'DURING LAST_30_DAYS'); */


}


function createDataSet(INSERT_PROJECT_ID_HERE,INSERT_DATASET_ID_HERE) { // DONE!
  // To get your project ID, open the Advanced APIs dialog, click the
  // "Google Developers Console" and select the project number from the
  // Overview page.

  var projectId = INSERT_PROJECT_ID_HERE; //the ID is not a number! it is the string ID of the project

  var dataSetId = INSERT_DATASET_ID_HERE;

  var dataSet = BigQuery.newDataset();
  dataSet.id = dataSetId;
  dataSet.friendlyName = 'CAMPAIGN_PERFORMANCE_REPORT_Test1';
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
