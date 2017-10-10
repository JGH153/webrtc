import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoClientComponent } from './video-client.component';

describe('VideoClientComponent', () => {
  let component: VideoClientComponent;
  let fixture: ComponentFixture<VideoClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
