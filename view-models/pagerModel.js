exports.model = function(page, limit, countSelected, countTotal, thePath){
  this.page = page;
  this.limit = limit;
  this.countSelected = countSelected;
  this.countTotal = countTotal;
  this.thePath = thePath;

  this.getPreviousButtonUrl = function(thePath){
    thePath = this.thePath || thePath;
    if (this.page == 1){ return '#'; }
    return thePath+'?page='+(this.page-1)+'&limit='+this.limit;
  }

  this.getNextButtonUrl = function(thePath){
    thePath = this.thePath || thePath;
    if ((this.page*this.limit) >= this.countTotal) {return '#';}
    return thePath+'?page='+(this.page+1)+'&limit='+this.limit;
  }

  this.getStartNo = function(){
    return (this.page*this.limit)-(this.limit-1);
  }

  this.getEndNo = function(){
    return this.getStartNo() + (this.countSelected -1);
  }

  // get number of pages to display inbetween arrows on pager
}