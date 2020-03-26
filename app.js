var express = require("express");
var app = express();
var https = require('https');
const cors = require('cors');
const http = require('http');
const PORT = 8081;
const myApiId = "MadhuriJ-WebTech6-PRD-0a6d2f14d-21b6a625";
const cx = "005104929404727311061:ubjdibpefja";
const googleKey = "AIzaSyDZL7afqcXyL5fkMtQqOj2C6J77EXA5g-k";
const autocompleteUsername = "pkanere";


var request = require('request');
app.use(cors());

console.log("In node js file");

app.use(express.static('public'));
//app.get('/', (req, res) => res.send('Hello World!'));
app.listen(PORT, () => console.log('Example app listening on port:' + PORT + '!'));

app.get('/searchButton', function(req, res){
	var apiCall = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=" + myApiId + "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50&keywords=iphone&buyerPostalCode=90007&itemFilter(0).name=MaxDistance&itemFilter(0).value=10&itemFilter(1).name=HideDuplicateItems&itemFilter(1).value=true&itemFilter(2).name=Condition&itemFilter(2).value(0)=New&itemFilter(2).value(1)=Used&itemFilter(2).value(2)=Unspecified&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo";
	console.log(req.query);
		var i = 0;
		productSearchApi = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=" + myApiId + "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50";
		productSearchApi += "&keywords=" + encodeURI(req.query.keyword);
		if(req.query.category != "AllCategories")
			productSearchApi += "&categoryId=" + req.query.category;

		productSearchApi += "&buyerPostalCode=" + req.query.zipCodeText;

		productSearchApi += "&itemFilter(" + i + ").name=MaxDistance&itemFilter(" + i + ").value=" + req.query.distance;
		i += 1
		if(req.query.freeShipping == "true"){
			productSearchApi += "&itemFilter(" + i + ").name=FreeShippingOnly&itemFilter(" + i + ").value=true";
			i += 1
		}
		if(req.query.localPickUp == "true"){
			productSearchApi += "&itemFilter(" + i + ").name=LocalPickupOnly&itemFilter(" + i + ").value=true";
			i += 1
		}
		productSearchApi += "&itemFilter(" + i + ").name=HideDuplicateItems&itemFilter(" + i + ").value=true";
		i += 1;
		if(req.query.conditionNew === "undefined" && req.query.conditionUsed === "undefined" && req.query.conditionUnspecified === "undefined")
			productSearchApi += "&itemFilter(" + i + ").name=Condition&itemFilter(" + i + ").value(0)=New&itemFilter(" + i + ").value(1)=Used&itemFilter(" + i + ").value(2)=Unspecified";
		else{
			var j = 0;
			productSearchApi += "&itemFilter(" + i + ").name=Condition";
			if(req.query.conditionNew == "true"){
				productSearchApi += "&itemFilter(" + i + ").value(" + j + ")=New";
				j += 1
			}
			if(req.query.conditionUsed == "true"){
				productSearchApi += "&itemFilter(" + i + ").value(" + j + ")=Used";
				j += 1
			}
			if(req.query.conditionUnspecified == "true"){
				productSearchApi += "&itemFilter(" + i + ").value(" + j + ")=Unspecified";
				j += 1
			}
		}
		productSearchApi += "&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo";
		console.log(productSearchApi);

	request(productSearchApi, function(error, response, body){
		console.log("In first request");
		if(!error && response.statusCode == 200){
			res.send(body);
		}
		if(error){
			console.log("Some error occured in searchButton Api Call");
		}
	});
});

app.get('/productsTab', function(req, res){
	console.log("In products tab");
	var itemId = req.query.itemId;
	var apiCall = "http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=" + myApiId + "&siteid=0&version=967&ItemID=" + itemId + "&IncludeSelector=Description,Details,ItemSpecifics";
	console.log(apiCall)
	request(apiCall, function(error, response, body){
		if(!error && response.statusCode == 200){
			res.send(body);
		}
		if(error){
			console.log("Some error occured in Products tab");
		}
	});
});

