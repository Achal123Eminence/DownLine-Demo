import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Downline } from './downline';

describe('Downline', () => {
  let component: Downline;
  let fixture: ComponentFixture<Downline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Downline],
    }).compileComponents();

    fixture = TestBed.createComponent(Downline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
