// In your student-list.component.ts file
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

// Add this interface to match your API response
interface StudentListItem {
  id: number;
  salutation: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  email: string;
  // Add any other properties that come from your API
}

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.scss']
})
export class StudentListComponent implements OnInit {
  students: StudentListItem[] = []; // Change the type here
  loading: boolean = true;
  error: string = '';
  
  @Output() updateStudent = new EventEmitter<number>(); // Change to emit the ID instead

  constructor(private studentService: StudentService) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getAllStudents().subscribe({
      next: (data: StudentListItem[]) => {
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