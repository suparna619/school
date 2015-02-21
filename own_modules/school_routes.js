var school_records = require('./school_records').init('./data/school.db');
exports.get_grades = function(req,res){
	school_records.getGrades(function(err,grades){
		res.render('grades',{grades:grades});
	});
};

exports.get_students = function(req,res){
	school_records.getStudentsByGrade(function(err,grades){
		res.render('students',{grades:grades});
	});
};

exports.get_subjects = function(req,res){
	school_records.getSubjectsByGrade(function(err,grades){
		res.render('subjects',{grades:grades});
	});
};

exports.get_student = function(req,res,next){
	school_records.getStudentSummary(req.params.id,
	function(err,student){
		if(!student) 
			next();
		else 
			res.render('student',student);
	});
};

exports.get_subject_summary = function(req,res,next){
	school_records.getSubjectSummary(req.params.id,
	function(err,subject){
		if(!subject) 
			next();
		else 
			res.render('subject',{'subject':subject});
	});
};


var renameGrade = function(new_record,onComplete){
	new_record.id = new_record['$grade_id'];
	school_records.updateGrade(new_record,onComplete);
};

exports.get_grade_summary = function(req,res,next){
	school_records.getGradeSummary(req.params.id,function(err,grade){		
		if(!grade)
			next();
		else
			res.render('grade',grade);
	});
};

exports.edit_student_summary = function(req,res,next){
	school_records.getStudentSummary(req.params.id,function(err,student){
		if(!student) 
			next();
		else 
			res.render('editStudentSummary',student);
	});
};

exports.edit_subject_summary = function(req,res,next){
	school_records.getSubjectSummary(req.params.id, function(err,s){
		if(!s)
			next();
		else
			res.render('editSubjectSummary',s[0]);
	});
};

exports.add_new_student = function(req,res){
	res.render('addNewStudent',{id:req.params.id});
};

exports.add_new_subject = function(req,res){
	res.render('addNewSubject',{id:req.params.id});
};

exports.add_new_score = function(req,res,next){
	var ids = {};
	ids.subject_id = req.params.subject_id;
	ids.student_id = req.params.student_id;
	res.render('addNewScore',{ids:ids});
};

exports.update_student_summary = function(req,res,next){
	var new_student = req.body;
	new_student.studentId = req.params.id;
	school_records.updateStudentSummary(new_student,function(err){
		if(err){
			res.send(err);		
		}
		else{
			res.redirect("/students/"+new_student.studentId);
		}
	})
};

exports.update_subject_summary = function(req,res,next){
	var new_subject = req.body;
	new_subject['$subject_id'] = req.params.id;
	school_records.updateSubjectSummary(new_subject,function(err){
		if(err){
			res.end("Invalid Input");
			return;
		}
		res.redirect("/subject/"+new_subject['$subject_id'])
	});
};

exports.insert_new_record = function(req,res,next){
	var new_record = req.body;
	new_record['$grade_id'] = req.params.id;
	var redirectToGrades = function(err){
		if(err){
			res.redirect("/error");
			return;
		}
		res.redirect("/grades/"+new_record['$grade_id']);
	}

	new_record['$student_name'] && school_records.addNewStudent(new_record,redirectToGrades);
	new_record['$subject_name'] && school_records.addNewSubject(new_record,redirectToGrades);
	new_record['newname'] && renameGrade(new_record,redirectToGrades);
};

exports.showError = function(req,res){
	res.render('displayError');
};

exports.update_grade = function(req,res){
	var new_grade = req.body;
	new_grade.studentId = req.params.id;
	console.log(new_grade);
	school_records.updateGradeOfStudent(new_grade,function(er){
		res.redirect('/editStudentSummary/'+new_grade.studentId);
	})
	console.log(new_grade);
};