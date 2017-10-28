exports.model = function(page, limit, countSelected, countTotal, thePath){
  this.page = page;
  this.limit = limit;
  this.countSelected = countSelected;
  this.countTotal = countTotal;
  this.thePath = thePath;
  this.maxPageLinks = 5;

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
    return this.countTotal == 0 ? 0 : (this.page*this.limit)-(this.limit-1);
  }

  this.getEndNo = function(){
    return this.countTotal == 0 ? 0 : this.getStartNo() + (this.countSelected -1);
  }

  this.getSpanText = function(){
    return this.getStartNo()+'&nbsp;-&nbsp;'+this.getEndNo()+'&nbsp;of&nbsp;'+this.countTotal;
  }

  this.getPages = function(){
    var pp = []; // possible pages
    var page = 1;
    while((page-1)*this.limit < this.countTotal){
      pp.push(page);
      page++;
    }

    var ptd = [this.page]; // pages to display
    pp.splice(pp.indexOf(this.page), 1);
    while((ptd.length < this.maxPageLinks) && (pp.length > 0)){
      var newMin = Math.min.apply(null, ptd)-1;
      var newMax = Math.max.apply(null, ptd)+1;
      // Alternate between trying to add one above/below existing pages
      var newPage = (ptd.length%2 == 0) ? {f: newMin, s: newMax} : {f: newMax, s: newMin};

      if (pp.includes(newPage.f)){
        ptd.push(pp.splice(pp.indexOf(newPage.f), 1)[0]);
      }
      else if (pp.includes(newPage.s)){
        ptd.push(pp.splice(pp.indexOf(newPage.s), 1)[0]);
      }
    }

    return ptd.sort((a,b) => a-b);
  }
}