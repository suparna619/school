var sqlite3 = require("sqlite3");
var db = new sqlite3('data/try.db');

var q1 = 'select * from students;';
var q2 = 'select * from grades;';

QString q1;
q1.append(q2);

var _updateStudentSummary = function(new_student,db,onComplete){
	var select_query = "select grade_id from students where id="+new_student.studentId;
	db.get(select_query,function(err,student){
		err && console.log(err);
		var grade_query = "update grades set name='" + new_student.gradeName+"' where id="+student.grade_id;
		db.run(grade_query,function(egr){
			egr && console.log(egr)
			var student_query = "update students set name='"+new_student.studentName+"' where id="+new_student.studentId;
			db.run(student_query,function(err){
				err && console.log(err);
				var ids = getSubjectIds(new_student);
				var score_query1 = "update scores set score='"+new_student["subId_"+ids[0]]+"' where subject_id="+ids[0];
				db.run(score_query1,function(esc1){
					var score_query2 = "update scores set score='"+new_student["subId_"+ids[1]]+"' where subject_id="+ids[1];
					db.run(score_query2,function(esc2){
						var score_query3 = "update scores set score='"+new_student["subId_"+ids[2]]+"' where subject_id="+ids[2];	
						db.run(score_query3,onComplete);
					});
					
				});
			});
		});
	});
}