describe('#getNewStudents',function(){
		it('get new student',function(done){
			var new_subject = {'$subject_name':"French",'$grade_id':1,'$maxScore':50};
			school_records.addNewSubject(new_subject,function(err){
				school_records.getNewStudents(4,function(err,newStudents){
					assert.notOk(err);
					assert.lengthOf(newStudents,4);
					assert.deepEqual(newStudents[0].subjects,[{name:'French',id:4,maxScore:50,score:'-'}]);
					done();
				});
			});
		});
	});





var _getNewStudents = function(subjectId,db,onComplete){
	var allNewStudents = [];
	var student_query = 'select student_id from scores where score="-" and subject_id='+subjectId;
	db.all(student_query,function(err,studentIds){
		studentIds.forEach(function(s,index,ids){
			_getStudentSummary(s.student_id,db,function(err,student){
				student.subjects = student.subjects.filter(function(sub){
					return sub.score == '-';
				});
				allNewStudents.push(student);
				if(ids.length-1 == index){
					db.close(function(err){
						onComplete(null,allNewStudents);
						return;
					});
				}
			});

		});
	});
};