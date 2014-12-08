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


var renameGrade = function(req,res){
	var id = req.path[req.path.length-1];
	var new_grade = {id:id,newname:req.query.newname};
	school_records.updateGrade(new_grade,function(err){
		res.writeHead(302,{"Location": "/grades/"+id});
		res.end();
	});
};

exports.get_grade_summary = function(req,res,next){
	if(req.query.newname){
		renameGrade(req,res);
		return; 
	}
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

exports.update_student_summary = function(req,res,next){
	var new_student = req.body;
	new_student.studentId = req.params.id;
	school_records.updateStudentSummary(new_student,function(err){
		if(err){
			res.end("Invalid Input");
			return;			
		}
		res.writeHead(302,{"Location": "/students/"+new_student.studentId});
		res.end();
	})
};

exports.update_subject_summary = function(req,res,next){
	var new_subject = req.body;
	new_subject.subject_id = req.params.id;
	school_records.updateSubjectSummary(new_subject,function(err){
		if(err){
			res.end("Invalid Input");
			return;
		}
		res.writeHead(302,{"Location": "/subject/"+new_subject.subject_id});
		res.end();
	});
};

exports.insert_new_record = function(req,res,next){
	var new_record = req.body;
	new_record['$grade_id'] = req.params.id;
	console.log("===>>",new_record);

	var redirectToGrades = function(err){
		if(err){
			res.end("Invalid Input");
			return;
		}
		res.writeHead(302,{"Location":"/grades/"+new_record['$grade_id']});
		res.end();
	}

	new_record['$student_name'] && school_records.addNewStudent(new_record,redirectToGrades);
	new_record['$subject_name'] && school_records.addNewSubject(new_record,redirectToGrades);



};

// exports.insert_new_subject = function(req,res,next){
// 	var new_subject = req.body;
// 	new_subject.grade_id = req.params.id;
// 	school_records.addNewSubject(new_subject,function(err){
// 		if(err){
// 			res.end('Babaji ka Thullu ..|``');
// 			return;
// 		};
// 		res.writeHead(302,{"Location":"/grades/"+new_subject.grade_id});
// 		res.end();
// 	})
// };