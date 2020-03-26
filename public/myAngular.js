var app = angular.module("EbayProductSearch", ['ngMaterial', 'ngMessages', 'ngAria', 'ui.bootstrap', 'angular-svg-round-progressbar', 'ngAnimate']);

var productSearchApi = "";
//console.log("In Angular file");

app.directive("errorDiv", function(){
	return {
		template : "<div style = \"background-color: #ffe0b3; height: 10%; color: #ff9900\"><b>No records</b></div><br>"
	};
});


app.controller('mainController', function($scope, $http, $timeout){
	//localStorage.clear();
	$scope.Category = "AllCategories";
	//$scope.sortParameter = 'default';
	$scope.showProgressBar = false;
	$scope.itemsPerPage = 10;
	$scope.currentPage = 1;
	$scope.numberOfPages = 0;
	$scope.wishListItemsAvailable = false;
	$scope.showResultsTable = false;
	$scope.orderToSort = false;
	$scope.maxSize = 5;
	var slideIndex = 1;
	$scope.currentLocation = true;
	$scope.itemId = null;
	$scope.count = 0;
	$scope.distance = 'currentLocation';
	$scope.wishListLength = 0;
	$scope.validPhotos = false;
	$scope.total = 0;
	$scope.shippingInfoAvailable = true;
	$scope.slideInStyle = false;
	$scope.showAnimatedProgressBar = false;
	$scope.stopAnimation = true;
	$scope.FirstToSecond = false;
	$scope.SecondToFirst = false;
	$scope.isProductClicked = false;
	$scope.isWishListProductClicked = false;
	$scope.wishListItemId = null;
	$scope.resultsItemId = null;
	$scope.validZipCode = false;
	$scope.sellerInfoAvailable = true;

	$scope.selectedParameter = "Default";
	$scope.selectedOrdering = "Ascending";
	$scope.defaultSorting = "Default";
	


	/*$("#fbImage").click(function () {
		var detail = $scope.detailOfProduct;
		FB.ui({
  			method: 'share',
  			href : detail.viewItemURL[0],
  			quote : "Buy " + detail.title[0] + " at $" + detail.sellingStatus[0].currentPrice[0].__value__ + " from link below.",
  			//message : 'Hello World!'
  							
			}, function(response){
  				// Debug response (optional)
  				console.log(response);
			});
		});*/

	$http.get('http://ip-api.com/json').then(function(response){
		$scope.hiddenLatitude = response.data.lat;
		$scope.hiddenLatitude = response.data.long;
		$scope.hiddenUserLocation = response.data.zip;
	},function(error){
		console.log("Some error occurred in ip-api.com");
	});
	

	$scope.computeTotalOfWishList = function(){
		var oldWishList = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri')) || [];
		if(oldWishList !== []){
			for(var i = 0; i < oldWishList.length; i++){
				$scope.total += parseFloat(oldWishList[i].sellingStatus[0].currentPrice[0].__value__);
			}
		}

	}

	$scope.computeTotalOfWishList();
	
	$scope.productSearch = function(){
		$scope.slideInStyle = false;
		$scope.toggle = true;
		$scope.showProgressBar = true;
		$scope.isProductClicked = false;
		var keyword = $scope.Keyword;
		var category = $scope.Category;
		var conditionNew = $scope.ConditionNew;
		var conditonUsed = $scope.ConditionUsed;
		var conditionUnspecified = $scope.ConditionUnspecified;
		var localPickUp = $scope.LocalPickupOnly;
		var freeShipping = $scope.FreeShippingOnly;
		var distance = 10;
		//console.log("formName.milesFromText" + $scope.milesFromText);
		if($scope.milesFromText !== undefined)
			distance = $scope.milesFromText;

		if($scope.distance === 'currentLocation'){
			var zipCodeText = $scope.hiddenUserLocation;
		}
		else{
			var zipCodeText = $scope.autocompleteText;
		}

		var apiCall = "?keyword=" + encodeURI(keyword);
		apiCall += "&category=" + category;
		apiCall += "&zipCodeText=" + zipCodeText;
		apiCall += "&distance=" + distance;
		apiCall += "&freeShipping=" +freeShipping;
		apiCall += "&localPickUp=" + localPickUp;
		apiCall += "&conditionNew=" + conditionNew;
		apiCall += "&conditionUsed=" + conditonUsed;
		apiCall += "&conditionUnspecified=" + conditionUnspecified;
		//console.log(apiCall);

		$http.get('/searchButton'+ apiCall).then(function(response){
			$scope.defaultSorting = "Default";
			var jsonObject = JSON.parse(JSON.stringify(response));
			var checkPath = jsonObject.data.findItemsAdvancedResponse;
			if(checkPath !== null || checkPath !== undefined)
				if(checkPath[0].searchResult[0] !== null || checkPath[0].searchResult[0] !== undefined)
					var commonPath = jsonObject.data.findItemsAdvancedResponse[0].searchResult[0];
			if(commonPath.item == undefined){
				$scope.products = [];
			}
			else{
				
				$scope.productsInitial = commonPath.item;
				angular.forEach($scope.productsInitial, function(item){
					item.actionToPerform = "add_shopping_cart";
				});

				var oldWishList = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri')) || [];
				//console.log("oldWishList"+oldWishList);
				if(oldWishList != []){
					for(var i = 0; i < $scope.productsInitial.length; i++){
						for(var j = 0; j < oldWishList.length; j++){

							var productId = $scope.productsInitial[i].itemId;
							var wishListId = oldWishList[j].itemId;
							//console.log("Comparing" + productId + " " + wishListId);
							if(parseInt(productId) == parseInt(wishListId)){
								$scope.productsInitial[i].actionToPerform = "remove_shopping_cart";
							}
						}
					}
				}
				$scope.products = $scope.productsInitial;
			}

			//console.log($scope.products);
			if($scope.products.length == 0){
				$scope.maxValOfPagination = 0;
				$scope.currentPage = 0;
				$scope.showResultsTable = true;
				$scope.wishListItemsAvailable = false;
			}
			else{
				$scope.maxValOfPagination = $scope.products.length;
				$scope.currentPage = 1;
				$scope.numberOfPages  = Math.ceil($scope.products.length / $scope.itemsPerPage);
				
				$scope.numOfPagesArray = [];
				for(var i = 1; i <= $scope.numberOfPages; i++){
					$scope.numOfPagesArray.push(i);
				}
				$scope.showResultsTable = true;
				$scope.wishListItemsAvailable = false;
				for (var i = 0; i < $scope.products.length; i++){
					item = $scope.products[i];
					if(item.title[0].length > 35){
						var modifyTitle = item.title[0];
						if(modifyTitle.substring(35,36) == " ")
							var newShowString = modifyTitle.substring(0,35) + "...";
						else{
							for(var j = 34; j > 0; j--){
								if(modifyTitle.substring(j, j+1) == " "){
									var newShowString = modifyTitle.substring(0,j) + "...";
									break;
								}
							}
						}

					}
					else
						newShowString = item.title[0];
					item["modifiedTitle"] = newShowString;
				}
			}
			$scope.showProgressBar = false;
			$scope.results();
		}, function(error){
			//console.log("Some error occured");
		});
	};

	$scope.setZipCode = function(zip){
		var checkLength = zip.toString().length;
		var areNotDigits = isNaN(zip);
		$scope.validZipCode = checkLength == 5 && areNotDigits == false;
		$scope.autocompleteText = zip;
	}

	$scope.setPage = function(page){
		if(page == 0)
			$scope.currentPage = 1;
		else if(page == $scope.numberOfPages + 1)
			$scope.currentPage = $scope.numberOfPages;
		else
			$scope.currentPage = page;
	}

	$scope.reset = function(){
		$scope.formName.$setPristine();
		$scope.formName.Keyword.$touched = false;
		$scope.formName.Keyword.$invalid = true;
		$scope.distance = "currentLocation";
		
		$scope.showProgressBar = false;
		$scope.showResultsTable = false;
		$scope.wishListItemsAvailable = false;
		$scope.showProductDetailsWithTab = false;
		$scope.productDetails = false;
		$scope.shippingDetails = false;
		$scope.sellerDetails = false;
		$scope.similarItemDetails = false;
		$scope.photos = false;
	}

	$scope.updateCartIcon = function(detail, actionToPerform){
		//console.log("In update cart icon" + detail.actionToPerform);
		detail.actionToPerform = actionToPerform;
		angular.forEach($scope.products, function(item){
			if(parseInt(item.itemId) == parseInt(detail.itemId)){
				item.actionToPerform = actionToPerform;
			}
		});
		//console.log("after update" + detail.actionToPerform);
	}
	$scope.setItemForWishList = function(detail){
		var isPresentInLocaltorage = false;
		if(detail.actionToPerform === "add_shopping_cart"){
			$scope.updateCartIcon(detail, "remove_shopping_cart");
			var oldWishList = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri')) || [];
			var isPresentInLocaltorage = false;
			if(oldWishList != []){
				for(var i = 0; i < oldWishList.length; i++){
					if(parseInt(oldWishList[i].itemId) == parseInt(detail.itemId))
						isPresentInLocaltorage = true;
				}
			}
			if(isPresentInLocaltorage == false){
				$scope.total += parseFloat(detail.sellingStatus[0].currentPrice[0].__value__);
				oldWishList.push(detail);
				localStorage.setItem("wishListLocalStorageMadhuri", JSON.stringify(oldWishList));
			}
			
		}
		else{
			//$scope.removeItemFromWishList(detail, 1);

			if(parseInt($scope.wishListItemId) === parseInt(detail.itemId)){
				$scope.isWishListProductClicked = false;
				$scope.wishListItemId = null;
			}
			var newWish = [];
			for(var i = 0; i < $scope.wish.length; i++){
				if(parseInt($scope.wish[i].itemId) !== parseInt(detail.itemId)){
					newWish.push($scope.wish[i]);
				}
			}
			$scope.wish = newWish;
			$scope.wishListRemoval(detail);
			var newdata = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri'));
			if(newdata.length == 0){
				$scope.psuedoLocalStorage = 0;
				$scope.wishListItemId = null;
				$scope.isWishListProductClicked = false;
				$scope.wish = [];
			}
			$scope.updateCartIcon(detail, "add_shopping_cart");

		}
	};

	$scope.wishListRemoval = function(detail){
		if(parseInt(detail.itemId) == parseInt($scope.wishListItemId)){
			$scope.isWishListProductClicked = false;
			//$scope.wishListItemId = localStorage.getItem("wishListItemIdMadhuri");
		}
		$scope.total -= parseFloat(detail.sellingStatus[0].currentPrice[0].__value__);
		var removeFromWishList = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri'));
		newLocalStorage = [];
		for(var i = 0; i < removeFromWishList.length; i++){
			if(parseInt(detail.itemId) != parseInt(removeFromWishList[i].itemId)){
				newLocalStorage.push(removeFromWishList[i]);
			}

		}
		//newdata = removeFromWishList.splice(detail, 1);
		localStorage.setItem('wishListLocalStorageMadhuri', JSON.stringify(newLocalStorage));
	}

	$scope.wishList = function(){
		var wishListItems = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri'));
		$scope.wishListItemsAvailable = true;
		$scope.showResultsTable = false;
		$scope.showProgressBar = false;
		$scope.showProductDetailsWithTab = false;
		$scope.photos = false;
		$scope.similarItemDetails = false;
		$scope.productDetails = false;
		$scope.shippingDetails = false;
		$scope.sellerDetails = false;
		if(wishListItems != null){
			if(wishListItems.length == 0){
				$scope.wishListLength = 0;
				$scope.psuedoLocalStorage = 0;
				$scope.wishListItemId = null;
				$scope.total = 0.0;
			}
			else{
				$scope.wishListLength = wishListItems.length;
				$scope.psuedoLocalStorage = wishListItems.length;
				$scope.showResultsTable = false;
				//$scope.wishListItemId = localStorage.getItem("wishListItemIdMadhuri");
				$scope.wish = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri'));
			}
		}
		else{
			$scope.wishListLength = 0;
			$scope.psuedoLocalStorage = 0;
		}
		$scope.wishListItemsAvailable = true;
	};

	$scope.results = function(){
		$scope.showResultsTable = true;
		$scope.showProgressBar = false;
		$scope.wishListItemsAvailable = false;
		$scope.showProductDetailsWithTab = false;
		$scope.productDetails = false;
		$scope.shippingDetails = false;
		$scope.sellerDetails = false;
		$scope.similarItemDetails = false;
		$scope.photos = false;

	};

	$scope.removeItemFromWishList = function(detail, index){
		if($scope.wishListItemId === detail.itemId){
			$scope.wishListItemId = null;
			$scope.isWishListProductClicked = false;
		}
		var newWish = [];
		for(var i = 0; i < $scope.wish.length; i++){
			if($scope.wish[i].itemId !== detail.itemId){
				newWish.push($scope.wish[i]);
			}
		}
		$scope.wish = newWish;

		$scope.wishListRemoval(detail);
		var newdata = JSON.parse(localStorage.getItem('wishListLocalStorageMadhuri'));
		if(newdata.length == 0){
			$scope.wishListItemsAvailable = true;
			$scope.psuedoLocalStorage = 0;
			$scope.wish = [];
		}
		$scope.updateCartIcon(detail, "add_shopping_cart");
	};

	$scope.productClicked = function(detail, previousState){
		$scope.defaultSorting = "Default";
		$('[data-toggle = "tooltip"]').tooltip('hide');
		$scope.maintainPreviousState = previousState;
		if(previousState == 'results'){
			$scope.isProductClicked = true;
			$scope.detailOfProductResults = detail;
			$scope.resultsItemId = detail.itemId[0];
		}
		else{
			$scope.isWishListProductClicked = true;
			$scope.detailOfProductWishList = detail;
			$scope.wishListItemId = detail.itemId[0];
		}
		$scope.slideInStyle = true;
		$scope.detailOfProduct = detail;
		//$scope.showProgressBar = true;
		$scope.FirstToSecond = true;
		$scope.showAnimatedProgressBar = true;
		$scope.stopAnimation = false;
		$scope.previousList = previousState;
		$scope.titleOfProduct = detail.title[0];
		$scope.itemId = detail.itemId;
		$scope.shippingInfo = detail.shippingInfo;
		$scope.returnsAcceptedForShippingTab = detail.returnsAccepted;
		$scope.showProductDetailsWithTab = true;
		//$scope.isProductClicked = true;
		
		//console.log($scope.facebookApiCall);
		this.productTabClicked();
	}

	$scope.productTabClicked = function(){
		$http.get('/productsTab?itemId=' + $scope.itemId).then(function(response){
			$scope.shippingDetails = false;
			$scope.sellerDetails = false;
			$scope.photos = false;
			$scope.similarItemDetails = false;
			$scope.showResultsTable = false;
			$scope.wishListItemsAvailable = false;
			var jsonObject = JSON.parse(JSON.stringify(response));
			if(jsonObject.data.item !== undefined || jsonObject.data.item !== null)
				$scope.individualProducts = jsonObject.data.Item;
			else
				$scope.individualProducts = undefined;

			var detail = $scope.individualProducts;
			var fbId = 2052807138130016;
			var descriptionRaw = "Buy " + detail.Title + " at $" + detail.CurrentPrice.Value + " from link below.";
			var descriptionString = encodeURIComponent(descriptionRaw);
			$scope.facebookApiCall = "https://www.facebook.com/dialog/share?app_id=" + fbId.toString() + "&display=popup"  + "&quote=" + descriptionString + "&href=" + detail.ViewItemURLForNaturalSearch;
		

			if($scope.individualProducts !== undefined || $scope.individualProducts !== null){
				$scope.storeInfo = $scope.individualProducts.storeInfo;
				$scope.sellerInfo = $scope.individualProducts.Seller;
				$scope.feedbackScore = parseInt($scope.sellerInfo.FeedbackScore);
				var initialColor = $scope.sellerInfo.FeedbackRatingStar;
				$scope.starColor = initialColor.toLowerCase();
				if($scope.feedbackScore > 10000){
					var strIndex = $scope.starColor.indexOf("shooting");
					$scope.starColor = $scope.starColor.substring(0,strIndex);
				}
				$scope.storeFront = $scope.individualProducts.Storefront;

				if($scope.individualProducts.ItemSpecifics !== undefined && $scope.individualProducts.ItemSpecifics.NameValueList !== undefined){
					$scope.itemSpecifics = jsonObject.data.Item.ItemSpecifics.NameValueList;
					var newArray = [];
					for(var i = 0; i < $scope.itemSpecifics.length; i++){
						var newStr = "";
						var checkValue = $scope.itemSpecifics[i].Value;
						for(var j = 0; j < checkValue.length; j++){
							if(j == checkValue.length - 1)
								newStr += checkValue[j]
							else
								newStr += checkValue[j] + ", ";
						}
						newJson = {
							"Name" : $scope.itemSpecifics[i].Name,
							"Value" : newStr 
						};
						newArray.push(newJson);
					}
					$scope.itemSpecifics = newArray;

				}
				
				


				$scope.productImages = $scope.individualProducts.PictureURL;
				$scope.showImage = $scope.productImages[0];
				//$scope.showProgressBar = false;
				$timeout(function() {
					$scope.stopAnimation = true;
					$scope.showAnimatedProgressBar = false;
					$scope.FirstToSecond = false;
					if($scope.maintainPreviousState == 'results')
						$scope.showResultsTable = false;
					else
						$scope.wishListItemsAvailable = false;
					$scope.productDetails = true;
				}, 200);
			}
				

		},function(error){
			//console.log("Some error occured in products tab");
		});
		$scope.slideInStyle = false;

		
	};

	$scope.shippingTabClicked = function(){
		$scope.shippingTab = $scope.shippingInfo;
		if($scope.shippingTab == 'undefined' || $scope.shippingTab.length == 0){
			//console.log("No shipping Info");
			$scope.shippingInfoAvailable = false;
		}
		else{
			$scope.shippingInfoAvailable = true;	
			$scope.shippingDetails = true;
			$scope.productDetails = false;
			$scope.sellerDetails = false;
			$scope.similarItemDetails = false;
			$scope.photos = false;
			$scope.wishListItemsAvailable = false;
			$scope.showResultsTable = false;
			$scope.showProductImages = false;
		}
		
	}

	$scope.sellerTabClicked = function(){
		$scope.sellerDetails = true;
		if($scope.sellerInfo == 'undefined' || $scope.sellerInfo == null || $scope.sellerInfo.length == 0){
			$scope.sellerInfoAvailable = false;
			//console.log("No seller Info");
		}
		else{
			$scope.sellerInfoAvailable = true;
			$scope.productDetails = false;
			$scope.shippingDetails = false;
			$scope.similarItemDetails = false;
			$scope.photos = false;
			$scope.showResultsTable = false;
			$scope.wishListItemsAvailable = false;
		}
	};

	$scope.similarTabClicked = function(){
		$scope.ascendingOrDescending = "Ascending";
		$scope.sortingParameter = '';
		$http.get('/similarItemsTab?itemId=' + $scope.itemId).then(function(response){
			$scope.similarItems = response.data;
			$scope.similarItemDetails = true;
			$scope.productDetails = false;
			$scope.shippingDetails = false;
			$scope.sellerDetails = false;
			$scope.photos = false;
			$scope.wishListItemsAvailable = false;
			$scope.showResultsTable = false;
			$scope.limitValue = 5;
			$scope.sortingParameter = '';
			$scope.orderToSort = '';
			$scope.noSortingParameter = true;
		},function(error){
			//console.log("Some error occured in Similar Items tab");
		});
	};


	$scope.sortSimilarItemsNew = function(parameter){
		$scope.defaultSorting = parameter;
		if(parameter !== "Default")
			$scope.sortingType = parameter;
	}

	$scope.decideOrderingOfList = function(parameter){
		if(parameter == "Ascending")
			$scope.newOrderForSorting = false;
		else
			$scope.newOrderForSorting = true;
	}


	/*$scope.sortSimilarItems = function(parameter){
		console.log("ENtered old sorting funtion");
		if(parameter == 'default'){
			$scope.sortingParameter = '';
			$scope.lastOrder = $scope.orderToSort;
			$scope.orderToSort = '';
			$scope.noSortingParameter = true;
		}
		else{
			$scope.sortingParameter = parameter;
			$scope.noSortingParameter = false;
			if($scope.orderToSort == ''){
				if($scope.lastOrder  !== '')
					$scope.orderToSort = $scope.lastOrder;
				else
					$scope.orderToSort = false;
			}
			$scope.ascendingOrDescending = 'Ascending';
		}
	};

	$scope.decideOrdering = function(orderingParameter){
		if(orderingParameter == "ascending"){
			$scope.orderToSort = false;
		}
		else{
			$scope.orderToSort = true;
		}
	};*/

	$scope.photosTabClicked = function(){
		$http.get('/photosTab?keyword=' + $scope.titleOfProduct).then(function(response){
			$scope.photos = true;
			$scope.similarItemDetails = false;
			$scope.productDetails = false;
			$scope.shippingDetails = false;
			$scope.sellerDetails = false;
			$scope.photosDetails = response.data;
			for(var i = 0;  i < $scope.photosDetails.length; i++){
				if($scope.photosDetails[i].noData)
					$scope.validPhotos = false;
				else
					$scope.validPhotos = true;
			}
		},function(error){
			//console.log("Some error occured in photos tab");
		});
	};

	/*$scope.facebookImageClicked = function(){
		var detail = $scope.detailOfProduct;
		FB.ui({
  			method: 'share',
  			display: 'popup',
  			quote : "Buy " + detail.title[0] + " at $" + detail.sellingStatus[0].currentPrice[0].__value__ + " from link below.",
  			href : detail.viewItemURL[0],
  			//message : 'Hello World!'
  							
			}, function(response){
  			// Debug response (optional)
  			console.log(response);
			});
		var fbId = 2052807138130016;
		var descriptionString = encodeURI("Buy " + detail.title[0] + " at $" + detail.sellingStatus[0].currentPrice[0].__value__ + " from link below.");
		var apiCall = "https://www.facebook.com/dialog/share?app_id=" + fbId.toString() + "&display=popup&href=" + detail.viewItemURL[0] + "&quote=" + descriptionString;
		console.log(apiCall);
		$http.get("apiCall").then(function(response){
			console.log("Data received from facebook");
		},function(error){
			console.log("Some error occurred in facebook api call");
		});
	};*/

	$scope.autocomplete = function(zip){
		//console.log("ZipCode received=" + zip);
		$scope.autocompleteText = zip;
		var checkLength = zip.toString().length;
		var areNotDigits = isNaN(zip);
		$scope.validZipCode = checkLength == 5 && areNotDigits == false;

		var apiCall = "/autocomplete?zipSoFar=" + zip;
		return $http({
			url : apiCall,
			method: 'GET'
		}).then(function(data){
			//console.log(data.data);
			return data.data;
		}).catch(function(errorReceived){
				console.log("Geonames API did not return any results");
			});
	};

	$scope.viewProductImages = function(){
		$scope.showProductImages = true;
		if($scope.productImages.length <= 1){
			$('.carousel-control-prev').css('display', 'none');
			$('.carousel-control-next').css('display', 'none');
		}
		
		showSlides(slideIndex);
	};

	function showSlides(n) {
		var i;
		var slides = $scope.productImages;
		if (n > slides.length) {slideIndex = 1}    
		if (n < 1) {slideIndex = slides.length}
		if(slideIndex == undefined)
			slideIndex = 1;
		$scope.showImage = $scope.productImages[slideIndex-1];  
	}

	$scope.plusSlides = function(n){
  		showSlides(slideIndex += n);
	}

	function currentSlide(n) {
  		showSlides(slideIndex = n);
	}

	$scope.showMore = function(){
		$scope.limitValue = $scope.similarItems.length;
	};

	$scope.showLess = function(){
		$scope.limitValue = 5;
	}

	$scope.goToPreviousList = function(){
		$scope.productDetails = false;
		$scope.shippingDetails = false;
		$scope.sellerDetails = false;
		$scope.similarItemDetails = false;
		$scope.photos = false;
		$scope.wishListItemsAvailable = false;
		$scope.showResultsTable = false;
		//$scope.showProgressBar = true;
		$scope.showAnimatedProgressBar = true;
		$scope.SecondToFirst = true;
		$scope.stopAnimation = false;
		$timeout(function(){
		$scope.stopAnimation = true;
		$scope.showAnimatedProgressBar = false;
		$scope.showProductDetailsWithTab = false;
		$scope.SecondToFirst = false;
		if($scope.previousList == "results")
			$scope.showResultsTable = true;
		else{
			if($scope.psuedoLocalStorage == 0)
				if($scope.detailOfProductWishList.actionToPerform == "add_shopping_cart")
					$scope.wishListItemId = null;
			$scope.wishListItemsAvailable = true;
		}
		},200);	
	}

	$scope.detailButtonClicked = function(previousState){
		if(previousState == 'results')
			var detailToShow = $scope.detailOfProductResults;
		else
			var detailToShow = $scope.detailOfProductWishList;
		$scope.productClicked(detailToShow, previousState);
	};
});