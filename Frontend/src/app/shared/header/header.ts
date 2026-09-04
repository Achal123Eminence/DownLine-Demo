import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
  standalone: true
})
export class Header {

  private router = inject(Router);

  username = '';
  role = '';

  ngOnInit() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const user = JSON.parse(storedUser);

      this.username = user.username || '';
      this.role = this.getRoleName(user.level);
    }
  }

  private getRoleName(level: number): string {
    switch (level) {
      case 1:
        return 'Owner';
      case 2:
        return 'Sub Admin';
      case 3:
        return 'Admin';
      case 4:
        return 'Agent';
      default:
        return 'User';
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    this.router.navigate(['/login']);
  }
}