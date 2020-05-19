define(["jquery", "handlebars", "backbone", "text!settings/settings.json","filter/searchResults"], 
function($, HBS, BB, settings, searchResults){
	return {
		/*
		 * Sometimes you may want to do some validation or other logic prior
		 * to submitting a search for results. This is used in the GRIN project
		 * to handle gNOME variant spec queries which are not searchable.
		 *
		 * This should be a function that takes a JavaScript key event as it's only parameter.
		 */
		enterKeyHandler : undefined,

		filterAutocompleteResult: function(suggestion, pvalue) {
			return (pvalue != suggestion.value);
		},
		showSearchResults : function(result) {
			$('.autocomplete-suggestions').hide();
			this.model.set('searching', false);
			if(result == undefined) {
					alert("Result error");
			} else {
				$('.search-tabs', this.$el).html('');
				this.originalSearchTerm = this.model.get("searchTerm")
				var categorySearchResultList = JSON.parse(settings).categorySearchResultList;
				var searchResultObject = {};

				//inject these category names first so that the results are in a pre-set order
				_.each(categorySearchResultList, function(item){
					searchResultObject[item] = [];
				});

				_.each(result.suggestions, function(item){
					var key = item.category;
					var array = searchResultObject[key];
					if (array) {
						array.push(item);
					} else {
						searchResultObject[key] = [item];
					};
				});
				
				//we might not have entries for all our predetermined categories; clean them up!
				_.each(_.keys(searchResultObject), function(key){
					if(searchResultObject[key].length === 0){
						delete searchResultObject[key];
					}
				});
				
				this.searchResultObject = searchResultObject;
				searchResults.init(this.searchResultObject, this, this.queryCallback);
			}
		},
		onSelect : function(event, suggestion){
			if ( this.model.attributes.valueType === "ANYRECORDOF" ){
				//model should already be updated.
			}else if(this.model.attributes.concept.columnDataType==="VARIANT"){

			}else{
				this.model.set("inclusive", $('.filter-qualifier-btn', this.$el).text().trim() === "Must Have");
				this.model.set("and", $('.filter-boolean-operator-btn', this.$el).text().trim() === "AND");
				if(suggestion && suggestion.data){
					this.model.node = suggestion;
					this.model.set("searchTerm", suggestion.data);
				}
			}
			if(this.model.get("searchTerm").trim().length > 0){
				this.queryCallback();
			}
		
		},
		render: function(){
			this.$el.html(this.template(this.model.attributes));

			if(this.model.attributes.valueType ==="ANYRECORDOF"){
				$(".category-valueof-div", this.$el).html(this.constrainFilterMenuAnyRecordOfTemplate(this.model.attributes.anyRecordCategories));
			}

			var model = this.model;

			$('.dropdown-toggle', this.$el).dropdown();

			this.delegateEvents();
		}
	};
});
