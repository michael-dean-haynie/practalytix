var moment = require('moment-timezone');
var helpers = require('../helpers');

exports.model = function AnalyticsViewModel(sessions, activities){
  this.sessions = sessions;
  this.availableActivities = activities;

  // totals
  this.getTotalSessionCount = function(){
    return this.sessions.length;
  }

  this.getTotalSessionDuration = function(){
    var totalSec = this.sessions.length ? this.sessions.map(s => s.timeDetails.durationInSec).reduce((a,b) => a+b) : 0;
    return helpers.formatAsStopWatch(totalSec);
  }

  this.getTotalActivityDuration = function(){
    activityDurations = {};
    for (var i = 0; i < this.availableActivities.length; i++){
      var aa = this.availableActivities[i];

      var secDur = this.sessions.length
        ? this.sessions.map(
          s => s.blocks.length 
            ? s.blocks.map(b => b.activity.name == aa.name ? b.timeDetails.durationInSec : 0).reduce((a,b)=>a+b)
            : 0
        ).reduce((a,b)=>a+b) 
        : 0
      ;

      activityDurations[aa.name] = Math.round(100*(secDur/60/60))/100;//secDur/60/60;

    }
    return activityDurations;
  }

  this.getTotalActivityBarData = function(){
    var labels = this.availableActivities.map(aa => aa.name);
    var backgroundColor = this.availableActivities.map(aa => aa.color);
    var durations = this.getTotalActivityDuration();
    var data = labels.map(l => durations[l]);


    var result = {
      type: 'horizontalBar',
      // type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
        },],
      },
      options: {
        scales: {
            xAxes: [{
            // xAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        },
        legend: {
          display: false,
        },
      }
    };
    return JSON.stringify(result);
  }

  this.getTotalActivityPieData = function(){
    var labels = this.availableActivities.map(aa => aa.name);
    var backgroundColor = this.availableActivities.map(aa => aa.color);
    var durations = this.getTotalActivityDuration();
    var data = labels.map(l => durations[l]);

    // convert data to percentages
    var total = data.reduce((a,b) => a+b);
    var percentages = data.map(d => Math.round(10000*(d/total))/100);
    var data = percentages;

    var result = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
        },],
      },
      options: {
        legend: {
          display: false,
        },
      },
    };
    return JSON.stringify(result);
  }

}