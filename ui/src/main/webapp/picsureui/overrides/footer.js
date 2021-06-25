define(["jquery", "handlebars", "text!footer/footer.hbs", "text!biostats/Biostats_HomePage.json"], 
		function($, HBS, template, biostats){
	
	this.template = HBS.compile(template);
	
	return {
		/*
		 * The render function for the footer can be overridden here.
		 */
		render : function(){
			this.$el.html(this.template({ footerMessage : "" }));
			
			try{
				biostatsJson = JSON.parse(biostats);
				summaries = biostatsJson.Summaries;
				
				var betterMap = {};
				_.map(summaries["Biobank Stats"], function(value){
					betterMap[value.label] = value.count;
				})
				
				footerMsg = "Data loaded as of " + betterMap["last refresh date"] ;
			}
			catch(err) {
				footerMsg = err.message;
			}
			
			$(".center", this.$el).html(footerMsg);
		}
	
	};
});