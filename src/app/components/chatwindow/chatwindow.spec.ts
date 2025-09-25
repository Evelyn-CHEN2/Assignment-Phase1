import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Chatwindow } from './chatwindow';

describe('Chatwindow', () => {
  let component: Chatwindow;
  let fixture: ComponentFixture<Chatwindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatwindow],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: {
            paramMap: of(convertToParamMap({ id: '123' })),
            snapshot: { paramMap: convertToParamMap({ id: '123' }) }
        }},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chatwindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
