var sqlite3 = require("sqlite3").verbose();

var _getGrades = function(db,onComplete){
	var q = 'select * from grades';
	db.all(q,onComplete);
};

var _getStudentsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){		
		db.all('select * from students', function(err1,students){
			grades.forEach(function(g){
				g.students = students.filter(function(s){return s.grade_id==g.id});
			})			
			onComplete(null,grades);
		})
	});	
};

var _getSubjectsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){		
		db.all('select * from subjects', function(err1,subjects){
			grades.forEach(function(g){
				g.subjects = subjects.filter(function(s){return s.grade_id==g.id});
			})			
			onComplete(null,grades);
		})
	});	
};

var _getStudentSummary = function(id, db,onComplete){
	var student_grade_query = 'select s.name as name, s.id as id, g.name as grade_name,'+
		' g.id as grade_id from students s, grades g where s.grade_id = g.id and s.id='+id;

	db.get(student_grade_query,function(est,student){
		if(!student){
			onComplete(null,null);
			return;
		};
		var subject_score_query = 'select su.name, su.id, su.maxScore, sc.score from subjects su, scores sc'+
			' where su.id = sc.subject_id and sc.student_id ='+id+' and su.grade_id='+student.grade_id;

		db.all(subject_score_query,function(esc,subjects){
			student.subjects = subjects || [];
			onComplete(null,student);
		});
	});
};

var _getGradeSummary = function(id,db,onComplete){
	var student_query = "select id,name from students where grade_id="+id;
	var subject_query = "select id,name from subjects where grade_id="+id;
	var grade_query = "select id,name from grades where id="+id;
	db.get(grade_query,function(err,grade){
		db.all(student_query,function(est,students){
			grade.students = students;
			db.all(subject_query,function(esu,subjects){
				grade.subjects = subjects;
				onComplete(null,grade);		
			});
		});
	});
};

var _updateGrade = function(new_grade,db,onComplete){
	var query = "update grades set name='"+new_grade.newname+"' where id="+new_grade.id;
	db.run(query,onComplete);
}

var _getSubjectSummary = function(id,db,onComplete){
	var query  = 'select sb.id as subject_id, sb.name as subject_name, sb.maxScore, g.id as  grade_id,'+
		'g.name as grade_name, st.name as student_name, st.id as student_id, sc.score as score from students st,'+
		' grades g, subjects sb, scores sc where sb.id ='+id+' and sc.subject_id = '+id+
		' and sc.student_id = st.id and st.grade_id = g.id;';

	db.all(query , function(err, subjectSummary){
		onComplete(null , subjectSummary);
	});
};

var getSubjectIds = function(new_student){
	var expression = new RegExp(/^subId_/);
	var ids = Object.keys(new_student).filter(function(key){
		return key.match(expression) && key;
	});
	return ids.map(function(id){
		return id.split('_')[1];
	})

};

var _updateGradeOfStudent = function(new_grade,db,onComplete){
	db.get("select id from grades where name='"
	 +new_grade.gradeName+"'",function(egr,grade){
		if(!grade){
			egr=true;
			onComplete(egr);
			return;
		}
		new_grade.gradeId = grade.id;
		var grade_query = "update students set grade_id='" + 
			new_grade.gradeId+"' where id="+new_grade.studentId;
		db.run(grade_query,function(egr){
			egr && console.log(egr)

			var subject_query = 'select id from subjects where grade_id='+
				new_grade.gradeId;

			db.all(subject_query,function(er,subjectIDs){
				subjectIDs.forEach(setScore)
			});
		});
	});

	var setScore = function(sub,index,ids){
		var delete_previous_records = 'delete from scores where student_id='+
		 new_grade.studentId+' and subject_id='+sub.id;
		var score_query = 'insert into scores(student_id,subject_id,score) values ('+
			new_grade.studentId+','+sub.id+', "-");';

		db.run(delete_previous_records,function(edr){	
			edr && console.log(edr);
			db.run(score_query,function(err){
				err && console.log(err);
			});
			if(index == ids.length-1){
				onComplete(null);
			}
		});
	};
};

// var updateGradeId=function(new_student,db,onComplete){
// 	console.log(new_student,"----------->>previous");
// 	db.get("select id from grades where name='"+new_student.gradeName+"'",function(egr,grade){
// 		if(!grade){
// 			egr=true;
// 			onComplete(egr);
// 			return;
// 		}
// 		new_student.gradeId = grade.id;
// 		var grade_query = "update students set grade_id='" + new_student.gradeId+"' where id="+new_student.studentId;
// 		db.run(grade_query,function(egr){
// 			egr && console.log(egr)
// 		});
// 		console.log(new_student,"----------->>");
// 	});
// };

var updateStudentName=function(new_student,db){
	var student_query = "update students set name='"+new_student.studentName+"' where id="+new_student.studentId;
	db.run(student_query,function(err){
		err && console.log(err);
	});
};

var isScorePresent = function(key){
	return key.match(/^subId_/);
};

