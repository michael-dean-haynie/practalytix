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
      var startDate = moment(this.sessions[0].start);
      console.log(startDate);
      var endDate = moment(this.sessions[this.sessions.length-1].start);
      console.log(endDate);

      movingDate = startDate;

      console.log(this.sessions.filter(s => moment(s.start).format('YYYY-MM-DD') == daysLabel));

      var days = [];
      var pastEndDate = false
      while(!pastEndDate){
        var daysLabel = movingDate.format('YYYY-MM-DD');
        var daysSessions = this.sessions.filter(s => moment(s.start).format('YYYY-MM-DD') == daysLabel);
        var daysDurations = this.getTotalActivityDuration(daysSessions)
        days.push({
          moment: movingDate,
          label: daysLabel,
          hasSessions: (daysSessions.length > 0),
          durations: daysDurations,
        });
        movingDate.add(1, 'days');
        pastEndDate = movingDate > endDate;
      }

      var labels = days.map(d => d.hasSessions ? d.label : '');
      var datasets = this.availableActivities.map(function(aa){
        var data = days.map(d => d.durations[aa.name] != 0 ? d.durations[aa.name] : null );
        return {label: aa.name, backgroundColor: aa.color, borderColor: aa.color, fill: false, data: data, spanGaps: true};
      });


      var result = {
        type: 'line',
        data: {
          // labels:['A', '', 'C', 'D', 'E'],
          labels: labels,
          // datasets: [{
          //   label: 'Hello',
          //   data: [
          //     {x: new Date()+1000, y: 1},
          //     {x: new Date()+2000, y: 2},
          //     {x: new Date()+3000, y: 3},
          //     {x: new Date()+4000, y: 4},
          //     {x: new Date()+5000, y: 5},
          //   ],
          //   backgroundColor: '#9a37cd',
          //   borderColor: '#9a37cd',
          //   fill: false,
          // },
          // {
          //   label: 'World',
          //   data: [
          //     {x: new Date()+1000, y: 1},
          //     {x: new Date()+3000, y: 3},
          //     // {x: new Date()+5000, y: 5},
          //     0,
          //     {x: new Date()+7000, y: 7},
          //     {x: new Date()+9000, y: 9},
          //   ],
          //   backgroundColor: '#359562',
          //   borderColor: '#359562',
          //   fill: false,
          // },],
          datasets: datasets,
        },
        // options: {},
      };
      return JSON.stringify(result);
    }
  }

}