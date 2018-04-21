var proxy = require('express-http-proxy');
var app = require('express')();
var port = process.env.PORT || '4000';

 
var HTMLParser = require('fast-html-parser');


app.use('/olxrequests', proxy('https://www.olx.kz/', {
  https: true,
  proxyReqPathResolver: function(req) {
	console.log('i am done first ---- krisha');
	return new Promise(function (resolve, reject) {
	  setTimeout(function () {   // simulate async
		// in this case I expect a request to /proxy => localhost:12345/a/different/path
		var resolvedPathValue = req.originalUrl.split('olxrequests')[1];
		console.log(resolvedPathValue);
		resolve(resolvedPathValue);
	  }, 200);
	});
  },
  userResDecorator: function(proxyRes, proxyResData) {
    return new Promise(function(resolve) {	  
      setTimeout(function() {	
		var doc = HTMLParser.parse(proxyResData.toString('utf8'));
		//console.log(doc.childNodes[0].childNodes[3].childNodes);
		var o = {};
		o.hrefs = [];
		o.imgs = [];
		o.descs = [];
		o.ishot = [];
		var ar = doc.querySelectorAll('table.fixed .breakword');
		console.log(ar.length);		
		if(ar.length !== 0){
			for(var i=0; i<ar.length; i++){
				var atag = ar[i].querySelector('a.thumb').rawAttrs.split(/\n\t{1,}/g)[1]; 
				o.hrefs.push(atag);      
				
				var imgtag = ar[i].querySelector('a.thumb').childNodes[1];
				if(imgtag.tagName === "img"){
					imgtag = imgtag.rawAttrs.split(" ")[1];
				}
				if(imgtag.tagName === "span"){
					imgtag = imgtag.childNodes[0].rawText;
				}
				o.imgs.push(imgtag);
				
				var titletag = ar[i].querySelector('a.marginright5 strong').childNodes[0].rawText.replace(/\n|\s{2,}/g,"");
				
				/*var titletag = ar[i].querySelector('a.marginright5');
				if(titletag.childNodes.length !== 0){
					titletag = titletag.childNodes[1].childNodes[0].rawText;
				}else{
					titletag = "";
				}*/

				var pricetag = ar[i].querySelector('div.space.inlblk');
				if(pricetag.childNodes.length > 1){
					pricetag = pricetag.childNodes[1].childNodes[1].childNodes[0].rawText.replace(/\n|\s{2,}/g,"");
					pricetag = 'за ' + pricetag;
				}else{
					pricetag = "";
				}
				
				
				var subtitletag = ar[i].querySelector('p.marginbott5 small.breadcrumb');
				if(subtitletag.childNodes.length !== 0){ 
					subtitletag = subtitletag.childNodes[1].childNodes[0].rawText.replace(/\n|\s{2,}/g,"");
				}else{
					subtitletag = "";
				}
				
				var hottag = ar[i].querySelector("span.inlblk.icon.paid");
				var toptag = "";
				if(hottag){
					toptag = "В топе";
				}else{
					toptag = "";
				}
				
				var mas = [];
				mas.push(titletag);
				mas.push(pricetag);
				mas.push(subtitletag);
				var strdesc = mas.join(" ");
				o.descs.push(strdesc);
				o.ishot.push(toptag);	
			}
			console.log(o);
			console.log('**************************************');
			proxyResData.oo = o;
			resolve(proxyResData.oo);
			//resolve(o);
		}else{
			console.log("Увы, нет таких объявлений");
			console.log('**************************************');
			resolve("Увы, нет таких объявлений");
		}
      }, 200);
    });
  }
}));


app.listen(port);