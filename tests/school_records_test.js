var lib = require('../own_modules/school_records');
var assert = require('chai').assert;
var fs = require('fs');
var dbFileData = fs.readFileSync('tests/data/school.db.backup');
//CREATE TABLE STUDENTS(name text, grade text);
//INSERT INTO STUDENTS VALUES ('Abu','one'), ('Babu','one')

var school_records;
describe('school_records',function(){
	beforeEach(function(){
		fs.writeFileSync('tests/data/school.db',dbFileData);
		school_records = lib.init('tests/data/school.db');
	});
	
	describe('#getGrades',function(){
		it('retrieves 2 grades',function(done){
			school_records.getGrades(function(err,grades){
				assert.deepEqual(grades,[{id:1,name:'1st std'},{id:2,name:'2nd std'}]);
				done();
			})
		})
	})

	describe('#getStudentsByGrade',function(){
		it('retrieves the students in the 2 grades',function(done){
			school_records.getStudentsByGrade(function(err,grades){
				assert.lengthOf(grades,2);
				assert.lengthOf(grades[0].students,4);
				assert.lengthOf(grades[1].students,3);
				done();
			})
		})
	})

	describe('#getSubjectsByGrade',function(){
		it('retrieves the subjects in the 2 grades',function(done){
			school_records.getSubjectsByGrade(function(err,grades){
				assert.lengthOf(grades,2);
				assert.lengthOf(grades[0].subjects,3);
				assert.lengthOf(grades[1].subjects,0);
				done();
			})
		})
	})

	describe('#getStudentSummary',function(){
		it('retrieves the summary of the student Abu',function(done){
			school_records.getStudentSummary(1, function(err,s){				
				assert.equal(s.name,'Abu');
				assert.equal(s.grade_name,'1st std');
				assert.deepEqual(s.subjects,[{id:1,name:'English-1',score:75,maxScore:100},
					{id:2,name:'Maths-1',score:50,maxScore:100},
					{id:3,name:'Moral Science',score:25,maxScore:50}]);
				done();
			})
		})

		it('retrieves nothing of the non existent student',function(done){
			school_records.getStudentSummary(9, function(err,s){
				assert.notOk(err);
				assert.notOk(s);				
				done();
			})
		})
	})
	describe('#getGradeSummary',function(){
		it('retrieves the summary of grade 1',function(done){
			school_records.getGradeSummary(1,function(err,grade){
				assert.notOk(err);
				assert.equal(grade.name,'1st std');
				assert.deepEqual(grade.subjects,[{id:1,name:'English-1'},
					{id:2,name:'Maths-1'},
					{id:3,name:'Moral Science'}]);
				assert.deepEqual(grade.students,[{id:1,name:'Abu'},
					{id:2,name:'Babu'},
					{id:3,name:'Kabu'},
					{id:4,name:'Dabu'}]);
				assert.equal(grade.id,1);
				done();
			})
		})
	})


	describe('#getSubjectSummary',function(){
		it('retrieves the summary of subject 1',function(done){
			school_records.getSubjectSummary(1,function(err,subject){
				assert.notOk(err);
				assert.equal(subject[0].subject_name,'English-1');
				assert.deepEqual(subject, [{ subject_id: 1,
 						 subject_name: 'English-1',
 						 maxScore: 100,
 						 grade_id: 1,
 						 grade_name: '1st std',
 						 student_name: 'Abu',
 						 student_id: 1,
 						 score: 75 }]);
				done();
			});
		});
	});

	describe('#renameGrade',function(){
		it('edits the grade name',function(done){
			school_records.updateGrade({id:1,newname:'class--1'},function(err){
				assert.notOk(err);
				school_records.getGradeSummary(1,function(egs,grade){
					assert.deepEqual(grade.name,'class--1');
					done();
				});
			});
		});
	});

	describe('#updateStudentSummary',function(){
		it('update student summary',function(done){
			var newStudent = {studentId:1,studentName:'Vishnu',
							gradeName:'1st std',subId_1:20,subId_2:23,subId_3:50};
			var expected1 = [{id:1,name:'English-1',score:20,maxScore:100},
							{id:2,name:'Maths-1',score:23,maxScore:100},
							{id:3,name:'Moral Science',score:50,maxScore:50}];

			var expected2 =  [{ name: 'Maths-1', id: 2, maxScore: 100, score: 200 }];		

			school_records.updateStudentSummary(newStudent,function(err){
				assert.notOk(err);
				school_records.getStudentSummary(2,function(ess,s2){
					assert.equal(s2.name,'Babu');
					assert.equal(s2.grade_name,'1st std');
					assert.deepEqual(s2.subjects,expected2);

					school_records.getStudentSummary(1,function(ess,s1){
						assert.equal(s1.name,'Vishnu');
						assert.equal(s1.grade_id,'1');
						assert.deepEqual(s1.subjects,expected1);
						done();
					});
				});
			});
		});
	});
	describe('#updateSubjectSummary',function(){
		it('update subjects summary',function(done){
			var new_subject = {subject_id:2,subject_name:'Phoose Ball',grade_name:'2nd std',maxScore:50};
			school_records.updateSubjectSummary(new_subject,function(err){
				assert.notOk(err);
				school_records.getSubjectSummary(2,function(esb,sub){
					assert.equal(sub[0].subject_name,'Phoose Ball');
					assert.equal(sub[0].maxScore,50);
					assert.equal(sub[0].grade_id,1);
					done();
				});
			});
		});		
	});

	//adding
	describe('#addNewStudent',function(){
		it('add new student',function(done){
			var new_student = {'$student_name':"Pinky",'$grade_id':1};
			school_records.addNewStudent(new_student,function(err){
				assert.notOk(err);
				school_records.getStudentSummary(8,function(est,s){
					assert.equal(s.name,'Pinky');
					assert.equal(s.grade_name,'1st std');
					var subjects = JSON.stringify(s.subjects);
					var s1 = JSON.stringify({"name":"English-1","id":1,"maxScore":100,"score":"-"});
					var s2 = JSON.stringify({"name":"Maths-1","id":2,"maxScore":100,"score":"-"});
					var s3 = JSON.stringify({"name":"Moral Science","id":3,"maxScore":50,"score":"-"});
	
					assert.ok(subjects.indexOf(s1) >= 0);
					assert.ok(subjects.indexOf(s2) >= 0);
					assert.ok(subjects.indexOf(s3) >= 0);
					done();
				});
			});
		});
	});

	describe('#addNewSubject',function(){
		it('add new subject',function(done){
			var new_subject = {'$subject_name':"French",'$grade_id':1,'$maxScore':50};
			school_records.addNewSubject(new_subject,function(err){
				assert.notOk(err);
				school_records.getSubjectSummary(4,function(est,s){
					assert.equal(s.length,4);
					assert.equal(s[0].score,'-');
					assert.equal(s[0].subject_name,'French');
					assert.equal(s[0].grade_name,'1st std');
					assert.equal(s[0].maxScore,50);
					done();
				});
			});
		});
	});

	describe('#updateSubjectSummary',function(){
		it('update score of student',function(done){
			var new_subject = {'$score_1':30,'$subject_id':3};
			// school_records.updateSubjectSummary(new_subject,function(err){
			// 	assert.notOk(err);
			// 	school_records.getStudentSummary(1,function(esb,s){
			// 		assert.equal(s.name,'Abu');
			// 		assert.equal(s.grade_name,'1st std');
			// 		assert.deepEqual(s.subjects,[{id:1,name:'English-1',score:75,maxScore:100},
			// 		{id:2,name:'Maths-1',score:50,maxScore:100},
			// 		{id:3,name:'Moral Science',score:25,maxScore:50}]);
			// 	});
			// });
			
			var new_subject_detail = {'$subject_name':"Spanish",'$grade_id':1,'$maxScore':50};
			school_records.addNewSubject(new_subject_detail,function(err){
				assert.notOk(err);
				var new_subject = {'$score_1':30,'$subject_id':4};
				school_records.updateSubjectSummary(new_subject,function(er){
				
					assert.notOk(er);

					school_records.getSubjectSummary(4,function(esb,s){
						
						var student_1st = s.filter(function(subject){return subject.student_id==1;})[0];

						 assert.equal(student_1st.score,30);
						
						done();
					});
				});
			});
		});	

	});
});