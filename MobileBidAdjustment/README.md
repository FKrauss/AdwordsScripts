These scripts work in conjunction with bid adjustment you set for each campaign/adgroup manually.

Since that, in order to keep everything running smoothly, you got to set up two scripts and run them every day.

So, use the AddBidAdjustment.js to add the mobile bid rules in the morning  (schedule it to run every day at 1 AM) - And hit RUN

And then, use the RevertBidAdjustments.js to, in the end of the day, revert everything to the state set manually. (schedule it to run every day at 11 PM)

All in all these are the steps:
1) schedule the AddBidAdjustment.js to everyday at 1 AM
2) Hit RUN in the AddBidAdjustment.js script
3) schedule the RevertBidAdjustments.js to everyday at 11 PM