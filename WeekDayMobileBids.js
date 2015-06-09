/*
author: FKrauss

Inputs for mobile bids based on weekday
*/


function main() {
var campaignfilter = "DEST";  // add the terms the account must have to get the adjustments
var campaignnegfilter = "App"; // add the term the account must not have to get the adjustments
var selector = AdWordsApp.campaigns()
              .withCondition("CampaignName CONTAINS \'"+ campaignfilter+"\'")
              .withCondition("CampaignName DOES_NOT_CONTAIN_IGNORE_CASE \'"+ campaignnegfilter+"\'");

switch (new Date().getDay()) {
    case 0:
        bid = 0.1; //Sunday
        break;
    case 1:
        bid = -0.3; // Monday
        break;
    case 2:
        bid = 0.2; // Tuesday
        break;
    case 3:
        bid = -0.3; //Wednesday
        break;
    case 4:
        bid = -0.3; //Thursday
        break;
    case 5:
        bid = -0.3; // Friday
        break;
    case 6:
        bid = 0.1; //Saturday
    break;  }

var campaignIterator = selector.get();
  while(campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var MobileBidAdjustment = campaign.targeting().platforms().mobile().get().next();
      MobileBidAdjustment.setBidModifier(1+bid);
      Logger.log(campaign.getName()+" modified to "+ (1+bid)*100 +"%");
  }
}
