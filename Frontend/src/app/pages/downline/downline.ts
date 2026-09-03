import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Api } from '../../services/api';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';


@Component({
  imports: [Header, Footer],
  selector: 'app-downline',
  styleUrl: './downline.css',
  templateUrl: './downline.html',
  standalone: true,
})
export class Downline implements OnInit{
  private api = inject(Api);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  users: any[] = [];
  currentUser: any = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    this.route.paramMap.subscribe(params => {
      const userId = params.get('userId');

      this.loadDownline(userId);
    });
  }

  loadDownline(userId: string | null) {
    this.isLoading = true;
    this.errorMessage = '';

    const request = userId
      ? this.api.getUserDownline(userId)
      : this.api.getMyDownline();

    request.subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.users = response.data;
        console.log('Downline response:', response);
        this.cdr.detectChanges();
      },

      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Unable to load downline.';
        this.cdr.detectChanges();
      },
    });
  }

  get canCreateUser(): boolean {
    return this.currentUser?.level < 4;
  }

  get createRole(): string {
    switch (this.currentUser?.level) {
      case 1:
        return 'Sub Admin';

      case 2:
        return 'Admin';

      case 3:
        return 'Agent';

      default:
        return '';
    }
  }

  addUser() {
    this.router.navigate(['/create-user']);
  }

  openDownline(userId: string) {
    this.router.navigate(['/downline', userId]);
  }
}
