
$("#get-trails-btn").click(function(){
	console.log("btn pressed");

	$.ajax({
  	url: "/api/trails",
	  success: function( result ) {
	    console.log("result", result);
	  }
	});
})

