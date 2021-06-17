define([ "text!overrides/output/outputPanel.hbs",  "picSure/settings", "common/transportErrors", "backbone", ],
function( outputTemplate, picsureSettings, transportErrors, BB){
	
	var resources = {};
	
	
    return {
    	
    	resources: resources,
    	biosampleFields:  picsureSettings.biosampleFields,
    	genomicFields: picsureSettings.genomicFields,
    	
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
		 * If you want to replace the entire Backbone.js Model that is used for
		 * the output panel, define it here.
		 */
		modelOverride :  BB.Model.extend({
			spinAll: function(){
				this.set('spinning', true);
				this.set('queryRan', false);
	  			
				_.each(resources, function(resource){
	  				resource.spinning=true;
	  				resource.queryRan=false;
	  			});
			}
		}),
		
        isDefaultQuery: function(query){
			return (query.query.requiredFields.length == 0 
		        && (!query.query.anyRecordOf || query.query.anyRecordOf.length == 0) 
		      	&& _.keys(query.query.numericFilters).length==0 
				&& _.keys(query.query.categoryFilters).length==0
				&& (_.keys(query.query.variantInfoFilters).length==0
						|| (_.keys(query.query.variantInfoFilters).length==1 
								&& _.keys(query.query.variantInfoFilters[0].categoryVariantInfoFilters).length==0 
								&& _.keys(query.query.variantInfoFilters[0].numericVariantInforFilters).length==0))
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
		 * If you want to show your customized error message, please override
		 * this
		 */
		outputErrorMessage: "A server error occurred. please use the help link for further support.",
		
		outputTemplate: outputTemplate,
		
		allPatientsConcept: "\\Demographics\\Age\\",
		biobankPatientsConcept: "\\BIOBANK_CONSENTED\\",
		
		dataCallback: function(crossCounts, resultId, model, defaultOutput){
			var model = defaultOutput.model;

			genomicPatientCount = 0;
			
			$("#patient-count").html(parseInt(crossCounts[this.allPatientsConcept]).toLocaleString());
			/// set this value so RedCap (data export request) fields will be displayed
			if(!this.isDefaultQuery(model.get("query"))){
				model.set("picSureResultId", resultId);
				$(".picsure-result-id").html(resultId);
			} else {
				model.set("picSureResultId", undefined);
				$(".picsure-result-id").html("");
			}
			
			_.each(this.genomicFields, function(genomicMetadata){
				genomicMetadata.count = parseInt(crossCounts[genomicMetadata.conceptPath]);
				genomicPatientCount += genomicMetadata.count;
				$("#genomic-results-" + genomicMetadata.id + "-count").html(genomicMetadata.count.toLocaleString()); 
			});
			model.set("totalGenomicData", genomicPatientCount);
			$("#genomic-count").html(genomicPatientCount.toLocaleString());
			
			_.each(this.biosampleFields, function(biosampleMetadata){
				biosampleMetadata.count = parseInt(crossCounts[biosampleMetadata.conceptPath]);
				$("#biosamples-results-" + biosampleMetadata.id + "-count").html(biosampleMetadata.count.toLocaleString()); 
			});
			
			model.set("totalBiosamples", crossCounts[this.biobankPatientsConcept]);
			$("#biosamples-count").html(parseInt(crossCounts[this.biobankPatientsConcept]).toLocaleString());

//			defaultOutput.render();
			/** Can't extend view event hash because the view object can't find the functions in this override*/
			$(".copy-button").click(this.copyToken);
		},
		
		errorCallback: function(resource, message, defaultOutput){
			var model = defaultOutput.model;
			_.each(model.get("resources"),function(resource){
				resource.queryRan = true;
				resource.patientCount = '-';
				resource.spinning = false;
			});
			model.set("totalPatients", '-');
			model.set("spinning", false);
			
			defaultOutput.render();
			
			$("#patient-count").html(message);
		},
		
		/*
		 * The new hook for overriding all custom query logic
		 */
		runQuery: function(defaultOutput, incomingQuery, defaultDataCallback, defaultErrorCallback){
			var model = defaultOutput.model;
			model.set("resources", this.resources);
			model.set("totalPatients",0);
			model.set("biosampleFields", this.biosampleFields);
			model.set("genomicFields", this.genomicFields);
			model.spinAll();
			
  			defaultOutput.render();

			// make a safe deep copy of the incoming query so we don't modify it
			var query = JSON.parse(JSON.stringify(incomingQuery));
  			model.set("query", query);

			// configure for CROSS_COUNT query type
  			query.query.expectedResultType = 'CROSS_COUNT';
  			query.query.crossCountFields = [this.allPatientsConcept, this.biobankPatientsConcept].concat(
  					_.pluck(this.genomicFields, "conceptPath"), _.pluck(this.biosampleFields, "conceptPath")
  			);
			
			$.ajax({
			 	url: window.location.origin + "/picsure/query/sync",
			 	type: 'POST',
			 	headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("session")).token},
			 	contentType: 'application/json',
			 	data: JSON.stringify(query),
				success: function(response, textStatus, request){
				 		this.dataCallback(response, request.getResponseHeader("resultId"), model, defaultOutput);
				}.bind(this),
			 	error: function(response){
					if (!transportErrors.handleAll(response, "Error while processing query")) {
						response.responseText = "<h4>"
							+ this.outputErrorMessage;
							+ "</h4>";
				 		this.errorCallback(resources["PrecisionLink"], response.responseText, defaultOutput);
					}
				}.bind(this)
			});

		},
		
		copyToken: function(){
            var sel = getSelection();
            var range = document.createRange();

            var element = $(".picsure-result-id")[0]
            // this if for supporting chrome, since chrome will look for value instead of textContent
            element.value = element.textContent;
            range.selectNode(element);
            sel.removeAllRanges();
            sel.addRange(range);
            document.execCommand("copy");
        }
	};
});
