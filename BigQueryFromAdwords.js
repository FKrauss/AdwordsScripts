function main(){
  
  // BQ credentials
  var country = "Brazil" //what's the name of your country?
  var projectid = "fluted-current-91116";
  var datasetid = "CAMPAIGN_PERFORMANCE_REPORT";
  var tablename = country+"_All_Accounts";
  var sandboxsheetURL = "https://docs.google.com/spreadsheets/d/1LHsZkozg3Sg35hgoH2W4kk9VcK-eHu7gAA9CifZlIGo/edit#gid=0";

   //  createDataSet("fluted-current-91116","CAMPAIGN_PERFORMANCE_REPORT");
   //  createTable(projectid,datasetid,sandboxsheetURL,tablename);
 
  
 var accountSelector = MccApp.accounts()
    .withCondition("Name CONTAINS '"+country+"'")

 var accountIterator = accountSelector.get();
 while (accountIterator.hasNext()) {
   var account = accountIterator.next();
   MccApp.select(account)

   importData(projectid,datasetid,tablename);
   
   Logger.log("finished with " + AdWordsApp.currentAccount().getCustomerId());
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
  dataSet.friendlyName = 'CAMPAIGN_PERFORMANCE_REPORT';
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
  
    var date_range = 'LAST_30_DAYS';
//    var date_range = 'YESTERDAY';
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
  var columns_str = columns.join(', ');
  var accountid = AdWordsApp.currentAccount().getCustomerId();
  
  var report = AdWordsApp.report(
    'SELECT ' + columns_str + " " +
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
      var Impressions = row[columns[8]];
      var Clicks = row[columns[9]];
      var Cost = row[columns[10]];
      var AveragePosition = row[columns[11]];
      var ConvertedClicks = row[columns[12]];
      var ConversionsManyPerClick = row[columns[13]];
      var ConversionValue = row[columns[14]];
 
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
  Logger.log('Load job started. Check on the status of it here: ' +
      'https://bigquery.cloud.google.com/jobs/%s', projectid);
  file.setTrashed(true);
  
}