var _updateStudentSummary = function(new_student,db,onComplete){
	// updateGradeId(new_student,db,onComplete);
	updateStudentName(new_student,db);

	var isScore = Object.keys(new_student).some(isScorePresent);
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`",isScore)
	if(!isScore){
		onComplete(null);
		return;
	}
	var ids = getSubjectIds(new_student);
	ids.forEach(function(id,index,array){
		var score_query = "update scores set score='"+new_student["subId_"+id]
			+"' where subject_id="+id+" and student_id="+new_student.studentId ;
		db.run(score_query,function(esc){
			if(index==array.length-1){
				onComplete(null);
				return;
			};
		});
	});
};

var updateSubject = function(new_subject,db,onComplete){
	var subject_query = "update subjects set name='"+new_subject.subject_name
		+"', maxScore="+new_subject.maxScore+" where id="+new_subject['$subject_id'];
	
	db.run(subject_query,function(err){
		err && console.log(err);
		var subject_grade_query = 'update subjects set grade_id='+new_subject.grade_id+
			" where id="+new_subject['$subject_id'];
		db.run(subject_grade_query,onComplete);
	});
};

var addScore = function(new_subject,db,onComplete) {
	var score;
	Object.keys(new_subject).forEach(function(key){
		if(key.indexOf('$score')==0)
			score=key;
	});
	new_subject['$student_id'] =score.split('_')[1];
	var update_score_query = 'update scores set score= $score_'+new_subject['$student_id']+
	' where student_id=$student_id and subject_id=$subject_id';
	db.run(update_score_query,new_subject,onComplete);
};

var _updateSubjectSummary = function(new_subject,db,onComplete){
	var isScorePresent = Object.keys(new_subject).some(function(key){
		return key.indexOf('$score')==0;
	});
	if(isScorePresent){
		addScore(new_subject,db,onComplete);
		return;
	}
	var grade_query = "select id from grades where name= '"+new_subject.grade_name+"'";
	db.get(grade_query,function(egr,grade){
		if(!grade){
			egr=true;
			onComplete(null);
			return;
		}
		new_subject.grade_id = grade.id;
		updateSubject(new_subject,db,onComplete);
	});
};

var insertStudent=function(new_student,db,setScore){
	var subject_query = "select id from subjects where grade_id="+new_student['$grade_id'];
	var student_query = "insert into students(name, grade_id) values('"+ new_student['$student_name']+"',"
		+new_student['$grade_id']+");";
	db.all(subject_query,function(egr,subject){
		db.run(student_query,function(err){
			subject.forEach(setScore);
		});
	});
};


var _addNewStudent = function(new_student,db,onComplete){
	var student_query = "select max(id) from students";
	db.get(student_query,function(err,studentIds){
		var lastId =studentIds['max(id)'];

		var setScore = function(sub,index,array){
			var score_query = 'insert into scores(student_id,subject_id,score) values('
				+(lastId+1)+','+sub.id+',"-")'
			db.run(score_query,function(err){
				if(index==array.length-1){
					onComplete(null);
					return;
				};
			});
		};
		insertStudent(new_student,db,setScore);
	});	
};

var _addNewSubject = function(new_subject,db,onComplete){
	var subject_id_query = "select max(id) from subjects";
	
	db.get(subject_id_query,function(err,subjectIds){
		var lastId = subjectIds['max(id)'];
		var setScore = function(id,index,ids){
			var score_query = 'insert into scores(student_id,subject_id,score)'+
				' values('+id.id+','+(lastId+1)+',"-");'
			db.run(score_query,function(err){
				err && console.log(err);
				if(index==ids.length-1){
					onComplete(null);
					return;
				};
			});
		};
		
		var subject_query = 'insert into subjects(name,grade_id,maxScore)'+
			'values($subject_name,$grade_id,$maxScore);';
		db.run(subject_query,new_subject,function(err){
			err && console.log(err);
			db.all('select id from students where grade_id='+new_subject['$grade_id'],function(err,students){
				students.forEach(setScore);
			});
		});

	});
};



var init = function(location){	
	var operate = function(operation){
		return function(){
			var onComplete = (arguments.length == 2)?arguments[1]:arguments[0];
			var arg = (arguments.length == 2) && arguments[0];

			var onDBOpen = function(err){
				if(err){onComplete(err);return;}
				db.run("PRAGMA foreign_keys = 'ON';");
				arg && operation(arg,db,onComplete);
				arg || operation(db,onComplete);
				db.close();
			};
			var db = new sqlite3.Database(location,onDBOpen);
		};	
	};

	var records = {		
		getGrades: operate(_getGrades),
		getStudentsByGrade: operate(_getStudentsByGrade),
		getSubjectsByGrade: operate(_getSubjectsByGrade),
		getStudentSummary: operate(_getStudentSummary),
		getGradeSummary: operate(_getGradeSummary),
		getSubjectSummary: operate(_getSubjectSummary),
		updateGrade : operate(_updateGrade),
		updateStudentSummary : operate(_updateStudentSummary),
		updateSubjectSummary : operate(_updateSubjectSummary),
		addNewStudent : operate(_addNewStudent),
		addNewSubject : operate(_addNewSubject),
		updateGradeOfStudent : operate(_updateGradeOfStudent)
	};

	return records;
};

exports.init = init;