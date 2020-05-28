define([ "text!overrides/outputPanel.hbs" ],
function( outputTemplate){
    
    return {
		/*
		 * This should be a function that returns the name of a Handlebars
		 * partial that will be used to render the count. The Handlebars partial
		 * should be registered at the top of this module.
		 */
		countDisplayOverride : function(count){
			if(count < 10){
				return "< 10";
			} else {
				return count;
			}
		},
		/*
		 * This is a function that if defined replaces the normal render
		 * function from outputPanel.
		 */
		renderOverride : undefined,

		/*
		 *Override the behavior of the data selection panel when updating the query 
		 */
		selectOverride: function(){
			//no op;  disable output panel
		},

		/*
		 * If you want to replace the entire Backbone.js Model that is used for
		 * the output panel, define it here.
		 */
		modelOverride : undefined,
		dataCallback: function(query, resultId, model) {
			// set this value so RedCap (data export request) fields will be displayed
			if(!this.isDefaultQuery(query)){
				model.set("picSureResultId", resultId);
			} else {
				model.set("picSureResultId", undefined);
			}
        },
        isDefaultQuery: function(query){
			return (query.query.requiredFields.length == 0 
		        && (!query.query.anyRecordOf || query.query.anyRecordOf.length == 0) 
		      	&& _.keys(query.query.numericFilters).length==0 
				&& _.keys(query.query.categoryFilters).length==0
				&& _.keys(query.query.variantInfoFilters).length==0
				&& _.keys(query.query.categoryFilters).length==0);
		},
		/*
		 * If you want to replace the entire Backbone.js View that is used for
		 * the output panel, define it here.
		 */
		viewOverride : 	undefined,
		/*
		 * In case you want to change the update logic, but not the rendering or
		 * anything else, you can define a function that takes an incomingQuery
		 * and dispatches it to the resources you choose, and handles
		 * registering callbacks for the responses and error handling.
		 */
		update: undefined,
		/*
		 * A function that takes two parameters, the first being a PUI, the
		 * second being a picsureInstance such as is configured in settings.json
		 * and returns a PUI that is valid for that picsureInstance.
		 */
		mapPuiForResource: undefined,
		/*
		 * If you want to show your customized error message, please override
		 * this
		 */
		outputErrorMessage: "There are over 100,000 variants that match your filter, please narrow your criteria by adding new variant filters or adjusting your current ones.",
		
		outputTemplate: outputTemplate
	};
});
