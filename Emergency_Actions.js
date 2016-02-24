
var this_label = "CONTAIN_Product-PAUSED";
var description = "Label used to signal which campaigns were paused in an emergency Broken landing pages / etc. handle with care";
var label_color = "red";
var searchparam = "Product"; //not case sensitive

function main(){

 var accountSelector = MccApp.accounts()
                      .forDateRange("LAST 7 DAYS")
                      .withCondition("Cost > 0")
                      .orderBy("Cost");


 var accountIterator = accountSelector.get();
   while (accountIterator.hasNext()) {
    var account = accountIterator.next();
     MccApp.select(account);
     try{
     AdWordsApp.createLabel(this_label, description, label_color);
     } catch(e){ Logger.log(e.message);}; 
   
     
     
/*     // For when you want to do something and label at the end
       var campaigns_to_work_on = AdWordsApp.campaigns()
       .withCondition("Status = ENABLED")
       .withCondition("Name CONTAINS_IGNORE_CASE '"+searchparam+"'")
       .withCondition("LabelNames CONTAINS_NONE  ['"+this_label+"'] ")
       .get();
  */   
     
     // for when you want to undo something and unlabel at the end
      var campaigns_to_work_on = AdWordsApp.campaigns()
       .withCondition("LabelNames CONTAINS_ANY ['"+this_label+"'] ")
       .get();     
 
       
        while (campaigns_to_work_on.hasNext()) {
         //do_something(campaigns_to_work_on.next());
           do_something_else(campaigns_to_work_on.next());  
        }
       
     
   }
  
}





function do_something(campaign){ //send a campaign
 // simple as this PAUSE then APPLY LABEL
  
  campaign.pause();
  
  if(campaign.isPaused()){
  campaign.applyLabel(this_label);
  }
  


}


function campaign_selector(account){

}

function do_something_else(campaign){ //send a campaign
 // simple as this PAUSE then APPLY LABEL
  
  campaign.enable();
  campaign.removeLabel(this_label);


}
