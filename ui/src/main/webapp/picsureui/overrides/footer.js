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
				console.log(biostats);
				biostatsJson = JSON.parse(biostats);
				summaries = biostatsJson.Summaries;
				
				var betterMap = {};
				_.map(summaries["Biobank Stats"], function(value){
					betterMap[value.label] = value.count;
				})
				
				footerMsg = "As of " + betterMap["last refresh date"] + 
			            " Available Biospecimens and Data: " + 
			            betterMap["patients with phenotype data"] + " enrolled patients with phenotype data. " + 
			            betterMap["patients with 1+ specimens"] + " patients with 1+ specimens. " + 
			            betterMap["patients with genomic data"] + " patients with genomic data. " + 
			            betterMap["specimens"] + " specimens";
			}
			catch(err) {
				footerMsg = err.message;
			}
			
			$(".center", this.$el).html(footerMsg);
		}
	
	};
});