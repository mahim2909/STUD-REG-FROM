// In your student-list.component.ts file
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  students: Student[] = []; // Changed to use the Student model from your models directory
  loading: boolean = true;
  error: string = '';
  
  @Output() updateStudent = new EventEmitter<number>();

  constructor(private studentService: StudentService) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getAllStudents().subscribe({
      next: (data) => { // Removed explicit type annotation
        this.students = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load students. Please try again later.';
        this.loading = false;
        console.error('Error loading students:', err);
      }
    });
  }

  onUpdate(studentId: number): void {
    this.updateStudent.emit(studentId);
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this student record?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.students = this.students.filter(student => student.id !== id);
        },
        error: (err) => {
          alert('Failed to delete student record. Please try again.');
          console.error('Error deleting student:', err);
        }
      });
    }
  }
}