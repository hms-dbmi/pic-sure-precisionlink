define(["output/outputPanel","picSure/queryBuilder", "filter/searchResult", "handlebars", "text!filter/searchResultTabs.hbs", "text!filter/searchResultSubCategories.hbs", "text!../settings/settings.json"],
		function(outputPanel, queryBuilder, searchResult, HBS, searchResultTabsTemplate, searchSubCatTemplate, settings){
	var searchResults = {
			init : function(data, view, callback){
				this.searchResultTabs = HBS.compile(searchResultTabsTemplate);
				this.searchSubCategories = HBS.compile(searchSubCatTemplate);
				this.addSearchResultRows(data, view, callback, view.model.get("searchTerm"));
			}
	};
	searchResults.addSearchResultRows = function(data, filterView, queryCallback, searchTerm){
		
		//we want case INsensitive comparisons always
		searchTerm = searchTerm.toLowerCase();
		var settingsJson = JSON.parse(settings);
		var getAliasName = function(key){
			if(settingsJson.categoryAliases && settingsJson.categoryAliases[key]){
                return settingsJson.categoryAliases[key];
            } else {
                return key;
            }
		}
		var keys = _.keys(data);
		var aliases = [];
		var aliasObjects = {}
		keys.forEach((key) => {
			var alias = getAliasName(key)
			if(aliases.indexOf(alias) == -1){
				aliases.push(alias);
			}
			var aliasObj = aliasObjects[alias];
			if(aliasObj){
				if(!aliasObj[key]){
					aliasObj[key] = true;
					aliasObj.tooltip = aliasObj.tooltip + "\n" + "-----------------------------------" + key;
				}
			} else {
				aliasObj = {
					alias: alias,
					tooltip: key
				}
				aliasObj[key] = true;
				aliasObjects[alias] = aliasObj;
			}
		});
		
		//track the category results
		var parentCategorySearchResults = [];
		
		var compiledSubCategoryTemplate = this.searchSubCategories;
		$('.search-tabs', filterView.$el).append(this.searchResultTabs(
				{filterId: filterView.model.attributes.filterId,
				 aliases: aliasObjects}	));
		keys.forEach((key) => {
			var subCategories = [];
			var categorySearchResultViews = [];
			_.each(data[key], function(value){

				//trim off leading and trailing slashes.  !! Assume all data starts and ends with '\' !!
				valuePath = value.data.substr(0, value.data.length-1).split('\\');
					
				//show only the highest level category or filter matching the search term
				
				//if this gets defined later, it will change filter clicks to 'anyRecordOf' clicks.
				var categoryPath = undefined;
				//loop over all of the categories; do not evaluate the final leaf node (we know it matches from the previous case)
				//start from 2 here;  0 == empty; 1 = top level category (don't want to match)
				
				//
				// Changing to include top level path for categories
				//
				
				for (i = 1; i < valuePath.length - 1; i++) {
					
					if(valuePath[i].toLowerCase().includes(searchTerm.toLowerCase())){
						categoryPath = valuePath.slice(0,i+1).join("\\");
						//if we have already rendered this parent category, do not add another
						if(parentCategorySearchResults[categoryPath]){
							return true;
						}
						//set the data to match the parent category that we identified
						value.data = categoryPath;
						value.value = valuePath[i];
						parentCategorySearchResults[categoryPath] = true;
						//update the path so the sub categories don't render for missing items
						valuePath = value.data.substr(0, value.data.length-1).split('\\');
						//don't forget to leave the loop if we find something!
						break;
					}
				}
				
				var matchedSelections = [];
				if(!categoryPath){
					// For categorical or INFO columns, we want to render a search result for each value that matches the search term
					if(value.columnDataType == "INFO"){
						_.each(value.metadata.values, function(categoryValue){
							//use unshift here to make sure exact matches are ranked higher than partial matches
							if(categoryValue.toLowerCase() == searchTerm){
								matchedSelections.unshift(categoryValue);
							} else if (categoryValue.toLowerCase().includes(searchTerm)){
								matchedSelections.push(categoryValue);
							}
						});
					} else if ( value.columnDataType == "CATEGORICAL"	 ) {
						_.each(value.metadata.categoryValues, function(categoryValue){
							if(categoryValue.toLowerCase() == searchTerm){
								matchedSelections.unshift(categoryValue);
							} else if (categoryValue.toLowerCase().includes(searchTerm)){
								matchedSelections.push(categoryValue);
							}
						});
					}
				}
				
				//now build the objects (View/Model) for the results
				if(matchedSelections.length > 0){
					//generate an individual search result for categorical values matching the search term.
					_.each(matchedSelections, function(categoryValue){
						value.preSelection = categoryValue;
						categorySearchResultViews.push( new searchResult.View({
							queryCallback : queryCallback,
							model : new searchResult.Model(value),
							filterView: filterView,
						}));
					} );
				} else if(categoryPath || value.value.toLowerCase().includes(searchTerm)){
					value.targetCategory = categoryPath;
					categorySearchResultViews.push( new searchResult.View({
						queryCallback : queryCallback,
						model : new searchResult.Model(value),
						filterView: filterView,
						targetCategory : categoryPath
					}));
				} else {
					return true; //skip this result if no values or categories match
				}
				
				// identify any sub categories, and save them.  do not add a sub category for leaf nodes.  
				if(valuePath.length > 2){
					subCategoryName = valuePath[1];
					if(subCategories[subCategoryName] ){
						subCategories[subCategoryName] = subCategories[subCategoryName] + 1;
					} else {
						subCategories[subCategoryName] = 1;
					}
				}
				
			});
			data[key] = undefined;
			
			//check to see if we have any valid results; we may have filtered them all out
			if(categorySearchResultViews.length == 0){
				//remove the 'category pill'
				$('#'+getAliasName(key)+'-pill', filterView.$el).remove();
				aliases = aliases.filter(item => item !== getAliasName(key))
				return true; //then we don't need to worry about doing the subcategory work.
			}

			_.each(categorySearchResultViews, function(newSearchResultRow){
				newSearchResultRow.render();
			});
			
			//save this tab object so we don't keep looking it up
			var tabPane = $('#'+getAliasName(key)+'.tab-pane', filterView.$el)

			if(_.keys(subCategories).length > 1){
				$(".result-subcategories-div", tabPane).append(compiledSubCategoryTemplate(_.keys(subCategories)));
				//bootstap.js is used for the top-level category pills; here we are keeping a bit of the naming scheme
				// need to roll our own logic so that the 'all results' sub-category tab works as expected
				$(".sub-nav-pills li", tabPane).click(function(event){
					event.preventDefault();
					$(event.target.parentElement).addClass("active")
					$(event.target.parentElement).siblings().removeClass("active");
					
					if(event.target.text == "All Results"){
						_.each(categorySearchResultViews, function(result){
							result.$el.show();
						});
					} else {
						_.each(categorySearchResultViews, function(result){
							var resultPath = result.model.attributes.data.substr(1, result.model.attributes.data.length-2).split('\\');
							if(resultPath.length > 1 && resultPath[1] == event.target.text){
								result.$el.show();
							} else {
								result.$el.hide();
							}
						});
					}
				});
			}


			$(".search-result-list", tabPane).append(_.pluck(categorySearchResultViews, "$el"));

			

		});

		$("#"+_.first(aliases)).addClass("active");
		$(".nav-pills li:first-child").addClass("active");
		
		//hide category selection if only a single category.
		if(keys.length > 1) {
			$(".filter-search > .nav-pills").show();
		} else {
			$(".filter-search > .nav-pills").hide();
		}
	}.bind(searchResults);

	return searchResults;
});
