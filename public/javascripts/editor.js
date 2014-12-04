var renameGrade = function (value){
	var newGradeName = prompt('GradeName');
	console.log(value+" "+newGradeName);
	var url = window.location.href; 
	window.location.href = url+'?newname='+newGradeName;
};