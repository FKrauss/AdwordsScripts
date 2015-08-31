/*
author: FKrauss
Description: you configure as many rules as you want in the spreadsheet and everyday it runs
over them and applies changes so the account complies with your mobile bid adjustment rules.

Inputs for mobile bids based on weekday
*/
function main(){
var spreadsheeturl = "https://docs.google.com/spreadsheets/d/1yBUw_HQXk3TSiTMyDRvhzk7mXibTJ3IJX2Jfj7lXYnE/edit#gid=0";
var sheet = SpreadsheetApp.openByUrl(spreadsheeturl).getSheetByName("Rules");
var sheetLastCol = sheet.getLastColumn();
  
  /*Invert the switch here*/
 //for (var i = 2; i <= sheetLastCol; i++){
 for (var i = sheetLastCol; i >= 1; i--){
    /* starts at 2 because "i" selects the columns and they start at 1, while 1 is the name*/
    var values = sheet.getRange(1,i,10,1).getValues();
    var rule = {name: values[0],
                include: values[1],
                exclude: values[2],
                sunday: Number(values[3]),
                monday: Number(values[4]),
                tuesday: Number(values[5]),
                wednesday: Number(values[6]),
                thursday: Number(values[7]),
                friday: Number(values[8]),
                saturday: Number(values[9]),
               };
    Logger.log("starting rule: "+rule.name);
    applyBidAdjustments(rule);

  }

Logger.log("Done with all the " + (sheetLastCol-1) + " rules");
}


function applyBidAdjustments(rulename) {
var campaignfilter = rulename.include;
var campaignnegfilter = rulename.exclude;
var selector = AdWordsApp.campaigns()
              .withCondition("CampaignName CONTAINS \'"+ campaignfilter+"\'")
              .withCondition("CampaignName DOES_NOT_CONTAIN_IGNORE_CASE \'"+ campaignnegfilter+"\'");

switch (new Date().getDay()) {
    case 0:
        bid = rulename.sunday; //Sunday
        break;
    case 1:
        bid = rulename.monday; // Monday
        break;
    case 2:
        bid = rulename.tuesday; // Tuesday
        break;
    case 3:
        bid = rulename.wednesday; //Wednesday
        break;
    case 4:
        bid = rulename.thursday; //Thursday
        break;
    case 5:
        bid = rulename.thursday; // Friday
        break;
    case 6:
        bid = rulename.saturday; //Saturday
    break;  }

var campaignIterator = selector.get();
  var campaigns = 0
  while(campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var currentMobileBidAdjustment = campaign.targeting().platforms().mobile().get().next();
  /*Invert the switch here*/
      //currentMobileBidAdjustment.setBidModifier(currentMobileBidAdjustment.getBidModifier() + bid);
      currentMobileBidAdjustment.setBidModifier(currentMobileBidAdjustment.getBidModifier() - bid);
      Logger.log(campaign.getName()+" modified to "+ (currentMobileBidAdjustment.getBidModifier()));
   campaigns = campaigns + 1;
   
  }
  Logger.log("Rule Applied to "+campaigns+" campaigns");
}
