export interface Student {
    id?: number;
    salutation: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    country_code: string;
    phone_number: string;
    email: string;
    current_address_line1: string;
    current_address_line2?: string;
    current_landmark?: string;
    current_pincode: string;
    current_state: string;
    current_district: string;
    current_block: string;
    same_as_current: boolean;
    permanent_address_line1: string;
    permanent_address_line2?: string;
    permanent_landmark?: string;
    permanent_pincode: string;
    permanent_state: string;
    permanent_district: string;
    permanent_block: string;
    profile_picture?: File | string;
    resume?: File | string;
    signature?: File | string;
    academics?: AcademicDetail[];
  }
  
  export interface AcademicDetail {
    id?: number;
    student_id?: number;
    exam_type: '10th' | '12th' | 'Graduation';
    board_university: string;
    stream: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    marksheet?: File | string;
  }
  
  export interface StudentListItem {
    id: number;
    salutation: string;
    name: string;
    phone_number: string;
    email: string;
  }