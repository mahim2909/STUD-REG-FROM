import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Name validator (only letters and spaces)
  static nameOnly(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      
      const valid = /^[A-Za-z\s]+$/.test(control.value);
      return valid ? null : { nameOnly: true };
    };
  }
  
  // Date validator for past dates only
  static pastDateOnly(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      
      const currentDate = new Date();
      const selectedDate = new Date(control.value);
      
      return selectedDate < currentDate ? null : { pastDateOnly: true };
    };
  }
  
  // Phone number validator (10 digits)
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      
      const valid = /^\d{10}$/.test(control.value);
      return valid ? null : { phoneNumber: true };
    };
  }
  
  // File size validator
  static maxFileSize(maxSize: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value || !(control.value instanceof File)) {
        return null;
      }
      
      const file = control.value as File;
      return file.size <= maxSize ? null : { maxFileSize: { actual: file.size, max: maxSize } };
    };
  }
  
  // File type validator
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value || !(control.value instanceof File)) {
        return null;
      }
      
      const file = control.value as File;
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      return allowedTypes.includes(fileExtension) ? null : { fileType: { actual: fileExtension, allowed: allowedTypes } };
    };
  }
  
  // Validator for marks (obtained marks <= total marks)
  static marksValidator(totalMarksControlName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value || !control.parent) {
        return null;
      }
      
      const totalMarksControl = control.parent.get(totalMarksControlName);
      if (!totalMarksControl || !totalMarksControl.value) {
        return null;
      }
      
      const obtainedMarks = parseFloat(control.value);
      const totalMarks = parseFloat(totalMarksControl.value);
      
      return obtainedMarks <= totalMarks ? null : { marksExceed: true };
    };
  }
}