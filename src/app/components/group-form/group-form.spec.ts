import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupForm } from './group-form';

describe('GroupForm', () => {
  let component: GroupForm;
  let fixture: ComponentFixture<GroupForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
