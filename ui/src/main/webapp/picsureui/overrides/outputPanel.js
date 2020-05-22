define(["common/spinner", "output/dataSelection", "text!overrides/outputPanel.hbs","picSure/resourceMeta", "picSure/ontology", "picSure/queryBuilder", "picSure/queryCache", "backbone", "handlebars"],
		function(spinner, dataSelection, outputTemplate, resourceMeta, ontology, queryBuilder, queryCache, BB, HBS){
	HBS.registerHelper("outputPanel_obfuscate", function(count){
		return count;
		
	});

	var subQueries = [
		{
			additionalPui : undefined,
			name : "Patients Enrolled",
			id : "PatientsEnrolled"
		},
		{
			additionalPui : "\\Bio Specimens\\HumanFluid\\Blood (Whole)\\Blood (Whole)\\Bio Specimens:HF.BLD.000\\",
			name : "Whole Blood",
			id : "HumanFluid"
		},
		{
			additionalPui : "\\Bio Specimens\\HumanFluid\\Plasma\\Plasma\\Bio Specimens:HF.PLS.000\\",
			name : "Plasma",
			id : "HumanPlasma"
		},
		{
			additionalPui : "\\Bio Specimens\\HumanTissue\\",
			name : "Tissue",
			id : "HumanTissue"
		},
		{
			additionalPui : "\\Bio Specimens\\NucleicAcid\\",
			name : "Extracted DNA",
			id : "NucleicAcid"
		},
		{
			additionalPui : "\\Next Generation Sequencing\\Exomes\\",
			name : "DNA Sequencing",
			id : "genomicCount",
//			additionalVariantCategory: "{\"Variant_severity\": [\"LOW\"]}"
		},
		];
	var outputModelDefaults = {
			totalPatients : 0,
			spinnerClasses: "spinner-medium spinner-medium-center ",
			spinning: false,
			resources : {}
	};
	_.each(subQueries, (resource) => {
		if(resource.id !== "PatientsEnrolled"){
			outputModelDefaults.resources[resource.id] = {
					id: resource.id,
					name: resource.name,
					patientCount: 0,
					spinnerClasses: "spinner-small spinner-small-center ",
					spinning: false
			};
		}
	});

	var outputModel = BB.Model.extend({
		defaults: outputModelDefaults,
		spinAll: function(){
			this.set('spinning', true);
			this.set('queryRan', false);
			_.each(this.get('resources'), function(resource){
				resource.i2b2ResultId = undefined;
				resource.spinning=true;
				resource.queryRan=false;
			});
		}
	});

	var outputView = BB.View.extend({
		initialize: function(){
			this.template = HBS.compile(outputTemplate);
		},
		totalCount: 0,
		tagName: "div",
		update: function(incomingQuery){
			this.model.set("totalPatients",0);
			if (incomingQuery.query.requiredFields.length == 0
					&& _.keys(incomingQuery.query.numericFilters).length==0 
					&& _.keys(incomingQuery.query.categoryFilters).length==0
					&& _.keys(incomingQuery.query.variantInfoFilters).length==0
					&& _.keys(incomingQuery.query.categoryFilters).length==0) {
				//clear the model
				_.each(this.model.get('resources'), function(picsureInstance){
					picsureInstance.id.patientCount = 0;
				}.bind(this));
				this.render();
				return;
			}
			this.model.spinAll();
			this.render();

			var updateDataSelection = function(query){
				//Removed until performance and authorization improved.
				
//				if(!this.dataSelection){
//					this.dataSelection = new dataSelection({query:query});
//					$("#concept-tree-div",this.$el).append(this.dataSelection.$el);
//				} else {
//					this.dataSelection.updateQuery(query);
//				}
//				this.dataSelection.render();
			}.bind(this);
			
			var isDefaultQuery = function(query){
				return (query.query.requiredFields.length == 0 && 
						(!query.query.anyRecordOf || query.query.anyRecordOf.length == 0) &&
						_.keys(query.query.categoryFilters).length == 0 && 
						_.keys(query.query.numericFilters).length == 0 );
				
			}
			
			_.each(subQueries, function(subQuery){

				// make a safe deep copy of the incoming query so we don't modify it
				var query = JSON.parse(JSON.stringify(incomingQuery));

				if(subQuery.additionalPui) {
					query.query.requiredFields.push(subQuery.additionalPui);
				}
				
				//handle 'number of genomic samples'.  do not overwrite an existing variant info (likely selected by user)
				if(subQuery.additionalVariantCategory &&  _.isEmpty(query.query.variantInfoFilters[0].categoryVariantInfoFilters)){
					query.query.variantInfoFilters[0].categoryVariantInfoFilters = JSON.parse(subQuery.additionalVariantCategory);
				}

				var dataCallback = function(result, resultId){
					if(subQuery.id === "PatientsEnrolled"){
						var count = parseInt(result);
						this.model.set("totalPatients", count);
						
						updateDataSelection(query);
						
						//set this value so RedCap (data export request) fields will be displayed
						if(!isDefaultQuery(query)){
							this.model.set("picSureResultId", resultId);
						} else {
							this.model.set("picSureResultId", undefined);
						}
						
						//Otherwise just call the subqueries defined
					}else{
						var count = parseInt(result);
						this.model.get("resources")[subQuery.id].queryRan = true;
						this.model.get("resources")[subQuery.id].patientCount = count;
						this.model.get("resources")[subQuery.id].spinning = false;
						if(_.every(this.model.get('resources'), (resource)=>{return resource.spinning==false})){
							this.model.set("spinning", false);
							this.model.set("queryRan", true);
						}
					}
					this.render();
				}.bind(this);

				var errorCallback = function(response){
					if(subQuery.id === "PatientsEnrolled"){
						this.model.set("totalPatients", '-');
					}else{
						this.model.get("resources")[subQuery.id].queryRan = true;
						this.model.get("resources")[subQuery.id].patientCount = '-';
						this.model.get("resources")[subQuery.id].spinning = false;
						if(_.every(this.model.get('resources'), (resource)=>{return resource.spinning==false})){
							this.model.set("spinning", false);
							this.model.set("queryRan", true);
						}
					}
					this.render();
				}.bind(this);
				
//				queryCache.submitQuery(
//						resourceMeta[0],
//						query,
//						subQuery.id,
//						dataCallback);
				$.ajax({
				 	url: window.location.origin + "/picsure/query/sync",
				 	type: 'POST',
				 	headers: {"Authorization": "Bearer " + JSON.parse(sessionStorage.getItem("session")).token},
				 	contentType: 'application/json',
				 	data: JSON.stringify(query),
				 	success: function(response, textStatus, request){
				 		
				 		dataCallback(response, request.getResponseHeader("resultId"));
						}.bind(this),
				 	error: function(response){
						response.responseText = "<h4>There are over 100,000 variants that match your filter, please narrow your criteria by adding new variant filters or adjusting your current ones.</h4>";
				 		errorCallback(response);//console.log("error");console.log(response);
				 	}
				});
			}.bind(this));
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
            
           // sel.removeAllRanges();
        },
		render: function(){
			var context = this.model.toJSON();
			this.$el.html(this.template(context));
			if(this.dataSelection){
				this.dataSelection.setElement($("#concept-tree-div",this.$el));
				this.dataSelection.render();
			}
			
			$('.copy-button').click(this.copyToken);
		}
	});

	return {
		View : new outputView({
			model: new outputModel()
		})
	}
});
