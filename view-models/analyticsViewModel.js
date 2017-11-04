var moment = require('moment-timezone');
var helpers = require('../helpers');

exports.model = function AnalyticsViewModel(sessions, activities, timezone, start, end){
  this.sessions = sessions;
  this.availableActivities = activities;
  this.start = start || null
  this.end = end || null;
  this.timezone = timezone;

  // set start and end if null
  if (this.start == null || this.end == null){
    if (sessions && sessions.length){
      this.start = this.sessions[0].start;
      this.end = this.sessions[this.sessions.length-1].start;
    }
    else{
      this.start = new Date();
      this.end = new Date();
    }

  }

  this.getDateRange = function(){
    var s = moment(this.start).tz(this.timezone).format('YYYY-MM-DD');
    var e = moment(this.end).tz(this.timezone).format('YYYY-MM-DD');
    return s + ' to ' + e;
  }

  // totals
  this.getTotalSessionCount = function(){
    return this.sessions.length;
  }

  this.getTotalSessionDuration = function(){
    var totalSec = this.sessions.length ? this.sessions.map(s => s.timeDetails.durationInSec).reduce((a,b) => a+b) : 0;
    return helpers.formatAsStopWatch(totalSec);
  }

  this.getTotalActivityDuration = function(sessions){
    sessions = sessions || this.sessions
    activityDurations = {};
    for (var i = 0; i < this.availableActivities.length; i++){
      var aa = this.availableActivities[i];

      var secDur = sessions.length
        ? sessions.map(
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

  this.getTotalActivityLineData = function(){
    if(sessions.length){
      var startDate = moment(this.sessions[0].start).tz(this.timezone);
      var endDate = moment(this.sessions[this.sessions.length-1].start).tz(this.timezone);

      movingDate = startDate.clone();

      var days = [];
      var pastEndDate = false
      while(!pastEndDate){
        var daysLabel = movingDate.format('YYYY-MM-DD');
        var daysSessions = this.sessions.filter(s => moment(s.start).format('YYYY-MM-DD') == daysLabel);
        var daysDurations = this.getTotalActivityDuration(daysSessions)
        days.push({
          m: movingDate.clone(),
          label: daysLabel,
          hasSessions: (daysSessions.length > 0),
          durations: daysDurations,
        });
        movingDate.add(1, 'days');
        pastEndDate = movingDate > endDate;
      }

      var datasets = this.availableActivities.map(function(aa){
        var data = days.filter(d => d.durations[aa.name] > 0).map(function(d){return {x: d.m.format('YYYY-MM-DD'), y:d.durations[aa.name]};});
        return {label: aa.name, backgroundColor: aa.color, borderColor: aa.color, fill: false, data: data, showLine: false};
      });

      var l = days.length;
      var unit = l < 10 ? 'day' : l < 50 ? 'week' : l < 600 ? 'month' : l < 1000 ? 'quarter' : 'year'; 


      var result = {
        type: 'line',
        data: {
          datasets: datasets,
        },
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: unit,
              }
            }],
           yAxes: [{
            ticks: {
              beginAtZero: true,
              min: 0
            }    
          }]
          }
        }
      };

      return JSON.stringify(result);
    }
  }

}