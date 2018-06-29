/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ImageManipulationComponent } from './image-manipulation.component';

describe('ImageManipulationComponent', () => {
  let component: ImageManipulationComponent;
  let fixture: ComponentFixture<ImageManipulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageManipulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageManipulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
