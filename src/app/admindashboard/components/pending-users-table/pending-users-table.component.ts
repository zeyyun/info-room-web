import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'CLASS_REP' | 'UNIVERSITY_REP';
  status: 'PENDING';
}

@Component({
  selector: 'app-pending-users-table',
  templateUrl: './pending-users-table.component.html',
  styleUrls: ['./pending-users-table.component.css']
})
export class PendingUsersTableComponent {
  @Input() users: PendingUser[] = [];
  @Output() approve = new EventEmitter<number>();
  @Output() suspend = new EventEmitter<number>();
  @Output() remove  = new EventEmitter<number>();

  isOpen = true;

  toggle() { this.isOpen = !this.isOpen; }

  onApprove(id: number) { this.approve.emit(id); }
  onSuspend(id: number) { this.suspend.emit(id); }
  onDelete(id: number)  { this.remove.emit(id); }
}
