import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chatwindow } from './chatwindow';

describe('Chatwindow', () => {
  let component: Chatwindow;
  let fixture: ComponentFixture<Chatwindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatwindow]
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
