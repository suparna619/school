var renameGrade = function (value){
	var newGradeName = prompt('GradeName');
	var url = window.location.href; 
	window.location.href = url+'?newname='+newGradeName;
};