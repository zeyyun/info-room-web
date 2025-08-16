// src/app/core/models/auth.models.ts

// ======= Role types =======
export type Role =
  | 'ADMIN'
  | 'LECTURER'
  | 'CLASS_REP'
  | 'UNIVERSITY_REP'
  | 'STUDENT';

// ======= Status types =======
export type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

// ======= Register request payload (frontend -> backend) =======
// NB: Backend yako inatumia 'registrationNumber'
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;

  campus?: string;              // CLASS_REP & UNIVERSITY_REP (optional per rules)
  course?: string;              // CLASS_REP
  registrationNumber?: string;  // CLASS_REP & (optional) UNIVERSITY_REP
}

// ======= Login request/response =======
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role?: Role | string;
  name?: string;
  email?: string;
  status?: Status;
  // Ruhusu extra fields kutoka backend bila compile error
  [k: string]: any;
}

// ======= Models used in Admin area (optional but handy) =======
export interface UserRow {
  id: number;
  name: string;      // built from firstName + lastName or fallback to email name
  email: string;
  role: Role;
  status: Status;
  campus?: string;
  course?: string;
  registration?: string; // normalized from backend's registrationNumber
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
  password: string;
  status: Status;        // e.g. 'ACTIVE' when admin creates
  campus?: string;
  course?: string;
  registration?: string; // admin form field name
}
