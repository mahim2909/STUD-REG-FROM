import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { LocationService } from '../../services/location.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PreviewModalComponent } from '../preview-dialog/preview-dialog.component';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isSubmitting = false;
  isUpdateMode = false;
  currentStudentId: number | null = null;
  
  // Dropdown options
  salutations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
  genders = ['Male', 'Female', 'Other'];
  countryCodes = ['+91', '+1', '+44', '+61', '+81'];
  
  // For address dropdowns
  states: any[] = [];
  districts: any[] = [];
  blocks: any[] = [];
  
  // For preview
  validationErrors: string[] = [];
  
  // For file uploads
  profilePicture: File | null = null;
  resume: File | null = null;
  signature: File | null = null;
  marksheet10th: File | null = null;
  marksheet12th: File | null = null;
  marksheetGraduation: File | null = null;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private locationService: LocationService,
    private modalService: NgbModal
  ) {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadStates();
    
    // Subscribe to state changes to update district dropdown
    this.currentAddress.get('state')?.valueChanges.subscribe(state => {
      if (state) {
        this.loadDistricts(state, 'current');
        this.currentAddress.get('district')?.setValue('');
        this.currentAddress.get('block')?.setValue('');
      }
    });
    
    this.permanentAddress.get('state')?.valueChanges.subscribe(state => {
      if (state) {
        this.loadDistricts(state, 'permanent');
        this.permanentAddress.get('district')?.setValue('');
        this.permanentAddress.get('block')?.setValue('');
      }
    });
    
    // Subscribe to district changes to update block dropdown
    this.currentAddress.get('district')?.valueChanges.subscribe(district => {
      if (district) {
        this.loadBlocks(district, 'current');
        this.currentAddress.get('block')?.setValue('');
      }
    });
    
    this.permanentAddress.get('district')?.valueChanges.subscribe(district => {
      if (district) {
        this.loadBlocks(district, 'permanent');
        this.permanentAddress.get('block')?.setValue('');
      }
    });
    
    // Subscribe to sameAsCurrentAddress changes
    this.studentForm.get('sameAsCurrentAddress')?.valueChanges.subscribe(checked => {
      if (checked) {
        this.copyCurrentToPermanentAddress();
      } else {
        this.clearPermanentAddress();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      basic: this.fb.group({
        salutation: [this.salutations[0], [Validators.required]],
        firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        middleName: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
        lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
        dateOfBirth: ['', [Validators.required, this.pastDateValidator]],
        gender: [this.genders[0], [Validators.required]],
        countryCode: [this.countryCodes[0], [Validators.required]],
        phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        email: ['', [Validators.required, Validators.email]]
      }),
      currentAddress: this.fb.group({
        addressLine1: ['', [Validators.required]],
        addressLine2: [''],
        landmark: [''],
        pinCode: ['', [Validators.required]],
        state: ['', [Validators.required]],
        district: ['', [Validators.required]],
        block: ['', [Validators.required]]
      }),
      sameAsCurrentAddress: [false],
      permanentAddress: this.fb.group({
        addressLine1: ['', [Validators.required]],
        addressLine2: [''],
        landmark: [''],
        pinCode: ['', [Validators.required]],
        state: ['', [Validators.required]],
        district: ['', [Validators.required]],
        block: ['', [Validators.required]]
      }),
      academic: this.fb.group({
        tenthDetails: this.fb.group({
          boardUniversity: ['', [Validators.required]],
          stream: [''],
          totalMarks: [0, [Validators.required, Validators.min(0)]],
          obtainedMarks: [0, [Validators.required, Validators.min(0)]],
          percentage: [{value: 0, disabled: true}]
        }),
        twelfthDetails: this.fb.group({
          boardUniversity: ['', [Validators.required]],
          stream: [''],
          totalMarks: [0, [Validators.required, Validators.min(0)]],
          obtainedMarks: [0, [Validators.required, Validators.min(0)]],
          percentage: [{value: 0, disabled: true}]
        }),
        graduationDetails: this.fb.group({
          boardUniversity: ['', [Validators.required]],
          stream: [''],
          totalMarks: [0, [Validators.required, Validators.min(0)]],
          obtainedMarks: [0, [Validators.required, Validators.min(0)]],
          percentage: [{value: 0, disabled: true}]
        })
      })
    });
  }
  
  // Getter methods for easy access to form controls
  get basic() { return this.studentForm.get('basic') as FormGroup; }
  get currentAddress() { return this.studentForm.get('currentAddress') as FormGroup; }
  get permanentAddress() { return this.studentForm.get('permanentAddress') as FormGroup; }
  get academic() { return this.studentForm.get('academic') as FormGroup; }
  get tenthDetails() { return this.academic.get('tenthDetails') as FormGroup; }
  get twelfthDetails() { return this.academic.get('twelfthDetails') as FormGroup; }
  get graduationDetails() { return this.academic.get('graduationDetails') as FormGroup; }
  
  // Date validator to ensure date is in the past
  pastDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    
    if (selectedDate >= today) {
      return { futureDate: true };
    }
    return null;
  }
  
  loadStates() {
    this.locationService.getStates().subscribe(
      (states) => {
        this.states = states;
      },
      (error) => {
        console.error('Failed to load states:', error);
      }
    );
  }
  
  loadDistricts(stateId: number, addressType: string) {
    this.locationService.getDistrictsByState(stateId).subscribe(
      (districts) => {
        if (addressType === 'current') {
          this.districts = districts;
        } else {
          // Can be used for separate district lists if needed
          this.districts = districts;
        }
      },
      (error) => {
        console.error('Failed to load districts:', error);
      }
    );
  }
  
  loadBlocks(districtId: number, addressType: string) {
    this.locationService.getBlocksByDistrict(districtId).subscribe(
      (blocks) => {
        if (addressType === 'current') {
          this.blocks = blocks;
        } else {
          // Can be used for separate block lists if needed
          this.blocks = blocks;
        }
      },
      (error) => {
        console.error('Failed to load blocks:', error);
      }
    );
  }
  
  copyCurrentToPermanentAddress() {
    // Copy all fields from current to permanent address
    this.permanentAddress.patchValue(this.currentAddress.value);
  }
  
  clearPermanentAddress() {
    this.permanentAddress.reset();
  }
  
  // File upload handlers
  onProfilePictureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Check file type
      if (!file.type.match('image/jpe?g')) {
        alert('Profile picture must be JPG/JPEG format');
        input.value = '';
        return;
      }
      
      // Check file size (1MB = 1024 * 1024 bytes)
      if (file.size > 1024 * 1024) {
        alert('Profile picture must be under 1MB');
        input.value = '';
        return;
      }
      
      this.profilePicture = file;
    }
  }
  
  onResumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Check file type
      if (file.type !== 'application/pdf') {
        alert('Resume must be PDF format');
        input.value = '';
        return;
      }
      
      // Check file size (50KB = 50 * 1024 bytes)
      if (file.size > 50 * 1024) {
        alert('Resume must be under 50KB');
        input.value = '';
        return;
      }
      
      this.resume = file;
    }
  }
  
  onSignatureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Check file type
      if (!file.type.match('image/jpe?g')) {
        alert('Signature must be JPG/JPEG format');
        input.value = '';
        return;
      }
      
      // Check file size (70KB = 70 * 1024 bytes)
      if (file.size > 70 * 1024) {
        alert('Signature must be under 70KB');
        input.value = '';
        return;
      }
      
      this.signature = file;
    }
  }
  
  onMarksheet10thChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Check file type
      if (file.type !== 'application/pdf') {
        alert('Marksheet must be PDF format');
        input.value = '';
        return;
      }
      
      // Check file size (50KB = 50 * 1024 bytes)
      if (file.size > 50 * 1024) {
        alert('Marksheet must be under 50KB');
        input.value = '';
        return;
      }
      
      this.marksheet10th = file;
    }
  }
  
  onMarksheet12thChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Check file type
      if (file.type !== 'application/pdf') {
        alert('Marksheet must be PDF format');
        input.value = '';
        return;
      }
      
      // Check file size (50KB = 50 * 1024 bytes)
      if (file.size > 50 * 1024) {
        alert('Marksheet must be under 50KB');
        input.value = '';
        return;
      }
      
      this.marksheet12th = file;
    }
  }
  
  onMarksheetGraduationChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Check file type
      if (file.type !== 'application/pdf') {
        alert('Marksheet must be PDF format');
        input.value = '';
        return;
      }
      
      // Check file size (50KB = 50 * 1024 bytes)
      if (file.size > 50 * 1024) {
        alert('Marksheet must be under 50KB');
        input.value = '';
        return;
      }
      
      this.marksheetGraduation = file;
    }
  }
  
  // Calculate percentage automatically
  calculatePercentage(formGroup: FormGroup) {
    const totalMarks = formGroup.get('totalMarks')?.value || 0;
    const obtainedMarks = formGroup.get('obtainedMarks')?.value || 0;
    
    if (totalMarks > 0) {
      const percentage = (obtainedMarks / totalMarks) * 100;
      formGroup.get('percentage')?.setValue(percentage.toFixed(2));
    } else {
      formGroup.get('percentage')?.setValue(0);
    }
  }
  
  onTotalOrObtainedMarksChange(examType: string) {
    let formGroup: FormGroup;
    
    switch(examType) {
      case '10th':
        formGroup = this.tenthDetails;
        break;
      case '12th':
        formGroup = this.twelfthDetails;
        break;
      case 'graduation':
        formGroup = this.graduationDetails;
        break;
      default:
        return;
    }
    
    const totalMarks = formGroup.get('totalMarks')?.value || 0;
    const obtainedMarks = formGroup.get('obtainedMarks')?.value || 0;
    
    // Validate that obtained marks are not greater than total marks
    if (obtainedMarks > totalMarks) {
      formGroup.get('obtainedMarks')?.setErrors({ exceedsTotal: true });
    }
    
    this.calculatePercentage(formGroup);
  }
  
  // Form action handlers
  clearForm() {
    this.studentForm.reset();
    this.isUpdateMode = false;
    this.currentStudentId = null;
    
    // Reset default values
    this.basic.get('salutation')?.setValue(this.salutations[0]);
    this.basic.get('gender')?.setValue(this.genders[0]);
    this.basic.get('countryCode')?.setValue(this.countryCodes[0]);
    
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      input.value = '';
    });
    
    this.profilePicture = null;
    this.resume = null;
    this.signature = null;
    this.marksheet10th = null;
    this.marksheet12th = null;
    this.marksheetGraduation = null;
  }
  
  validateForm(): boolean {
    this.validationErrors = [];
    
    // Check if form is valid
    if (!this.studentForm.valid) {
      if (this.basic.invalid) {
        this.validationErrors.push('Please complete all required Basic Details correctly.');
      }
      
      if (this.currentAddress.invalid) {
        this.validationErrors.push('Please complete all required Current Address fields.');
      }
      
      if (this.permanentAddress.invalid) {
        this.validationErrors.push('Please complete all required Permanent Address fields.');
      }
      
      if (this.academic.invalid) {
        this.validationErrors.push('Please complete all required Academic Details correctly.');
      }
    }
    
    // Check for required file uploads
    if (!this.profilePicture) {
      this.validationErrors.push('Profile picture is required.');
    }
    
    if (!this.resume) {
      this.validationErrors.push('Resume is required.');
    }
    
    if (!this.signature) {
      this.validationErrors.push('Signature is required.');
    }
    
    if (!this.marksheet10th) {
      this.validationErrors.push('10th Marksheet is required.');
    }
    
    if (!this.marksheet12th) {
      this.validationErrors.push('12th Marksheet is required.');
    }
    
    if (!this.marksheetGraduation) {
      this.validationErrors.push('Graduation Marksheet is required.');
    }
    
    return this.validationErrors.length === 0;
  }
  
  previewForm() {
    if (this.validateForm()) {
      // Prepare form data for preview
      const formData = {
        ...this.studentForm.value,
        academic: {
          tenthDetails: {
            ...this.tenthDetails.value,
            percentage: this.tenthDetails.get('percentage')?.value
          },
          twelfthDetails: {
            ...this.twelfthDetails.value,
            percentage: this.twelfthDetails.get('percentage')?.value
          },
          graduationDetails: {
            ...this.graduationDetails.value,
            percentage: this.graduationDetails.get('percentage')?.value
          }
        },
        files: {
          profilePicture: this.profilePicture,
          resume: this.resume,
          signature: this.signature,
          marksheet10th: this.marksheet10th,
          marksheet12th: this.marksheet12th,
          marksheetGraduation: this.marksheetGraduation
        },
        isUpdateMode: this.isUpdateMode,
        studentId: this.currentStudentId
      };
      
      // Open preview modal
      const modalRef = this.modalService.open(PreviewModalComponent, { 
        size: 'lg',
        backdrop: 'static',
        keyboard: false 
      });
      
      modalRef.componentInstance.studentData = formData;
      
      // Handle modal close event
      modalRef.result.then(
        (result) => {
          if (result === 'submit') {
            this.submitForm();
          }
        },
        (reason) => {
          console.log('Modal dismissed');
        }
      );
    } else {
      // Scroll to first error
      setTimeout(() => {
        const errorElement = document.querySelector('.invalid-feedback');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }
  
  submitForm() {
    this.isSubmitting = true;
    
    // Create form data for API submission
    const formData = new FormData();
    
    // Add basic information
    formData.append('data', JSON.stringify(this.studentForm.value));
    
    // Add files
    if (this.profilePicture) {
      formData.append('profilePicture', this.profilePicture);
    }
    
    if (this.resume) {
      formData.append('resume', this.resume);
    }
    
    if (this.signature) {
      formData.append('signature', this.signature);
    }
    
    if (this.marksheet10th) {
      formData.append('marksheet10th', this.marksheet10th);
    }
    
    if (this.marksheet12th) {
      formData.append('marksheet12th', this.marksheet12th);
    }
    
    if (this.marksheetGraduation) {
      formData.append('marksheetGraduation', this.marksheetGraduation);
    }
    
    if (this.isUpdateMode && this.currentStudentId) {
      // Update existing student
      this.studentService.updateStudent(this.currentStudentId, formData).subscribe(
        (response) => {
          alert('Student record updated successfully!');
          this.clearForm();
          this.isSubmitting = false;
        },
        (error) => {
          console.error('Error updating student:', error);
          alert('Failed to update student record. Please try again.');
          this.isSubmitting = false;
        }
      );
    } else {
      // Create new student
      this.studentService.createStudent(formData).subscribe(
        (response) => {
          alert('Student registered successfully!');
          this.clearForm();
          this.isSubmitting = false;
        },
        (error) => {
          console.error('Error registering student:', error);
          alert('Failed to register student. Please try again.');
          this.isSubmitting = false;
        }
      );
    }
  }
  
  // For updating existing student
  loadStudent(studentId: number) {
    this.isUpdateMode = true;
    this.currentStudentId = studentId;
    
    this.studentService.getStudent(studentId).subscribe(
      (studentData) => {
        // Patch form values
        this.studentForm.patchValue({
          basic: studentData.basic,
          currentAddress: studentData.currentAddress,
          permanentAddress: studentData.permanentAddress,
          sameAsCurrentAddress: false
        });
        
        // Set academic details
        this.tenthDetails.patchValue(studentData.academic.tenthDetails);
        this.twelfthDetails.patchValue(studentData.academic.twelfthDetails);
        this.graduationDetails.patchValue(studentData.academic.graduationDetails);
        
        // Calculate percentages
        this.calculatePercentage(this.tenthDetails);
        this.calculatePercentage(this.twelfthDetails);
        this.calculatePercentage(this.graduationDetails);
        
        // Load districts and blocks based on selected state
        if (studentData.currentAddress.state) {
          this.loadDistricts(studentData.currentAddress.state, 'current');
        }
        
        if (studentData.permanentAddress.state) {
          this.loadDistricts(studentData.permanentAddress.state, 'permanent');
        }
        
        if (studentData.currentAddress.district) {
          this.loadBlocks(studentData.currentAddress.district, 'current');
        }
        
        if (studentData.permanentAddress.district) {
          this.loadBlocks(studentData.permanentAddress.district, 'permanent');
        }
        
        // Note: Files would typically be handled differently in update mode
        // For this example, we'll assume the user needs to re-upload files
      },
      (error) => {
        console.error('Error loading student data:', error);
        alert('Failed to load student data. Please try again.');
        this.isUpdateMode = false;
        this.currentStudentId = null;
      }
    );
  }
}