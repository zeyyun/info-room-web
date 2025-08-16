import { Component, Input } from '@angular/core';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string; // 'ACTIVE'|'SUSPENDED' etc
}

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.css']
})
export class UsersTableComponent {
  @Input() users: UserRow[] = [];
}
