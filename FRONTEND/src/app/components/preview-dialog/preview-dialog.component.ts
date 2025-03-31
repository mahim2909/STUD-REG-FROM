import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss']
})
export class PreviewModalComponent implements OnInit {
  @Input() studentData: any;
  
  // For displaying file names
  profilePictureName: string = '';
  resumeName: string = '';
  signatureName: string = '';
  marksheet10thName: string = '';
  marksheet12thName: string = '';
  marksheetGraduationName: string = '';
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    // Extract file names for display
    if (this.studentData.files) {
      if (this.studentData.files.profilePicture) {
        this.profilePictureName = this.studentData.files.profilePicture.name;
      }
      
      if (this.studentData.files.resume) {
        this.resumeName = this.studentData.files.resume.name;
      }
      
      if (this.studentData.files.signature) {
        this.signatureName = this.studentData.files.signature.name;
      }
      
      if (this.studentData.files.marksheet10th) {
        this.marksheet10thName = this.studentData.files.marksheet10th.name;
      }
      
      if (this.studentData.files.marksheet12th) {
        this.marksheet12thName = this.studentData.files.marksheet12th.name;
      }
      
      if (this.studentData.files.marksheetGraduation) {
        this.marksheetGraduationName = this.studentData.files.marksheetGraduation.name;
      }
    }
  }
  
  // Get full name for display
  getFullName(): string {
    const basic = this.studentData.basic;
    let fullName = basic.salutation + ' ' + basic.firstName;
    
    if (basic.middleName) {
      fullName += ' ' + basic.middleName;
    }
    
    fullName += ' ' + basic.lastName;
    return fullName;
  }
  
  // Format address for display
  formatAddress(address: any): string {
    let formattedAddress = address.addressLine1;
    
    if (address.addressLine2) {
      formattedAddress += ', ' + address.addressLine2;
    }
    
    if (address.landmark) {
      formattedAddress += ', Near ' + address.landmark;
    }
    
    formattedAddress += ', Block: ' + address.block;
    formattedAddress += ', District: ' + address.district;
    formattedAddress += ', State: ' + address.state;
    formattedAddress += ', PIN: ' + address.pinCode;
    
    return formattedAddress;
  }
  
  // Close modal with submit action
  submitForm() {
    if (confirm('Are you sure you want to submit this form?')) {
      this.activeModal.close('submit');
    }
  }
  
  // Close modal without action
  goBack() {
    this.activeModal.dismiss('cancel');
  }
}