app.get('/similarItemsTab', function(req, res){
	var itemId = req.query.itemId;
	console.log("In Similar Items Tab");
	var apiCall = "http://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=" + myApiId + "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=" + itemId + "&maxResults=20";
	console.log(apiCall);
	request(apiCall, function(error, response, body){
		if(!error && response.statusCode == 200){
			var newBody = JSON.parse(body);
			if(newBody.getSimilarItemsResponse !== null || newBody.getSimilarItemsResponse !== undefined){
				if(newBody.getSimilarItemsResponse.itemRecommendations !== null || newBody.getSimilarItemsResponse.itemRecommendations !== undefined)
					var jsonObject = newBody.getSimilarItemsResponse.itemRecommendations.item;
				else
					var jsonObject = [];
			}
			else
				var jsonObject = [];
			
			var newJsonObject = [];
			for(var i = 0; i < jsonObject.length; i++){
				var timeLeft = jsonObject[i].timeLeft;
				var extractedDaysLeft = timeLeft.substring(timeLeft.lastIndexOf("P") + 1, timeLeft.lastIndexOf("D"));
				var customizedObject = {
					"imageURL" : jsonObject[i].imageURL,
					"title" : jsonObject[i].title,
					"viewItemURL" : jsonObject[i].viewItemURL,
					"price" : parseFloat(jsonObject[i].buyItNowPrice.__value__),
					"shippingCost" : parseFloat(jsonObject[i].shippingCost.__value__),
					"timeLeft" : parseInt(extractedDaysLeft)
				}
				newJsonObject.push(customizedObject);
			}
			res.send(newJsonObject);
		}
		if(error){
			console.log("Some error occurred in similar items tab -- nodejs");
		}
	});
});

app.get('/photosTab', function(req, res){
	console.log("In photos tab");
	var apiCall = "https://www.googleapis.com/customsearch/v1?q=" + encodeURI(req.query.keyword) + "&cx=" + cx + "&imgSize=huge&imgType=news&num=8&searchType=image&key=" + googleKey;
	//apiCall = encodeURI(apiCall);
	console.log(apiCall);
	request(apiCall, function(error, response, body){
		if(!error && response.statusCode == 200){
			var newBody = JSON.parse(body);
			var jsonObject = newBody.items;
			var newJsonObject = [];
			if(jsonObject !== undefined){
				for(var i = 0; i < jsonObject.length; i++){
					var customizedObject = {
						"link" : jsonObject[i].link
					}
					newJsonObject.push(customizedObject);
				}		
			}
			else{
				var customizedObject = {
						"noData" : "No data"
					}
				newJsonObject.push(customizedObject);
			}
			res.send(newJsonObject);
		}
		if(error){
			console.log(error);
			console.log("Some error occured in photos tab nodejs");
		}
	});

});

app.get('/facebookTab', function(req, res){
	console.log("Facebook tab clicked node js");
	var apiCall = "";
	request(apiCall, function(error, response, body){
		if(!error && response.statusCode == 200){
			res.send(body);
		}
		if(error){
			console.log("Some error occured in facebook tab nodejs");
		}
	});

});

app.get('/autocomplete', function(req, res){
	console.log("autocomplete clicked node js");
	var apiCall = "http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=" + req.query.zipSoFar + "&username=" + autocompleteUsername + "&country=US&maxRows=5";
	console.log(apiCall);
	request(apiCall, function(error, response, body){
		if(!error && response.statusCode == 200){
			var newResponse = [];
			console.log(body);
			var newBody = JSON.parse(body);
			var commonPath = newBody.postalCodes;
			console.log("commonPath" + commonPath);
			for(var i = 0; i < commonPath.length; i++){
				var newJson = {
					"postalCode" : commonPath[i].postalCode
				}
				newResponse.push(newJson);
			}
			console.log(newResponse);
			res.send(newResponse);
			//res.send(body);
		}
		if(error){
			console.log("Some error occured in nodejs tab nodejs");
		}
	});

});

//https://www.googleapis.com/customsearch/v1?q=iphone&cx=011572014524656636668:fuajcjgw75g&imgSize=huge&imgType=news&num=8&searchType=image&key=AIzaSyDZL7afqcXyL5fkMtQqOj2C6J77EXA5g-k