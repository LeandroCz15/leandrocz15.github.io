import { ShouldShowPipe } from './should-show.pipe';

describe('ShouldShowPipe', () => {
  it('create an instance', () => {
    const pipe = new ShouldShowPipe();
    expect(pipe).toBeTruthy();
  });
});
