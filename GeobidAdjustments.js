function main() {
var sheetid = "https://docs.google.com/spreadsheets/d/1__U7YJPwPtIcJrnZZekgPiykAuOjxaHpZ4DyG0_nGO4/edit#gid=0";
var lastcol = SpreadsheetApp.openByUrl(sheetid).getSheetByName("Rules").getLastColumn();
var locations = getlocations(sheetid);

  for (var i = 3; i <= lastcol; i++) {
    var ruleholder = getrule(i,sheetid);
    
    
    var campaignfilter = ruleholder[1]; 
    var campaignnegfilter = ruleholder[2];
    var selector = AdWordsApp.campaigns()
    .withCondition("CampaignName CONTAINS \'"+ campaignfilter+"\'")
    .withCondition("CampaignName DOES_NOT_CONTAIN_IGNORE_CASE \'"+ campaignnegfilter+"\'");
    
//  we have to use the switch function because unlink mobile bid adjustments, the location ID can either exist, or not
// when it doesn't you need to add them. Instead of evaluating this is left for the PPC manager to know
// Rule of thumb: apply everything as Add first and then switch them to Edit
// When you run addLocation to something that already exists, it does nothing
    var campaignIterator = selector.get();
    switch(String(ruleholder[3])){
      case "Add":
        Logger.log("starting with case Add: "+ruleholder[0]);
        while(campaignIterator.hasNext()) {
          var campaign = campaignIterator.next();
          for (var y = 4; y < locations.length; y++){ 
            campaign.addLocation(Number(locations[y]), Number(ruleholder[y]));
          }
        }
        break;
      case "Edit":
        Logger.log("starting with case Edit: "+ruleholder[0]);
        while(campaignIterator.hasNext()) {
          var campaign = campaignIterator.next();
          for (var y = 4; y < locations.length; y++){ 
            var locationsarray = [];
            locationsarray.push(Number(locations[y]));
            var targetedlocation = campaign.targeting().targetedLocations().withIds(locationsarray).get().next();
            
            targetedlocation.setBidModifier( 1 + Number(ruleholder[y]));  
          }
        }
        break;
        
        
        
    } //swith close 
  } //for closing
} // main closing
  
  
  
// this functions is used iteratively to go through all the rules, one by one, and grab their details before implementing them
function getrule(column,id) {
  var rulesspreaddsheet = SpreadsheetApp.openByUrl(id).getSheetByName("Rules");
  var thisrule = rulesspreaddsheet.getRange(1,column, rulesspreaddsheet.getLastRow() ,1).getValues();
  return thisrule
}

// this functions gets, from the spreadsheet  the array of location ids (Column B)
function getlocations(id){
var rulesspreaddsheet = SpreadsheetApp.openByUrl(id).getSheetByName("Rules");
var criterialist = rulesspreaddsheet.getRange(1,2,rulesspreaddsheet.getLastRow(),1).getValues();
                                             
return criterialist
}
