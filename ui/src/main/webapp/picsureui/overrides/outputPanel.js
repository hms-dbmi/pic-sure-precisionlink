define([ "text!overrides/output/outputPanel.hbs",  "picSure/settings", "common/transportErrors" ],
function( outputTemplate, settings, transportErrors){
	
	var resources = {};
	
	_.each(settings.resources, (resource) => {
		
		//base resource first; this will be the 'all patients' or main query
		resources[resource.id] = {
				id: resource.id,
				name: resource.name,
				patientCount: 0,
				spinnerClasses: "spinner-center ",
				spinning: false
		};
		
		//then check to see if we have sub queries for this resource - add those as 'resource' items as well
		_.each(resource.subQueries, (resource) => {
  			resources[resource.id] = {
  					id: resource.id,
  					name: resource.name,
  					additionalPui: resource.additionalPui,
  					patientCount: 0,
  					spinnerClasses: "spinner-small spinner-small-center ",
  					spinning: false
  			};
		});
	});
    
    return {
    	
    	resources: resources,
		/*
		 * This should be a function that returns the name of a Handlebars
		 * partial that will be used to render the count. The Handlebars partial
		 * should be registered at the top of this module.
		 */
		countDisplayOverride : undefined,
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
		outputErrorMessage: "A server error occurred. please use the help link for further support.",
		
		outputTemplate: outputTemplate,
		
		dataCallback: function(resource, result, resultId, model, defaultOutput){
				var count = parseInt(result);
			
				//if this is the main resource query, set total patients
				if(resource.additionalPui == undefined){
					model.set("totalPatients", count);
					/// set this value so RedCap (data export request) fields will be displayed
					if(!this.isDefaultQuery(model.get("query"))){
						model.set("picSureResultId", resultId);
					} else {
						model.set("picSureResultId", undefined);
					}
				}
				
				resources[resource.id].queryRan = true;
				resources[resource.id].patientCount = count;
				resources[resource.id].spinning = false;
					
				defaultOutput.render();
				
				if(_.every(resources, (resource)=>{return resource.spinning==false})){
					model.set("spinning", false);
					model.set("queryRan", true);
				} else {
					console.log("still waiting");
				}
		},
		
		errorCallback: function(resource, message, defaultOutput){
				if(resource.additionalPui == undefined){
					model.set("totalPatients", '-');
				}
				
				resources[resource.id].queryRan = true;
				resources[resource.id].patientCount = '-';
				resources[resource.id].spinning = false;
				
				if(_.every(resources, (resource)=>{return resource.spinning==false})){
					model.set("spinning", false);
					model.set("queryRan", true);
				} else {
					console.log("still waiting");
				}
				
				defaultOutput.render();
				
				if(resource.additionalPui == undefined){
					$("#patient-count").html(message);
				} else {
					console.log("error in query");
				}
		},
		
		/*
		 * The new hook for overriding all custom query logic
		 */
		runQuery: function(defaultOutput, incomingQuery, defaultDataCallback, defaultErrorCallback){
			var model = defaultOutput.model;
			model.set("totalPatients",0);
			model.spinAll();
			
			
			
			//clear out the result count for resources/subqueries if we have no filters.  TODO: not sure why this is happening
			//we can't check for 'required fields' here because the subqueries may use that to drive some selection
//  			if (incomingQuery.query.requiredFields.length == 0
//				&& _.keys(incomingQuery.query.numericFilters).length==0 
//				&& _.keys(incomingQuery.query.categoryFilters).length==0
//				&& _.keys(incomingQuery.query.variantInfoFilters).length==0
//				&& _.keys(incomingQuery.query.categoryFilters).length==0) {
//  				_.each(resources, function(picsureInstance){
//	  					picsureInstance.id.patientCount = 0;
//	  				}.bind(this));
//	  			}
			
  			defaultOutput.render();

			//run a query for each resource 
			_.each(resources, function(resource){
				// make a safe deep copy (scoped per resource) of the incoming query so we don't modify it
				var query = JSON.parse(JSON.stringify(incomingQuery));
				model.baseQuery = incomingQuery;
				
				query.resourceUUID = settings.picSureResourceId;
				query.resourceCredentials = {};
				query.query.expectedResultType="COUNT";
			
				//if this is the base resource, we should update the model and everything else
  				if(resource.additionalPui == undefined) {
  					model.set("query", query);
  				} else {
  					query.query.requiredFields.push(resource.additionalPui);
  				}
				
  				// handle 'number of genomic samples'. do not overwrite an existing variant info (likely selected by user)
  				if(resource.additionalVariantCategory &&  _.isEmpty(query.query.variantInfoFilters[0].categoryVariantInfoFilters)){
  					query.query.variantInfoFilters[0].categoryVariantInfoFilters = JSON.parse(resource.additionalVariantCategory);
  				}

				$.ajax({
				 	url: window.location.origin + "/picsure/query/sync",
				 	type: 'POST',
				 	headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("session")).token},
				 	contentType: 'application/json',
				 	data: JSON.stringify(query),
  				 	success: function(response, textStatus, request){
  				 		this.dataCallback(resource, response, request.getResponseHeader("resultId"), model, defaultOutput);
  						}.bind(this),
				 	error: function(response){
						if (!transportErrors.handleAll(response, "Error while processing query")) {
							response.responseText = "<h4>"
								+ overrides.outputErrorMessage ? overrides.outputErrorMessage : "There is something wrong when processing your query, please try it later, if this repeats, please contact admin."
								+ "</h4>";
					 		this.errorCallback(resource, response.responseText, defaultOutput);
						}
					}.bind(this)
				});
			}.bind(this));
		}
	};
});
