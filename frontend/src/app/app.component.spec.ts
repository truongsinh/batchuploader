import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should render first row of data', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('tr:nth-child(2) > td:nth-child(1)').textContent).toBe('Etihad');
    expect(compiled.querySelector('tr:nth-child(2) > td:nth-child(2)').textContent).toBe('3/5/16, 6:07 AM');
    expect(compiled.querySelector('tr:nth-child(2) > td:nth-child(3)').textContent).toBe('3/5/16, 6:08 AM');
    expect(compiled.querySelector('tr:nth-child(2) > td:nth-child(4)').textContent).toBe('completed');
    expect(compiled.querySelector('tr:nth-child(2) > td:nth-child(5)').textContent).toBe('8');
  }));
  it('should render second row of data', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('tr:nth-child(3) > td:nth-child(1)').textContent).toBe('Zolo');
    expect(compiled.querySelector('tr:nth-child(3) > td:nth-child(2)').textContent).toBe('7/9/98, 4:00 PM');
    expect(compiled.querySelector('tr:nth-child(3) > td:nth-child(3)').textContent).toBe('')
    expect(compiled.querySelector('tr:nth-child(3) > td:nth-child(4)').textContent).toBe('incomplete');
    expect(compiled.querySelector('tr:nth-child(3) > td:nth-child(5)').textContent).toBe('0');
  }));
});
