var _updateSubjectSummary = function(new_subject,db,onComplete){
	var grade_query = "select id from grades where name='"+new_subject.grade_name+"'";
	var subject_query = "update subjects set name='"+new_subject.subject_name
		+"', maxScore="+new_subject.maxScore+" where id="+new_subject.subject_id;
	console.log("gradeq.....>",grade_query);
	db.get(grade_query,function(egr,grade){
		new_subject.grade_id = grade.id;
		console.log("new sub......>",new_subject);
		db.run(subject_query,function(err){
			err && console.log(err);
			db.run('update subjects set grade_id='+new_subject.grade_id+" where id="+new_subject.subject_id,function(egr){onComplete(null)});
		});
	});
};