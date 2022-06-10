define(["jquery", "handlebars", "backbone", "picSure/ontology", "picSure/settings", "text!filter/searchHelpTooltip.hbs"],
function($, HBS, BB, ontology, settings, searchHelpTooltipTemplate){
	return {
		/*
		 * hook to allow overrides to send more info to the help info modal
		 */
		renderHelpCallback : function(filterView) {
	            $('.show-help-modal').click(function() {

	            	var modalData = {
	            		infoColumns: 	ontology.getInstance().allInfoColumns(),
	            		genomicBatches: settings.genomicBatches
	            	};

	                $('#modal-window').html(HBS.compile(searchHelpTooltipTemplate)(modalData));
	                $('#modal-window', this.$el).tooltip();
	                $(".close").click(function(){
	                    $("#search-help-modal").hide();
	                });
	                $("#search-help-modal").show();
	            });
	    }
	};
});
