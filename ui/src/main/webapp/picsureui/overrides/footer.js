define(["jquery", "handlebars", "text!footer/footer.hbs", "picSure/settings"], 
		function($, HBS, template, settings){
	
	this.template = HBS.compile(template);
	
	return {
		/*
		 * The render function for the footer can be overridden here.
		 */
		render : function(){
			
			footerMessage = "";
			if( settings.lastRefreshDate){
				footerMessage = "Data loaded as of " + settings.lastRefreshDate;
			}
			this.$el.html(this.template({ footerMessage : footerMessage }));
		}
	
	};
});