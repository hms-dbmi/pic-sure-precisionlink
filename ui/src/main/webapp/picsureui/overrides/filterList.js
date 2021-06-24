define(["jquery", "handlebars", "backbone", "picSure/settings"], 
function($, HBS, BB, settings){
	return {
		/*
		 * hook to allow overrides to send more info to the help info modal
		 */
		renderHelpCallback : function(filterView) {
	        ontology.getInstance().allInfoColumnsLoaded.then(function(){
	            $('.show-help-modal').click(function() {
	            	
	            	var modalData = {
	            		infoColumns: 	ontology.getInstance().allInfoColumns(),
	            		gemonicBatches: settings.genomicBatches
	            	};
	            	
	                $('#modal-window').html(HBS.compile(searchHelpTooltipTemplate)(modalData));
	                $('#modal-window', this.$el).tooltip();
	                $(".close").click(function(){
	                    $("#search-help-modal").hide();
	                });
	                $("#search-help-modal").show();
	            });
	        }.bind(filterView));
	    }
	};
});