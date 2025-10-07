import { TestBed } from '@angular/core/testing';

import { PeerVideo } from './peer-video';

describe('PeerVideo', () => {
  let service: PeerVideo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeerVideo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
